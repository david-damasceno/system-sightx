
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

  // Função para carregar as mensagens do esquema public
  const loadChatSessions = async () => {
    if (!user) return;
    
    try {
      console.log("Carregando sessões do esquema public");
      
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
            console.log(`Chat carregado: ${existingChat.title} com ${existingChat.messages.length} mensagens`);
          } else {
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

  // Salvar nova sessão no esquema public
  const saveNewSession = async (session: ChatSession) => {
    if (!user) {
      console.log("Usuário não autenticado");
      return;
    }
    
    try {
      console.log("Salvando nova sessão no esquema public");
      
      const { error: sessionError } = await supabase
        .from('chat_sessions')
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

  // Salvar mensagens no esquema public
  const saveMessages = async (sessionId: string, newMessages: Message[]) => {
    if (!user || newMessages.length === 0) {
      console.log("Não é possível salvar mensagens:", { 
        hasUser: !!user, 
        messageCount: newMessages.length 
      });
      return;
    }
    
    try {
      console.log(`Salvando ${newMessages.length} mensagens no esquema public`);
      
      const messagesToInsert = newMessages.map(msg => ({
        id: msg.id,
        session_id: sessionId,
        content: msg.content,
        sender_id: msg.senderId,
        is_ai: msg.isAI,
        timestamp: msg.timestamp.toISOString(),
        attachment: msg.attachment || null
      }));
      
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .insert(messagesToInsert);
        
      if (messagesError) {
        console.error("Erro ao salvar mensagens:", messagesError);
        return;
      }
      
      console.log("Mensagens salvas com sucesso");
      
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
        
      if (updateError) {
        console.error("Erro ao atualizar sessão:", updateError);
      }
      
    } catch (error) {
      console.error("Erro ao salvar mensagens:", error);
    }
  };

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
  }, [user, mode, existingChatId]);

  // Efeito de digitação do AI
  useEffect(() => {
    let interval: number | null = null;
    
    if (aiTyping.isTyping) {
      interval = window.setInterval(() => {
        setAiTyping(prev => {
          const nextLen = Math.min(prev.fullMessage.length, prev.partialMessage.length + 2 + Math.floor(Math.random() * 3));
          const nextPartial = prev.fullMessage.substring(0, nextLen);
          const progress = nextLen / prev.fullMessage.length;
          
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
        streaming: useStreaming
      });

      if (useStreaming) {
        const response = await fetch('https://nhpqzxhbdiurhzjpghqz.supabase.co/functions/v1/azure-openai-chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ocHF6eGhiZGl1cmh6anBnaHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTE2OTQsImV4cCI6MjA1OTUyNzY5NH0.vkZG5hKj81QChwxhKU1dpiCUzUGO1Mmj1DKJ3-y1pRM`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: formattedHistory,
            userMode: mode,
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
        const { data, error } = await supabase.functions.invoke('azure-openai-chat', {
          body: {
            messages: formattedHistory,
            userMode: mode,
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

    const needNewSession = !chatSession;
    let currentSession = chatSession;
    
    if (needNewSession) {
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
      
      await saveNewSession(currentSession);
      setChatHistory(prev => [currentSession!, ...prev]);
    }

    const updatedMessages = [...(currentSession?.messages || []), userMessage];
    setMessages(updatedMessages);
    
    if (currentSession) {
      currentSession.messages = updatedMessages;
      currentSession.updatedAt = new Date();
    }

    setIsProcessing(true);

    try {
      console.log("Chamando Azure OpenAI para responder à mensagem");
      
      let aiResponse = await callAzureOpenAI(content, updatedMessages);
      
      if (file) {
        aiResponse += `\n\nVi que você anexou um arquivo "${file.name}". Posso analisar seu conteúdo.`;
      }
      
      const aiMessage: Message = {
        id: uuidv4(),
        content: aiResponse,
        senderId: "ai",
        timestamp: new Date(),
        isAI: true,
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      if (currentSession) {
        currentSession.messages = finalMessages;
        currentSession.updatedAt = new Date();
        
        setChatHistory(prev => 
          prev.map(chat => 
            chat.id === currentSession!.id ? currentSession! : chat
          )
        );
      }
      
      await saveMessages(currentSession!.id, [userMessage, aiMessage]);
      
      console.log("Mensagem processada e salva com sucesso");
      
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Desculpe, ocorreu um problema ao processar sua mensagem. Por favor, tente novamente.",
        senderId: "ai",
        timestamp: new Date(),
        isAI: true,
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      if (currentSession) {
        currentSession.messages = finalMessages;
        currentSession.updatedAt = new Date();
      }
      
      await saveMessages(currentSession!.id, [userMessage, errorMessage]);
      
    } finally {
      setIsProcessing(false);
    }
  };

  const generateChatTitle = (firstMessage: string) => {
    const words = firstMessage.split(" ");
    const shortTitle = words.slice(0, 3).join(" ");
    return shortTitle.length < 20 ? shortTitle : shortTitle.substring(0, 20) + "...";
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', chatId);
        
      if (messagesError) throw messagesError;
      
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId);
        
      if (sessionError) throw sessionError;
      
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
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
    if (!user) return;
    
    try {
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .in(
          'session_id', 
          chatHistory.map(chat => chat.id)
        );
        
      if (messagesError) throw messagesError;
      
      const { error: sessionsError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', user.id);
        
      if (sessionsError) throw sessionsError;
      
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
