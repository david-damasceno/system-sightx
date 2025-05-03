import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession } from "../types";
import { useMode } from "../contexts/ModeContext";
import { supabase, schemaTable } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type ChatMessagesRow = Database['public']['Tables']['chat_messages']['Row'];
type ChatSessionsRow = Database['public']['Tables']['chat_sessions']['Row'];

const mockResponses = [
  "Olá! Como posso ajudar você hoje?",
  "Estou processando sua pergunta. Um momento, por favor...",
  "Isso é uma ótima pergunta. Deixe-me explicar...",
  "Posso ajudar com vários tópicos. Sinta-se à vontade para perguntar sobre o que precisar.",
  "Entendi sua questão. Aqui está o que posso dizer sobre isso...",
  "Essa é uma área interessante para explorarmos. Vamos conversar mais sobre isso.",
  "Claro que posso ajudar com isso! Aqui estão algumas informações relevantes...",
];

const businessResponses = [
  "Olá! Como posso assistir sua empresa hoje?",
  "Estou analisando sua solicitação comercial. Um momento, por favor...",
  "Essa é uma questão corporativa importante. Deixe-me elaborar...",
  "Posso auxiliar com diversos tópicos empresariais. Qual setor de negócios você precisa de informações?",
  "Compreendi seu questionamento comercial. Aqui estão os dados relevantes para sua empresa...",
  "Este é um segmento estratégico para seu negócio. Vamos explorar as possibilidades...",
  "Certamente posso ajudar com esta demanda corporativa! Aqui estão algumas análises de mercado...",
];

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
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar as mensagens do esquema do usuário
  const loadChatSessions = async () => {
    if (!user || !tenant || !tenant.schema_name) return;
    
    try {
      setIsLoading(true);
      
      // Usando o esquema específico do usuário para carregar as sessões
      const schema = tenant.schema_name;
      const { data: sessions, error } = await schemaTable(schema, 'chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;

      if (sessions) {
        // Converter os dados para o formato esperado
        const formattedSessions: ChatSession[] = await Promise.all(
          sessions.map(async (session: any) => {
            // Carregar mensagens para cada sessão
            const { data: messageData, error: messagesError } = await schemaTable(schema, 'chat_messages')
              .select('*')
              .eq('session_id', session.id)
              .order('timestamp', { ascending: true });
              
            if (messagesError) throw messagesError;
            
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
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de chat:", error);
      toast.error("Erro ao carregar o histórico de conversas");
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar nova sessão no esquema do usuário
  const saveNewSession = async (session: ChatSession) => {
    if (!user || !tenant || !tenant.schema_name) return;
    
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
      toast.error("Erro ao salvar conversa");
    }
  };

  // Atualizar sessão existente
  const updateSession = async (session: ChatSession, newMessages: Message[]) => {
    if (!user || !tenant || !tenant.schema_name) return;
    
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
      toast.error("Erro ao atualizar conversa");
    }
  };

  // Carregar histórico de chat quando o usuário ou modo mudar
  useEffect(() => {
    if (user && tenant && tenant.status === 'active') {
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

  const sendMessage = async (content: string, file?: File) => {
    if (!user || !tenant || !tenant.schema_name) return;

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
      
      // Mensagem de boas-vindas do AI
      const welcomeMessage: Message = {
        id: uuidv4(),
        content: mode === "business" 
          ? "Olá! Sou o assistente do SightX no modo empresarial. Como posso ajudar sua empresa hoje?" 
          : "Olá! Sou o assistente do SightX. Como posso ajudar você hoje?",
        senderId: "ai",
        timestamp: new Date(),
        isAI: true,
      };
      
      // Atualizar a sessão com a mensagem de boas-vindas e a mensagem do usuário
      currentSession.messages = [welcomeMessage, userMessage];
      
      // Atualizar mensagens
      setMessages([welcomeMessage, userMessage]);
      
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

    // Simular resposta do AI (1-2 segundos de atraso)
    setTimeout(() => {
      // Escolher resposta baseada no modo
      const responses = mode === "business" ? businessResponses : mockResponses;
      const aiResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Se houver anexo, adicionar um comentário específico do modo
      const fileComment = file 
        ? mode === "business"
          ? `\n\nNotei que você anexou um documento empresarial "${file.name}". Vou analisar seu conteúdo do ponto de vista comercial.`
          : `\n\nVi que você anexou um arquivo "${file.name}". Posso analisar seu conteúdo.`
        : '';
      
      const fullContent = aiResponse + fileComment;

      // Iniciar efeito de digitação
      setAiTyping({
        isTyping: true,
        partialMessage: "",
        fullMessage: fullContent,
        progress: 0
      });
      
      // Criar mensagem do AI mas não adicionar às mensagens ainda - iremos atualizá-la durante a digitação
      const aiMessage: Message = {
        id: uuidv4(),
        content: "",
        senderId: "ai",
        timestamp: new Date(),
        isAI: true,
      };

      // Adicionar a mensagem com conteúdo vazio, iremos atualizá-la via efeito de digitação
      setMessages(prev => [...prev, aiMessage]);

      // Configurar intervalo para verificar status de digitação e finalizar quando terminar
      const checkTypingInterval = setInterval(() => {
        if (!aiTyping.isTyping) {
          clearInterval(checkTypingInterval);
          
          // Finalizar a mensagem com o conteúdo completo
          const updatedAiMessage = {...aiMessage, content: fullContent};
          
          setMessages(prev => 
            prev.map(msg => msg.id === aiMessage.id 
              ? updatedAiMessage 
              : msg
            )
          );
          
          // Atualizar a sessão de chat
          if (currentSession) {
            const newMessages = needNewSession ? [] : [userMessage, updatedAiMessage];
            const updatedSession = {
              ...currentSession,
              messages: [...currentSession.messages, ...(needNewSession ? [] : [updatedAiMessage])],
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
            if (!needNewSession) {
              updateSession(currentSession, newMessages);
            }
          }
          
          setIsProcessing(false);
        }
      }, 100);
    }, Math.random() * 1000 + 1000);
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
    isLoading
  };
};

export default useChat;
