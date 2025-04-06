
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Play, Pause, SkipBack, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview = ({ file, onRemove }: FilePreviewProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "audio" | "video" | "document" | "other">("other");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

  useEffect(() => {
    // Determine file type
    if (file.type.startsWith("image/")) {
      setFileType("image");
    } else if (file.type.startsWith("audio/")) {
      setFileType("audio");
    } else if (file.type.startsWith("video/")) {
      setFileType("video");
    } else if (file.type.includes("pdf") || file.type.includes("doc") || file.type.includes("txt")) {
      setFileType("document");
    } else {
      setFileType("other");
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Clean up function
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Media controls
  const togglePlay = () => {
    if (!mediaRef.current) return;
    
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (!mediaRef.current) return;
    mediaRef.current.currentTime = 0;
    if (!isPlaying) {
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    mediaRef.current.muted = !mediaRef.current.muted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!mediaRef.current) return;
    setCurrentTime(mediaRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!mediaRef.current) return;
    setDuration(mediaRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaRef.current) return;
    const newTime = parseFloat(e.target.value);
    mediaRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="mb-3 p-2 rounded-lg bg-muted/50 border border-border animate-fade-in relative group">
      {/* Close button */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={onRemove}
        className="absolute top-2 right-2 h-6 w-6 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </Button>
      
      {/* Image preview */}
      {fileType === "image" && preview && (
        <div className="relative group overflow-hidden rounded-lg">
          <img 
            src={preview} 
            alt={file.name} 
            className="w-full max-h-40 object-contain rounded-lg"
          />
          <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs truncate">
            {file.name}
          </div>
        </div>
      )}
      
      {/* Audio preview */}
      {fileType === "audio" && preview && (
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Volume2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{file.name}</div>
              <div className="text-xs text-muted-foreground">
                Áudio ({file.type.split('/')[1]})
              </div>
            </div>
          </div>
          
          <audio 
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={preview}
            className="hidden"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
          
          <div className="flex items-center gap-2 mb-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={restart}
            >
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-8">
              {formatTime(currentTime)}
            </span>
            
            <div className="relative flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                step="0.1"
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>
            
            <span className="text-xs text-muted-foreground w-8 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
      
      {/* Video preview */}
      {fileType === "video" && preview && (
        <div className="relative rounded-lg overflow-hidden">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={preview}
            className="w-full rounded-lg"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
          
          <div className={cn(
            "absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 transition-opacity",
            isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          )}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white hover:bg-white/20"
                onClick={restart}
              >
                <SkipBack className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/80 w-8">
                {formatTime(currentTime)}
              </span>
              
              <div className="relative flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  step="0.1"
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
              </div>
              
              <span className="text-xs text-white/80 w-8 text-right">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Document/Other preview */}
      {(fileType === "document" || fileType === "other") && (
        <div className="flex items-center gap-3 p-1">
          <div className="rounded-full bg-primary/10 p-2.5">
            {fileType === "document" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" />
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
              </svg>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{file.name}</div>
            <div className="text-xs text-muted-foreground">
              {file.type 
                ? `${fileType === "document" ? "Documento" : "Arquivo"} (${file.type.split('/')[1]})` 
                : "Arquivo"
              }
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (preview) {
                const link = document.createElement('a');
                link.href = preview;
                link.download = file.name;
                link.click();
              }
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
