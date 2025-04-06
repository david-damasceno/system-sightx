
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession } from "../types";

const mockResponses = [
  "Olá! Como posso ajudar você hoje?",
  "Estou processando sua pergunta. Um momento, por favor...",
  "Isso é uma ótima pergunta. Deixe-me explicar...",
  "Posso ajudar com vários tópicos. Sinta-se à vontade para perguntar sobre o que precisar.",
  "Entendi sua questão. Aqui está o que posso dizer sobre isso...",
  "Essa é uma área interessante para explorarmos. Vamos conversar mais sobre isso.",
  "Claro que posso ajudar com isso! Aqui estão algumas informações relevantes...",
];

const useChat = (existingChatId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  // Load chat sessions from local storage
  useEffect(() => {
    const storedHistory = localStorage.getItem("sightx-chat-history");
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
  }, [existingChatId]);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("sightx-chat-history", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Create a new chat session if we don't have one
  useEffect(() => {
    if (!chatSession && !existingChatId) {
      const newSession: ChatSession = {
        id: uuidv4(),
        title: "Nova conversa",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChatSession(newSession);

      // Add AI welcome message
      const welcomeMessage: Message = {
        id: uuidv4(),
        content: "Olá! Sou o assistente do SightX. Como posso ajudar você hoje?",
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
  }, [chatSession, existingChatId]);

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
      // Create AI response
      const aiResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      // If there was a file attachment, add a comment about it
      const fileComment = file ? `\n\nVi que você anexou um arquivo "${file.name}". Posso analisar seu conteúdo.` : '';
      
      const aiMessage: Message = {
        id: uuidv4(),
        content: aiResponse + fileComment,
        senderId: "ai",
        timestamp: new Date(),
        isAI: true,
      };

      // Update messages state
      setMessages(prev => [...prev, aiMessage]);
      
      // Update chat session
      const updatedSession = {
        ...chatSession,
        messages: [...chatSession.messages, userMessage, aiMessage],
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
    }, Math.random() * 1000 + 1000);
  };

  const generateChatTitle = (firstMessage: string) => {
    // Generate a title from the first few words
    const words = firstMessage.split(" ");
    const shortTitle = words.slice(0, 3).join(" ");
    return shortTitle.length < 20 ? shortTitle : shortTitle.substring(0, 20) + "...";
  };

  return {
    messages,
    sendMessage,
    isProcessing,
    chatSession,
    chatHistory,
  };
};

export default useChat;
