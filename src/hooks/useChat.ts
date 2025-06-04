
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession } from "../types";
import { useMode } from "../contexts/ModeContext";
import { supabase } from "@/integrations/supabase/client";
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
  const { user } = useAuth();
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

  // Carrega o histórico de chat
  const loadChatSessions = async () => {
    if (!user) return;
    
    try {
      console.log("Carregando sessões do chat");
      
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) {
        console.error("Erro ao buscar sessões:", error);
        return;
      }

      if (sessions) {
        const formattedSessions: ChatSession[] = await Promise.all(
          sessions.map(async (session: any) => {
            const { data: messageData, error: messagesError } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('session_id', session.id)
              .order('timestamp', { ascending: true });
              
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
        
        if (existingChatId) {
          const existingChat = formattedSessions.find(c => c.id === existingChatId);
          if (existingChat) {
            setChatSession(existingChat);
            setMessages(existingChat.messages);
            console.log(`Chat carregado: ${existingChat.title}`);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user, existingChatId]);

  // Efeito de digitação
  useEffect(() => {
    if (!aiTyping.isTyping || !aiTyping.fullMessage) return;
    
    let interval: number | null = null;
    
    interval = window.setInterval(() => {
      setAiTyping(prev => {
        const nextLen = Math.min(prev.fullMessage.length, prev.partialMessage.length + 2);
        const nextPartial = prev.fullMessage.substring(0, nextLen);
        
        if (nextLen >= prev.fullMessage.length) {
          if (interval) clearInterval(interval);
          return {
            ...prev,
            partialMessage: prev.fullMessage,
            isTyping: false
          };
        }
        
        return {
          ...prev,
          partialMessage: nextPartial
        };
      });
    }, 50);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [aiTyping.isTyping, aiTyping.fullMessage]);

  // Função para melhorar mensagem
  const improveMessage = async (originalMessage: string): Promise<string> => {
    try {
      console.log("Melhorando mensagem...");
      
      const { data, error } = await supabase.functions.invoke('azure-openai-chat', {
        body: {
          messages: [{ content: originalMessage, isAI: false }],
          userMode: mode,
          stream: false,
          improveMessage: true
        }
      });

      if (error) throw error;
      if (!data?.message) throw new Error("Resposta inválida");

      return data.message;
    } catch (e) {
      console.error("Erro ao melhorar mensagem:", e);
      throw e;
    }
  };

  // Função principal para enviar mensagem
  const sendMessage = async (content: string, file?: File) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!content.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }

    console.log("=== ENVIANDO MENSAGEM ===");
    console.log("Conteúdo:", content);
    
    setIsProcessing(true);
    
    try {
      // 1. Criar ou usar sessão existente
      let currentSession = chatSession;
      
      if (!currentSession) {
        const sessionId = existingChatId || uuidv4();
        const newSession: ChatSession = {
          id: sessionId,
          title: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Salvar nova sessão no banco
        const { error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            id: sessionId,
            title: newSession.title,
            user_id: user.id,
            created_at: newSession.createdAt.toISOString(),
            updated_at: newSession.updatedAt.toISOString()
          });
          
        if (sessionError) {
          console.error("Erro ao criar sessão:", sessionError);
          throw sessionError;
        }
        
        currentSession = newSession;
        setChatSession(currentSession);
        console.log("Nova sessão criada:", sessionId);
      }

      // 2. Criar mensagem do usuário
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

      // 3. Salvar mensagem do usuário no banco
      const { error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          id: userMessage.id,
          session_id: currentSession.id,
          content: userMessage.content,
          sender_id: userMessage.senderId,
          is_ai: false,
          timestamp: userMessage.timestamp.toISOString(),
          attachment: userMessage.attachment || null
        });
        
      if (userMsgError) {
        console.error("Erro ao salvar mensagem usuário:", userMsgError);
        throw userMsgError;
      }

      // 4. Atualizar UI com mensagem do usuário
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      currentSession.messages = updatedMessages;

      console.log("Mensagem do usuário salva, chamando IA...");

      // 5. Chamar IA
      try {
        const { data, error } = await supabase.functions.invoke('azure-openai-chat', {
          body: {
            messages: updatedMessages.map(msg => ({
              content: msg.content,
              isAI: msg.isAI,
            })),
            userMode: mode,
            stream: false
          }
        });

        if (error) {
          console.error("Erro da edge function:", error);
          throw error;
        }

        if (!data?.message) {
          throw new Error("Resposta inválida da IA");
        }

        // 6. Criar e salvar mensagem da IA
        const aiMessage: Message = {
          id: uuidv4(),
          content: data.message,
          senderId: "ai",
          timestamp: new Date(),
          isAI: true,
        };
        
        // Salvar mensagem da IA no banco
        const { error: aiMsgError } = await supabase
          .from('chat_messages')
          .insert({
            id: aiMessage.id,
            session_id: currentSession.id,
            content: aiMessage.content,
            sender_id: aiMessage.senderId,
            is_ai: true,
            timestamp: aiMessage.timestamp.toISOString()
          });
          
        if (aiMsgError) {
          console.error("Erro ao salvar mensagem IA:", aiMsgError);
        }

        // Atualizar UI
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        currentSession.messages = finalMessages;
        
        // Atualizar sessão no banco
        await supabase
          .from('chat_sessions')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSession.id);
        
        // Atualizar histórico
        setChatHistory(prev => {
          const existingIndex = prev.findIndex(chat => chat.id === currentSession!.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = currentSession!;
            return updated;
          } else {
            return [currentSession!, ...prev];
          }
        });

        console.log("=== MENSAGEM PROCESSADA COM SUCESSO ===");
        
      } catch (aiError) {
        console.error("=== ERRO AO CHAMAR IA ===", aiError);
        
        // Criar mensagem de erro
        const errorMessage: Message = {
          id: uuidv4(),
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.",
          senderId: "ai",
          timestamp: new Date(),
          isAI: true,
        };
        
        setMessages(prev => [...prev, errorMessage]);
        toast.error("Erro na resposta da IA. Tente novamente.");
      }
      
    } catch (error) {
      console.error("=== ERRO GERAL ===", error);
      toast.error("Erro ao processar mensagem");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      await supabase.from('chat_messages').delete().eq('session_id', chatId);
      await supabase.from('chat_sessions').delete().eq('id', chatId);
      
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
      if (chatSession?.id === chatId) {
        setChatSession(null);
        setMessages([]);
      }
      
      toast.success("Conversa excluída");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir conversa");
    }
  };

  const clearAllChats = async () => {
    if (!user) return;
    
    try {
      await supabase.from('chat_messages').delete().in('session_id', chatHistory.map(chat => chat.id));
      await supabase.from('chat_sessions').delete().eq('user_id', user.id);
      
      setChatHistory([]);
      setChatSession(null);
      setMessages([]);
      
      toast.success("Histórico limpo");
    } catch (error) {
      console.error("Erro ao limpar:", error);
      toast.error("Erro ao limpar histórico");
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
