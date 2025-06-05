
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import MessageImprovementDialog from "./MessageImprovementDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ImproveMessageButtonProps {
  onImprovedMessage: (text: string) => void;
}

const ImproveMessageButton = ({ onImprovedMessage }: ImproveMessageButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <MessageImprovementDialog onImprovedMessage={onImprovedMessage}>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-sightx-purple/10 hover:text-sightx-purple"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </MessageImprovementDialog>
        </TooltipTrigger>
        <TooltipContent>
          <p>Melhorar mensagem com IA</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ImproveMessageButton;
