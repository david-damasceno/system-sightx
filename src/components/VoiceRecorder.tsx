
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMode } from "../contexts/ModeContext";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}

const VoiceRecorder = ({ onRecordingComplete, onCancel }: VoiceRecorderProps) => {
  const { mode } = useMode();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Format seconds to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
      toast.info("Gravação iniciada", {
        description: "Fale claramente para uma melhor transcrição.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Erro ao iniciar gravação", {
        description: "Verifique se o microfone está conectado e permitido.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    onCancel();
  };

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-xl bg-muted/30 border animate-slide-up",
      isRecording && (mode === "business" ? "border-sightx-green" : "border-sightx-purple")
    )}>
      {isRecording ? (
        <>
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-3 w-3 rounded-full animate-pulse",
              mode === "business" ? "bg-sightx-green" : "bg-sightx-purple"
            )} />
            <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-full",
              mode === "business" ? "text-sightx-green hover:bg-sightx-green/10" : "text-sightx-purple hover:bg-sightx-purple/10"
            )}
            onClick={stopRecording}
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      ) : audioBlob ? (
        <>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Áudio gravado</span>
            <span className="text-muted-foreground">({formatTime(recordingTime)})</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full text-destructive hover:bg-destructive/10"
              onClick={handleCancel}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                mode === "business" ? "bg-sightx-green hover:bg-sightx-green/90" : "bg-sightx-purple hover:bg-sightx-purple-light"
              )}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <span className="text-sm">Grave uma mensagem de voz</span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:bg-muted"
              onClick={handleCancel}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                mode === "business" ? "border-sightx-green/50 text-sightx-green hover:bg-sightx-green/10" : "border-sightx-purple/50 text-sightx-purple hover:bg-sightx-purple/10"
              )}
              onClick={startRecording}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;
