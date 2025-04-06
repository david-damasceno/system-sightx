
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
import { MessageSquare, Search, Trash2 } from "lucide-react";
import { ChatSession } from "../types";
import useChat from "../hooks/useChat";

const ChatHistory = () => {
  const { chatHistory } = useChat();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredHistory = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-2xl">Histórico de Conversas</CardTitle>
          <CardDescription>
            Visualize e gerencie seu histórico de conversas com o SightX
          </CardDescription>
          
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar conversas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Mensagens</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((chat: ChatSession) => (
                  <TableRow key={chat.id}>
                    <TableCell className="font-medium">{chat.title}</TableCell>
                    <TableCell>{format(new Date(chat.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>{chat.messages.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                        >
                          <Link to={`/chat/${chat.id}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma conversa encontrada</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm ? "Tente uma busca diferente." : "Inicie uma conversa para vê-la aqui."}
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
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to="/chat">Nova conversa</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChatHistory;
