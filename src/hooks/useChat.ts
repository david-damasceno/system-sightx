
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession } from "../types";
import { useMode } from "../contexts/ModeContext";
import { supabase, schemaTable } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface AiTypingState {
  isTyping: boolean;
  partialMessage: string;
  fullMessage: string;
  progress: number;
}

const useChat = (existingChatId?: string) => {
  const { mode } = useMode();
  const { user, tenant } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [aiTyping, setAiTyping] = useState<AiTypingState>({
    isTyping: false,
    partialMessage: "",
    fullMessage: "",
    progress: 0
  });

  // Função para carregar as mensagens do esquema do usuário
  const loadChatSessions = async () => {
    if (!user) return;
    
    try {
      // Se temos um ID específico de chat e já possuímos mensagens, não precisamos recarregar
      if (existingChatId && messages.length > 0) {
        return;
      }
      
      // Se não temos schema do tenant ainda, usamos dados simulados
      if (!tenant || !tenant.schema_name) {
        if (existingChatId) {
          // Simulamos uma única sessão com mensagens de boas-vindas
          const mockSession: ChatSession = {
            id: existingChatId,
            title: "Nova conversa",
            messages: [{
              id: uuidv4(),
              content: "Bem-vindo ao chat! O sistema está sendo configurado em segundo plano.",
              senderId: "ai",
              timestamp: new Date(),
              isAI: true
            }],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setChatSession(mockSession);
          setMessages(mockSession.messages);
        }
        return;
      }
      
      // Usando o esquema específico do usuário para carregar as sessões
      const schema = tenant.schema_name;
      const { data: sessions, error } = await schemaTable(schema, 'chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) {
        console.error("Erro ao buscar sessões:", error);
        return;
      }

      if (sessions) {
        // Converter os dados para o formato esperado
        const formattedSessions: ChatSession[] = await Promise.all(
          sessions.map(async (session: any) => {
            // Carregar mensagens para cada sessão
            const { data: messageData, error: messagesError } = await schemaTable(schema, 'chat_messages')
              .select('*')
              .eq('session_id', session.id)
              .order('timestamp', { ascending: true });
              
            if (messagesError) {
              console.error("Erro ao buscar mensagens:", messagesError);
              return {
                id: session.id,
                title: session.title,
                messages: [],
                createdAt: new Date(session.created_at),
                updatedAt: new Date(session.updated_at)
              };
            }
            
            // Formatar mensagens
            const formattedMessages: Message[] = messageData?.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              senderId: msg.sender_id,
              isAI: msg.is_ai,
              timestamp: new Date(msg.timestamp),
              ...(msg.attachment && {
                attachment: {
                  name: msg.attachment.name,
                  type: msg.attachment.type,
                  url: msg.attachment.url
                }
              })
            })) || [];
            
            return {
              id: session.id,
              title: session.title,
              messages: formattedMessages,
              createdAt: new Date(session.created_at),
              updatedAt: new Date(session.updated_at)
            };
          })
        );
        
        setChatHistory(formattedSessions);
        
        // Se temos um ID específico de chat, carregamos ele
        if (existingChatId) {
          const existingChat = formattedSessions.find(c => c.id === existingChatId);
          if (existingChat) {
            setChatSession(existingChat);
            setMessages(existingChat.messages);
          } else {
            // Se não encontramos, pode ser um novo chat
            const newSession: ChatSession = {
              id: existingChatId,
              title: "Nova conversa",
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setChatSession(newSession);
            setMessages([]);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de chat:", error);
      // Não mostramos toast de erro para não interromper a experiência
      // Usamos um estado vazio
      if (existingChatId) {
        const mockSession: ChatSession = {
          id: existingChatId,
          title: "Nova conversa",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setChatSession(mockSession);
        setMessages([]);
      }
    }
  };

  // Salvar nova sessão no esquema do usuário
  const saveNewSession = async (session: ChatSession) => {
    if (!user || !tenant || !tenant.schema_name) {
      console.log("Armazenamento temporário (tenant não configurado):", session);
      return;
    }
    
    try {
      const schema = tenant.schema_name;
      
      // Salvar sessão
      const { error: sessionError } = await schemaTable(schema, 'chat_sessions')
        .insert({
          id: session.id,
          title: session.title,
          user_id: user.id,
          created_at: session.createdAt.toISOString(),
          updated_at: session.updatedAt.toISOString()
        });
        
      if (sessionError) throw sessionError;
      
      // Salvar mensagens
      if (session.messages.length > 0) {
        const messagesToInsert = session.messages.map(msg => ({
          id: msg.id,
          session_id: session.id,
          content: msg.content,
          // Correção aqui: mudamos de sender_id para senderId
          sender_id: msg.senderId,
          is_ai: msg.isAI,
          timestamp: msg.timestamp.toISOString(),
          attachment: msg.attachment
        }));
        
        const { error: messagesError } = await schemaTable(schema, 'chat_messages')
          .insert(messagesToInsert);
          
        if (messagesError) throw messagesError;
      }
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
      // Não mostramos toast de erro para não interromper a experiência
    }
  };

  // Atualizar sessão existente
  const updateSession = async (session: ChatSession, newMessages: Message[]) => {
    if (!user || !tenant || !tenant.schema_name) {
      console.log("Atualização temporária (tenant não configurado):", session, newMessages);
      return;
    }
    
    try {
      const schema = tenant.schema_name;
      
      // Atualizar sessão
      const { error: sessionError } = await schemaTable(schema, 'chat_sessions')
        .update({
          title: session.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
        
      if (sessionError) throw sessionError;
      
      // Inserir novas mensagens
      if (newMessages.length > 0) {
        const messagesToInsert = newMessages.map(msg => ({
          id: msg.id,
          session_id: session.id,
          content: msg.content,
          // Correção aqui: mudamos de sender_id para senderId
          sender_id: msg.senderId,
          is_ai: msg.isAI,
          timestamp: msg.timestamp.toISOString(),
          attachment: msg.attachment
        }));
        
        const { error: messagesError } = await schemaTable(schema, 'chat_messages')
          .insert(messagesToInsert);
          
        if (messagesError) throw messagesError;
      }
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      // Não mostramos toast de erro para não interromper a experiência
    }
  };

  // Carregar histórico de chat quando o usuário ou modo mudar
  useEffect(() => {
    if (user) {
      loadChatSessions();
    } else {
      setChatHistory([]);
      if (!existingChatId) {
        setChatSession(null);
        setMessages([]);
      }
    }
  }, [user, mode, tenant]);

  // Efeito de digitação do AI
  useEffect(() => {
    let interval: number | null = null;
    
    if (aiTyping.isTyping) {
      interval = window.setInterval(() => {
        setAiTyping(prev => {
          const nextLen = Math.min(prev.fullMessage.length, prev.partialMessage.length + 2 + Math.floor(Math.random() * 3));
          const nextPartial = prev.fullMessage.substring(0, nextLen);
          const progress = nextLen / prev.fullMessage.length;
          
          // Se completou, para o intervalo
          if (nextLen === prev.fullMessage.length) {
            if (interval) clearInterval(interval);
            return {
              ...prev, 
              partialMessage: prev.fullMessage,
              progress: 1,
              isTyping: false
            };
          }
          
          return {
            ...prev,
            partialMessage: nextPartial,
            progress
          };
        });
      }, 25);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [aiTyping.isTyping]);

  // Função para chamar a API do Azure OpenAI
  const callAzureOpenAI = async (content: string, messageHistory: Message[]): Promise<string> => {
    try {
      // Verificar se o tenant está configurado e criar uma resposta de fallback caso não esteja
      if (!tenant) {
        console.warn("Tenant não está configurado, usando resposta de fallback");
        return "Olá! Parece que seu ambiente ainda está sendo configurado. Por favor, aguarde um momento enquanto nossos sistemas são inicializados. Você poderá conversar normalmente em breve!";
      }
      
      // Preparar o formato de mensagens para a API
      const formattedHistory = messageHistory.map(msg => ({
        content: msg.content,
        isAI: msg.isAI,
      }));

      // Log para debug
      console.log("Chamando Azure OpenAI com:", { 
        messageCount: formattedHistory.length,
        mode: mode,
        tenantId: tenant.id
      });

      // Chamar a Edge Function do Supabase
      const { data, error } = await supabase.functions.invoke('azure-openai-chat', {
        body: {
          messages: formattedHistory,
          userMode: mode,
          tenantId: tenant.id,
          stream: false
        }
      });

      if (error) {
        console.error("Erro ao chamar Azure OpenAI via Edge Function:", error);
        throw error;
      }

      // Verificar se temos uma resposta válida
      if (!data || !data.message) {
        console.error("Resposta inválida da Edge Function:", data);
        throw new Error("Resposta inválida da API do Azure OpenAI");
      }

      console.log("Resposta da IA recebida com sucesso", {
        messageLength: data.message.length,
      });

      return data.message;
    } catch (e) {
      console.error("Erro no chat com Azure OpenAI:", e);
      // Em caso de erro, mostramos um toast para o usuário
      toast.error("Erro ao processar mensagem. Por favor, tente novamente.");
      
      // Retornar uma mensagem de erro amigável para mostrar ao usuário
      return "Desculpe, ocorreu um problema ao processar sua mensagem. Isso pode acontecer quando o sistema ainda está sendo configurado. Por favor, tente novamente em alguns instantes.";
    }
  };

  // Função principal para enviar mensagem
  const sendMessage = async (content: string, file?: File) => {
    if (!user) return;

    // Criar mensagem do usuário com anexo opcional
    const userMessage: Message = {
      id: uuidv4(),
      content,
      senderId: "user",
      timestamp: new Date(),
      isAI: false,
      ...(file && {
        attachment: {
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        }
      })
    };

    // Verificar se precisamos criar uma nova sessão
    const needNewSession = !chatSession;
    let currentSession = chatSession;
    
    if (needNewSession) {
      // Criar nova sessão
      currentSession = {
        id: uuidv4(),
        title: generateChatTitle(content),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChatSession(currentSession);
      
      // Atualizar a sessão com a mensagem do usuário
      currentSession.messages = [userMessage];
      
      // Atualizar mensagens
      setMessages([userMessage]);
      
      // Adicionar ao histórico local
      setChatHistory(prev => [currentSession!, ...prev]);
      
      // Salvar no esquema do usuário
      saveNewSession(currentSession);
    } else {
      // Atualizar mensagens na sessão existente
      currentSession.messages = [...currentSession.messages, userMessage];
      setMessages(prev => [...prev, userMessage]);
    }

    // Iniciar "pensamento" do AI
    setIsProcessing(true);

    // Criar mensagem do AI vazia para iniciar
    const aiMessage: Message = {
      id: uuidv4(),
      content: "",
      senderId: "ai",
      timestamp: new Date(),
      isAI: true,
    };

    // Adicionar a mensagem com conteúdo vazio, iremos atualizá-la quando obtivermos a resposta
    setMessages(prev => [...prev, aiMessage]);

    try {
      let aiResponse = "";
      let fileComment = "";
      
      if (file) {
        // Sempre usar comentário pessoal já que o modo é sempre pessoal
        fileComment = `\n\nVi que você anexou um arquivo "${file.name}". Posso analisar seu conteúdo.`;
      }
      
      console.log("Chamando Azure OpenAI API para responder à mensagem");
      
      // Chamar a API do Azure OpenAI para obter resposta
      const messageHistory = [...currentSession.messages];
      
      try {
        aiResponse = await callAzureOpenAI(content, messageHistory);
        
        if (aiResponse && fileComment) {
          aiResponse += fileComment;
        }
      } catch (error) {
        console.error("Erro ao chamar Azure OpenAI:", error);
        aiResponse = "Desculpe, ocorreu um problema ao processar sua mensagem. Por favor, tente novamente mais tarde ou verifique se seu ambiente está configurado corretamente.";
      }
      
      // Iniciar efeito de digitação
      setAiTyping({
        isTyping: true,
        partialMessage: "",
        fullMessage: aiResponse,
        progress: 0
      });
      
      // Configurar intervalo para verificar status de digitação e finalizar quando terminar
      const checkTypingInterval = setInterval(() => {
        if (!aiTyping.isTyping) {
          clearInterval(checkTypingInterval);
          
          // Finalizar a mensagem com o conteúdo completo
          const updatedAiMessage = {...aiMessage, content: aiResponse};
          
          setMessages(prev => 
            prev.map(msg => msg.id === aiMessage.id 
              ? updatedAiMessage 
              : msg
            )
          );
          
          // Atualizar a sessão de chat
          if (currentSession) {
            const newMessages = [userMessage, updatedAiMessage];
            const updatedSession = {
              ...currentSession,
              messages: [...currentSession.messages, updatedAiMessage],
              updatedAt: new Date(),
            };
            
            setChatSession(updatedSession);
            
            // Atualizar histórico de chat local
            setChatHistory(prev => 
              prev.map(chat => 
                chat.id === updatedSession.id ? updatedSession : chat
              )
            );
            
            // Salvar no esquema do usuário
            updateSession(currentSession, newMessages);
          }
          
          setIsProcessing(false);
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      // Em caso de erro, adicionar mensagem de erro como resposta do AI
      const errorMessage = "Desculpe, ocorreu um problema ao processar sua mensagem. Por favor, tente novamente mais tarde.";
      
      // Atualizar a mensagem do AI com o erro
      setMessages(prev => 
        prev.map(msg => msg.id === aiMessage.id 
          ? {...msg, content: errorMessage} 
          : msg
        )
      );
      
      // Atualizar a sessão de chat
      if (currentSession) {
        const updatedAiMessage = {...aiMessage, content: errorMessage};
        const newMessages = [userMessage, updatedAiMessage];
        const updatedSession = {
          ...currentSession,
          messages: [...currentSession.messages, updatedAiMessage],
          updatedAt: new Date(),
        };
        
        setChatSession(updatedSession);
        
        // Atualizar histórico de chat local
        setChatHistory(prev => 
          prev.map(chat => 
            chat.id === updatedSession.id ? updatedSession : chat
          )
        );
        
        // Salvar no esquema do usuário
        updateSession(currentSession, newMessages);
      }
      
      setIsProcessing(false);
    }
  };

  const generateChatTitle = (firstMessage: string) => {
    // Gerar um título a partir das primeiras palavras
    const words = firstMessage.split(" ");
    const shortTitle = words.slice(0, 3).join(" ");
    return shortTitle.length < 20 ? shortTitle : shortTitle.substring(0, 20) + "...";
  };

  const deleteChat = async (chatId: string) => {
    if (!user || !tenant || !tenant.schema_name) return;
    
    try {
      const schema = tenant.schema_name;
      
      // Excluir mensagens primeiro (devido à restrição de chave estrangeira)
      const { error: messagesError } = await schemaTable(schema, 'chat_messages')
        .delete()
        .eq('session_id', chatId);
        
      if (messagesError) throw messagesError;
      
      // Excluir a sessão
      const { error: sessionError } = await schemaTable(schema, 'chat_sessions')
        .delete()
        .eq('id', chatId);
        
      if (sessionError) throw sessionError;
      
      // Remover do histórico local
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
      // Limpar sessão atual se foi a que excluímos
      if (chatSession?.id === chatId) {
        setChatSession(null);
        setMessages([]);
      }
      
      toast.success("Conversa excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir conversa:", error);
      toast.error("Erro ao excluir conversa");
    }
  };

  const clearAllChats = async () => {
    if (!user || !tenant || !tenant.schema_name) return;
    
    try {
      const schema = tenant.schema_name;
      
      // Excluir todas as mensagens do usuário
      const { error: messagesError } = await schemaTable(schema, 'chat_messages')
        .delete()
        .in(
          'session_id', 
          chatHistory.map(chat => chat.id)
        );
        
      if (messagesError) throw messagesError;
      
      // Excluir todas as sessões do usuário
      const { error: sessionsError } = await schemaTable(schema, 'chat_sessions')
        .delete()
        .eq('user_id', user.id);
        
      if (sessionsError) throw sessionsError;
      
      // Limpar estados locais
      setChatHistory([]);
      setChatSession(null);
      setMessages([]);
      
      toast.success("Todas as conversas foram excluídas");
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
      toast.error("Erro ao limpar histórico de conversas");
    }
  };

  return {
    messages,
    sendMessage,
    isProcessing,
    chatSession,
    chatHistory,
    aiTyping,
    deleteChat,
    clearAllChats,
  };
};

export default useChat;
