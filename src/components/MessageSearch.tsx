
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "../types";

interface MessageSearchProps {
  messages: Message[];
  onSearchResult: (messageId: string | null) => void;
  onClose: () => void;
}

const MessageSearch = ({ messages, onSearchResult, onClose }: MessageSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setCurrentResultIndex(-1);
      onSearchResult(null);
      return;
    }

    const searchResults = messages
      .filter(message => 
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(message => message.id);
    
    setResults(searchResults);
    
    if (searchResults.length > 0) {
      setCurrentResultIndex(0);
      onSearchResult(searchResults[0]);
    } else {
      setCurrentResultIndex(-1);
      onSearchResult(null);
    }
  }, [searchTerm, messages, onSearchResult]);

  const navigateResults = (direction: "prev" | "next") => {
    if (results.length === 0) return;
    
    let newIndex;
    if (direction === "next") {
      newIndex = (currentResultIndex + 1) % results.length;
    } else {
      newIndex = (currentResultIndex - 1 + results.length) % results.length;
    }
    
    setCurrentResultIndex(newIndex);
    onSearchResult(results[newIndex]);
  };

  return (
    <div className={cn(
      "fixed z-10 top-20 left-1/2 transform -translate-x-1/2 bg-background border shadow-lg rounded-lg p-2 w-[400px] max-w-[95vw] animate-slide-up",
      "border-sightx-purple/20"
    )}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar na conversa..."
            className="pl-9 pr-8 h-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={results.length === 0}
            className="h-9 w-9 p-0"
            onClick={() => navigateResults("prev")}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={results.length === 0}
            className="h-9 w-9 p-0"
            onClick={() => navigateResults("next")}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground pt-1 pb-0.5 px-1.5">
        {results.length > 0 ? (
          <span>
            {currentResultIndex + 1} de {results.length} resultados
          </span>
        ) : searchTerm.length >= 2 ? (
          <span>Nenhum resultado encontrado</span>
        ) : (
          <span>Digite pelo menos 2 caracteres</span>
        )}
      </div>
    </div>
  );
};

export default MessageSearch;
