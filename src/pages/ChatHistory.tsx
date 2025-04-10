
import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Calendar, 
  Clock, 
  Filter, 
  ArrowUpDown, 
  Info,
  Plus,
  X, 
  MessageCircle,
  Loader2
} from "lucide-react";
import { ChatSession } from "../types";
import useChat from "../hooks/useChat";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ChatHistory = () => {
  const { chatHistory, deleteChat, clearAllChats, isLoading } = useChat();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [isGridView, setIsGridView] = useState(true);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  
  // Get today and yesterday dates for grouping
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Sort and filter history
  const processedHistory = [...chatHistory]
    .filter(chat => 
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  
  // Group chats by date
  const groupedChats = processedHistory.reduce((acc, chat) => {
    const chatDate = new Date(chat.updatedAt);
    chatDate.setHours(0, 0, 0, 0);
    
    let dateGroup;
    if (chatDate.getTime() === today.getTime()) {
      dateGroup = "Hoje";
    } else if (chatDate.getTime() === yesterday.getTime()) {
      dateGroup = "Ontem";
    } else {
      dateGroup = format(chatDate, "dd/MM/yyyy");
    }
    
    if (!acc[dateGroup]) {
      acc[dateGroup] = [];
    }
    
    acc[dateGroup].push(chat);
    return acc;
  }, {} as Record<string, ChatSession[]>);

  // Mostrar indicador de carregamento enquanto buscamos os dados
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 text-sightx-purple animate-spin mb-4" />
        <p className="text-muted-foreground">Carregando histórico de conversas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl font-bold mb-1">Histórico de Conversas</h1>
            <p className="text-muted-foreground text-sm">
              Visualize e gerencie suas conversas anteriores com o SightX
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isGridView ? "default" : "outline"}
              size="sm"
              className="h-9"
              onClick={() => setIsGridView(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Cards
            </Button>
            <Button
              variant={!isGridView ? "default" : "outline"}
              size="sm"
              className="h-9"
              onClick={() => setIsGridView(false)}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Tabela
            </Button>
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ordenar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                  Mais recentes primeiro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                  Mais antigas primeiro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar nas conversas..."
            className="pl-10 pr-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        {Object.keys(groupedChats).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-lg font-medium">Nenhuma conversa encontrada</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {searchTerm ? 
                `Não encontramos conversas contendo "${searchTerm}".` : 
                "Inicie uma conversa com o SightX para começar a construir seu histórico."
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Limpar busca
              </Button>
            )}
            <Button 
              className="mt-4 bg-sightx-purple hover:bg-sightx-purple-light"
              asChild
            >
              <Link to="/chat">
                <Plus className="h-4 w-4 mr-2" />
                Nova conversa
              </Link>
            </Button>
          </div>
        ) : (
          isGridView ? (
            Object.entries(groupedChats).map(([dateGroup, chats]) => (
              <div key={dateGroup} className="mb-8">
                <div className="flex items-center mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {dateGroup}
                  </h3>
                  <Separator className="ml-3 flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chats.map((chat) => (
                    <Card key={chat.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                      <Link to={`/chat/${chat.id}`} className="block h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex justify-between items-start gap-2">
                            <div className="truncate">{chat.title}</div>
                            <Badge variant="outline" className="shrink-0">
                              {chat.messages.length} mensagens
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1.5 text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(chat.updatedAt), "dd MMM, HH:mm")}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="text-sm py-2 text-muted-foreground">
                          <div className="line-clamp-2">
                            {chat.messages.length > 0 ? 
                              chat.messages[chat.messages.length - 1].content : 
                              "Conversa vazia"}
                          </div>
                        </CardContent>
                      </Link>
                      
                      <CardFooter className="flex justify-between p-3 bg-muted/20 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          <span>Iniciada em {format(new Date(chat.createdAt), "dd/MM")}</span>
                        </div>
                        
                        <AlertDialog open={chatToDelete === chat.id} onOpenChange={(open) => !open && setChatToDelete(null)}>
                          <AlertDialogTrigger asChild onClick={(e) => {e.preventDefault(); setChatToDelete(chat.id);}}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir conversa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteChat(chat.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="hidden md:table-cell">Mensagens</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedHistory.map((chat) => (
                    <TableRow key={chat.id} className="group">
                      <TableCell className="font-medium">
                        <Link to={`/chat/${chat.id}`} className="hover:text-sightx-purple">
                          {chat.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(chat.updatedAt), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{chat.messages.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="opacity-70 hover:opacity-100"
                          >
                            <Link to={`/chat/${chat.id}`}>
                              <MessageSquare className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog open={chatToDelete === chat.id} onOpenChange={(open) => !open && setChatToDelete(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => setChatToDelete(chat.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir conversa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteChat(chat.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )
        )}
      </div>
      
      {chatHistory.length > 0 && (
        <div className="mt-8 flex justify-between items-center border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {chatHistory.length} {chatHistory.length === 1 ? "conversa" : "conversas"} no histórico
          </p>
          
          <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Limpar histórico
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todo o histórico</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir todas as suas conversas? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={clearAllChats}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Limpar todo o histórico
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
