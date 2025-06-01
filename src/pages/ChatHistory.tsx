
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMode } from "../contexts/ModeContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatSession } from "../types";
import { MessageSquare, User, Trash, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useChat from "../hooks/useChat";
import { format } from "date-fns";

const ChatHistory = () => {
  const { user } = useAuth();
  const { mode } = useMode();
  const navigate = useNavigate();
  const { chatHistory, deleteChat, clearAllChats, isProcessing } = useChat();
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [displayChatHistory, setDisplayChatHistory] = useState<ChatSession[]>([]);

  useEffect(() => {
    // Sempre exibir todo o histórico de chat (já que só há modo pessoal)
    if (chatHistory) {
      setDisplayChatHistory([...chatHistory]);
    }
  }, [chatHistory, mode]);

  const handleChatSelect = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChat(chatId);
  };

  const handleClearAllChats = async () => {
    await clearAllChats();
    setConfirmDeleteAll(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Faça login para ver seu histórico de chat.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Histórico de Conversas</h1>
        <AlertDialog open={confirmDeleteAll} onOpenChange={setConfirmDeleteAll}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="text-red-500 border-red-500 hover:bg-red-500/10"
              disabled={displayChatHistory.length === 0 || isProcessing}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Limpar histórico
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir todo o histórico?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Todas as suas conversas serão permanentemente excluídas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-500 hover:bg-red-600"
                onClick={handleClearAllChats}
              >
                Excluir tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {displayChatHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 bg-muted/40 rounded-xl">
          <MessageSquare className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">Nenhuma conversa encontrada</h3>
          <p className="text-muted-foreground mt-2">Inicie uma nova conversa para começar.</p>
          <Button 
            className="mt-4"
            onClick={() => navigate("/chat")}
          >
            Nova conversa
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {displayChatHistory.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => handleChatSelect(chat.id)}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sightx-purple/10">
                    <User className="h-5 w-5 text-sightx-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{chat.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(chat.updatedAt), "dd/MM/yyyy 'às' HH:mm")}
                      {" • "}
                      {chat.messages.length} {chat.messages.length === 1 ? "mensagem" : "mensagens"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-500"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ChatHistory;
