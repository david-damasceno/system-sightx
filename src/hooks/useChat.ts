
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession } from "../types";
import { useMode } from "../contexts/ModeContext";
import { supabase, schemaTable } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

// Constantes para a URL e chave do Supabase
const SUPABASE_URL = "https://nhpqzxhbdiurhzjpghqz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ocHF6eGhiZGl1cmh6anBnaHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTE2OTQsImV4cCI6MjA1OTUyNzY5NH0.vkZG5hKj81QChwxhKU1dpiCUzUGO1Mmj1DKJ3-y1pRM";

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

  // Função para verificar se o tenant está pronto
  const isTenantReady = () => {
    return tenant && tenant.schema_name && tenant.status === 'active';
  };

  // Função para carregar as mensagens do esquema do usuário
  const loadChatSessions = async () => {
    if (!user) return;
    
    try {
      // Se temos um ID específico de chat e já possuímos mensagens, não precisamos recarregar
      if (existingChatId && messages.length > 0) {
        return;
      }
      
      // Se não temos schema do tenant ainda ou o tenant não está ativo, usar dados temporários
      if (!isTenantReady()) {
        console.log("Tenant não está ativo, criando sessão temporária");
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
        return;
      }
      
      // Usando o esquema específico do usuário para carregar as sessões
      const schema = tenant!.schema_name;
      console.log(`Carregando sessões do schema: ${schema}`);
      
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
            console.log(`Chat carregado: ${existingChat.title} com ${existingChat.messages.length} mensagens`);
          } else {
            // Se não encontramos, criamos um novo chat
            const newSession: ChatSession = {
              id: existingChatId,
              title: "Nova conversa",
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setChatSession(newSession);
            setMessages([]);
            console.log("Novo chat criado:", existingChatId);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de chat:", error);
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
    if (!user || !isTenantReady()) {
      console.log("Armazenamento temporário (tenant não configurado ou não ativo):", session);
      return;
    }
    
    try {
      const schema = tenant!.schema_name;
      console.log(`Salvando nova sessão no schema: ${schema}`);
      
      // Salvar sessão
      const { error: sessionError } = await schemaTable(schema, 'chat_sessions')
        .insert({
          id: session.id,
          title: session.title,
          user_id: user.id,
          created_at: session.createdAt.toISOString(),
          updated_at: session.updatedAt.toISOString()
        });
        
      if (sessionError) {
        console.error("Erro ao salvar sessão:", sessionError);
        return;
      }
      
      console.log("Sessão salva com sucesso");
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  };

  // Salvar mensagens no esquema do usuário
  const saveMessages = async (sessionId: string, newMessages: Message[]) => {
    if (!user || !isTenantReady() || newMessages.length === 0) {
      console.log("Não é possível salvar mensagens:", { 
        hasUser: !!user, 
        isTenantReady: isTenantReady(),
        messageCount: newMessages.length 
      });
      return;
    }
    
    try {
      const schema = tenant!.schema_name;
      console.log(`Salvando ${newMessages.length} mensagens no schema: ${schema}`);
      
      const messagesToInsert = newMessages.map(msg => ({
        id: msg.id,
        session_id: sessionId,
        content: msg.content,
        sender_id: msg.senderId,
        is_ai: msg.isAI,
        timestamp: msg.timestamp.toISOString(),
        attachment: msg.attachment || null
      }));
      
      const { error: messagesError } = await schemaTable(schema, 'chat_messages')
        .insert(messagesToInsert);
        
      if (messagesError) {
        console.error("Erro ao salvar mensagens:", messagesError);
        return;
      }
      
      console.log("Mensagens salvas com sucesso");
      
      // Atualizar timestamp da sessão
      const { error: updateError } = await schemaTable(schema, 'chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
        
      if (updateError) {
        console.error("Erro ao atualizar sessão:", updateError);
      }
      
    } catch (error) {
      console.error("Erro ao salvar mensagens:", error);
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
  }, [user, mode, tenant?.status, existingChatId]);

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

  // Função para melhorar mensagem usando Azure OpenAI
  const improveMessage = async (originalMessage: string): Promise<string> => {
    try {
      console.log("Melhorando mensagem com Azure OpenAI...");
      
      const { data, error } = await supabase.functions.invoke('azure-openai-chat', {
        body: {
          messages: [{ content: originalMessage, isAI: false }],
          userMode: mode,
          tenantId: tenant?.id,
          stream: false,
          improveMessage: true
        }
      });

      if (error) {
        console.error("Erro ao melhorar mensagem:", error);
        throw error;
      }

      if (!data || !data.message) {
        throw new Error("Resposta inválida da API para melhoria de mensagem");
      }

      console.log("Mensagem melhorada com sucesso");
      return data.message;
    } catch (e) {
      console.error("Erro ao melhorar mensagem:", e);
      toast.error("Erro ao melhorar mensagem. Tentando novamente...");
      throw e;
    }
  };

  // Função otimizada para chamar a API do Azure OpenAI com streaming
  const callAzureOpenAI = async (content: string, messageHistory: Message[], useStreaming: boolean = true): Promise<string> => {
    try {
      console.log("Chamando Azure OpenAI Edge Function...");
      
      const formattedHistory = messageHistory.map(msg => ({
        content: msg.content,
        isAI: msg.isAI,
      }));

      console.log("Histórico formatado:", { 
        messageCount: formattedHistory.length,
        mode: mode,
        tenantId: tenant?.id,
        streaming: useStreaming
      });

      if (useStreaming) {
        // Usar streaming para chat normal
        const response = await fetch(`${SUPABASE_URL}/functions/v1/azure-openai-chat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: formattedHistory,
            userMode: mode,
            tenantId: tenant?.id,
            stream: true
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedMessage = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    accumulatedMessage += data.content;
                    
                    // Atualizar estado de digitação
                    setAiTyping(prev => ({
                      ...prev,
                      partialMessage: accumulatedMessage,
                      fullMessage: accumulatedMessage,
                      isTyping: true
                    }));
                  }
                } catch (parseError) {
                  console.error("Erro ao processar chunk:", parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          // Finalizar digitação
          setAiTyping(prev => ({
            ...prev,
            isTyping: false
          }));
        }

        if (!accumulatedMessage) {
          throw new Error("Nenhum conteúdo recebido do streaming");
        }

        return accumulatedMessage;
      } else {
        // Usar chamada não-streaming para melhoria de mensagem
        const { data, error } = await supabase.functions.invoke('azure-openai-chat', {
          body: {
            messages: formattedHistory,
            userMode: mode,
            tenantId: tenant?.id,
            stream: false
          }
        });

        if (error) {
          console.error("Erro ao chamar Azure OpenAI via Edge Function:", error);
          throw error;
        }

        if (!data || !data.message) {
          console.error("Resposta inválida da Edge Function:", data);
          throw new Error("Resposta inválida da API do Azure OpenAI");
        }

        console.log("Resposta da IA recebida com sucesso", {
          messageLength: data.message.length,
        });

        return data.message;
      }
    } catch (e) {
      console.error("Erro no chat com Azure OpenAI:", e);
      toast.error("Erro ao processar mensagem. Tentando novamente...");
      throw e;
    }
  };

  // Função principal para enviar mensagem
  const sendMessage = async (content: string, file?: File) => {
    if (!user) {
      toast.error("Você precisa estar logado para enviar mensagens");
      return;
    }

    console.log("Enviando mensagem:", content);

    // Criar mensagem do usuário com anexo opcional
    const userMessage: Message = {
      id: uuidv4(),
      content,
      senderId: user.id,
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
      const sessionId = existingChatId || uuidv4();
      currentSession = {
        id: sessionId,
        title: generateChatTitle(content),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChatSession(currentSession);
      console.log("Nova sessão criada:", sessionId);
      
      // Salvar nova sessão
      await saveNewSession(currentSession);
      
      // Adicionar ao histórico local
      setChatHistory(prev => [currentSession!, ...prev]);
    }

    // Adicionar mensagem do usuário
    const updatedMessages = [...(currentSession?.messages || []), userMessage];
    setMessages(updatedMessages);
    
    // Atualizar sessão local
    if (currentSession) {
      currentSession.messages = updatedMessages;
      currentSession.updatedAt = new Date();
    }

    // Iniciar processamento do AI
    setIsProcessing(true);

    try {
      console.log("Chamando Azure OpenAI para responder à mensagem");
      
      // Chamar a API do Azure OpenAI para obter resposta
      let aiResponse = await callAzureOpenAI(content, updatedMessages);
      
      // Adicionar comentário sobre arquivo se houver
      if (file) {
        aiResponse += `\n\nVi que você anexou um arquivo "${file.name}". Posso analisar seu conteúdo.`;
      }
      
      // Criar mensagem do AI
      const aiMessage: Message = {
        id: uuidv4(),
        content: aiResponse,
        senderId: "ai",
        timestamp: new Date(),
        isAI: true,
      };
      
      // Atualizar mensagens com resposta da IA
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Atualizar sessão local
      if (currentSession) {
        currentSession.messages = finalMessages;
        currentSession.updatedAt = new Date();
        
        // Atualizar histórico local
        setChatHistory(prev => 
          prev.map(chat => 
            chat.id === currentSession!.id ? currentSession! : chat
          )
        );
      }
      
      // Salvar as novas mensagens (usuário + AI)
      await saveMessages(currentSession!.id, [userMessage, aiMessage]);
      
      console.log("Mensagem processada e salva com sucesso");
      
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      
      // Adicionar mensagem de erro como resposta do AI
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Desculpe, ocorreu um problema ao processar sua mensagem. Por favor, tente novamente.",
        senderId: "ai",
        timestamp: new Date(),
        isAI: true,
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Atualizar sessão local
      if (currentSession) {
        currentSession.messages = finalMessages;
        currentSession.updatedAt = new Date();
      }
      
      // Salvar mensagens mesmo com erro
      await saveMessages(currentSession!.id, [userMessage, errorMessage]);
      
    } finally {
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
    if (!user || !isTenantReady()) return;
    
    try {
      const schema = tenant!.schema_name;
      
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
    if (!user || !isTenantReady()) return;
    
    try {
      const schema = tenant!.schema_name;
      
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
    improveMessage,
  };
};

export default useChat;
