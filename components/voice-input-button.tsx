"use client";

import { useRef, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react"; // Import Loader

type VoiceInputButtonProps = {
  onStart?: () => void;
  onStop?: (value: string) => void;
  // New prop to notify parent about processing state
  onProcessingStateChange?: (isProcessing: boolean) => void; 
};

export function VoiceInputButton({ onStart, onStop, onProcessingStateChange }: VoiceInputButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New local state

  async function startRecording() {
    if (isProcessing) return; // Prevent recording while processing previous

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      onStart?.();          
      setIsRecording(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // 1. Recording stopped, now processing starts
        setIsRecording(false);
        setIsProcessing(true);
        onProcessingStateChange?.(true); // Notify parent

        stream.getTracks().forEach((t) => t.stop());

        try {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", audioBlob, "voice.webm");

          const res = await fetch("/api/stt", { method: "POST", body: formData });
          const data = await res.json();

          onStop?.(data?.text ?? "");
        } catch (error) {
          console.error("STT Error", error);
        } finally {
          // 2. Processing finished
          setIsProcessing(false);
          onProcessingStateChange?.(false); // Notify parent
        }
      };

      mediaRecorder.start();
    } catch (err) {
      alert("Allow microphone to use voice input.");
      console.error(err);
      setIsRecording(false);
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          // Prevent interactions while processing
          onMouseDown={!isProcessing ? startRecording : undefined}
          onMouseUp={!isProcessing ? stopRecording : undefined}
          onTouchStart={!isProcessing ? startRecording : undefined}
          onTouchEnd={!isProcessing ? stopRecording : undefined}
          disabled={isProcessing} 
          className={`
            size-9 rounded-full flex items-center justify-center
            text-white transition-all duration-200 
            ${isRecording
              ? "bg-blue-500 hover:bg-blue-600 ring-4 ring-blue-300 animate-pulse scale-110 shadow-lg"
              : isProcessing 
                ? "bg-zinc-400 cursor-wait scale-100 shadow-none" // Processing style
                : "bg-[#ffc98b] hover:bg-[#ffb66a] shadow-md active:scale-95" // Idle style
            }
          `}
        >
          {isProcessing ? (
            <Loader2 className="size-4 animate-spin text-white" />
          ) : (
            "🎤"
          )}
        </button>
      </TooltipTrigger>

      <TooltipContent className="bg-black text-white rounded px-2 py-1 text-xs shadow-md">
        {isProcessing ? "Processing..." : "Press & Hold to Speak"}
      </TooltipContent>
    </Tooltip>
  );
}
