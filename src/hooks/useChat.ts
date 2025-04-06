
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession } from "../types";
import { useMode } from "../contexts/ModeContext";

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

  // Get the appropriate local storage key based on mode
  const getStorageKey = () => `sightx-chat-history-${mode}`;

  // Load chat sessions from local storage
  useEffect(() => {
    const storedHistory = localStorage.getItem(getStorageKey());
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        const validHistory = parsedHistory.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setChatHistory(validHistory);

        // If we have a chat ID, load that chat
        if (existingChatId) {
          const existingChat = validHistory.find((c: ChatSession) => c.id === existingChatId);
          if (existingChat) {
            setChatSession(existingChat);
            setMessages(existingChat.messages);
          }
        }
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    }
  }, [existingChatId, mode, getStorageKey]);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(chatHistory));
    }
  }, [chatHistory, getStorageKey]);

  // Create a new chat session if we don't have one
  useEffect(() => {
    if (!chatSession && !existingChatId) {
      const newSession: ChatSession = {
        id: uuidv4(),
        title: mode === "business" ? "Nova conversa empresarial" : "Nova conversa",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChatSession(newSession);

      // Add AI welcome message
      const welcomeMessage: Message = {
        id: uuidv4(),
        content: mode === "business" 
          ? "Olá! Sou o assistente do SightX no modo empresarial. Como posso ajudar sua empresa hoje?" 
          : "Olá! Sou o assistente do SightX. Como posso ajudar você hoje?",
        senderId: "ai",
        timestamp: new Date(),
        isAI: true,
      };
      
      setMessages([welcomeMessage]);
      
      // Update the session with the welcome message
      newSession.messages = [welcomeMessage];
      
      // Add to chat history
      setChatHistory(prev => [...prev, newSession]);
    }
  }, [chatSession, existingChatId, mode]);

  // Reset the chat session when mode changes
  useEffect(() => {
    if (!existingChatId) {
      setChatSession(null);
      setMessages([]);
    }
  }, [mode, existingChatId]);

  // Simulate AI typing effect
  useEffect(() => {
    let interval: number | null = null;
    
    if (aiTyping.isTyping) {
      interval = window.setInterval(() => {
        setAiTyping(prev => {
          const nextLen = Math.min(prev.fullMessage.length, prev.partialMessage.length + 2 + Math.floor(Math.random() * 3));
          const nextPartial = prev.fullMessage.substring(0, nextLen);
          const progress = nextLen / prev.fullMessage.length;
          
          // If complete, stop the interval
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
      }, 25); // Adjust speed as needed
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [aiTyping.isTyping]);

  const sendMessage = async (content: string, file?: File) => {
    if (!chatSession) return;

    // Create user message with optional attachment
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

    // Update messages state
    setMessages(prev => [...prev, userMessage]);

    // Start AI "thinking"
    setIsProcessing(true);

    // Simulate AI response (1-2 second delay)
    setTimeout(() => {
      // Choose response based on mode
      const responses = mode === "business" ? businessResponses : mockResponses;
      const aiResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // If there was a file attachment, add a mode-specific comment about it
      const fileComment = file 
        ? mode === "business"
          ? `\n\nNotei que você anexou um documento empresarial "${file.name}". Vou analisar seu conteúdo do ponto de vista comercial.`
          : `\n\nVi que você anexou um arquivo "${file.name}". Posso analisar seu conteúdo.`
        : '';
      
      const fullContent = aiResponse + fileComment;

      // Start typing effect
      setAiTyping({
        isTyping: true,
        partialMessage: "",
        fullMessage: fullContent,
        progress: 0
      });
      
      // Create AI message but don't add to messages yet - we'll update it during typing
      const aiMessage: Message = {
        id: uuidv4(),
        content: "",
        senderId: "ai",
        timestamp: new Date(),
        isAI: true,
      };

      // Add the message with empty content, we'll update it via the typing effect
      setMessages(prev => [...prev, aiMessage]);

      // Set up interval to check typing status and finalize when done
      const checkTypingInterval = setInterval(() => {
        if (!aiTyping.isTyping) {
          clearInterval(checkTypingInterval);
          
          // Finalize the message with the full content
          setMessages(prev => 
            prev.map(msg => msg.id === aiMessage.id 
              ? {...msg, content: fullContent} 
              : msg
            )
          );
          
          // Update chat session
          const updatedSession = {
            ...chatSession,
            messages: [...chatSession.messages, userMessage, {...aiMessage, content: fullContent}],
            title: chatSession.messages.length === 0 ? generateChatTitle(content) : chatSession.title,
            updatedAt: new Date(),
          };
          
          setChatSession(updatedSession);
          
          // Update chat history
          setChatHistory(prev => 
            prev.map(chat => 
              chat.id === updatedSession.id ? updatedSession : chat
            )
          );
          
          setIsProcessing(false);
        }
      }, 100);
    }, Math.random() * 1000 + 1000);
  };

  const generateChatTitle = (firstMessage: string) => {
    // Generate a title from the first few words
    const words = firstMessage.split(" ");
    const shortTitle = words.slice(0, 3).join(" ");
    return shortTitle.length < 20 ? shortTitle : shortTitle.substring(0, 20) + "...";
  };

  const deleteChat = (chatId: string) => {
    // Remove the chat from history
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    
    // Clear current session if that was the one deleted
    if (chatSession?.id === chatId) {
      setChatSession(null);
      setMessages([]);
    }
  };

  const clearAllChats = () => {
    setChatHistory([]);
    setChatSession(null);
    setMessages([]);
    localStorage.removeItem(getStorageKey());
  };

  return {
    messages,
    sendMessage,
    isProcessing,
    chatSession,
    chatHistory,
    aiTyping,
    deleteChat,
    clearAllChats
  };
};

export default useChat;
