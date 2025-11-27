"use client";

import { useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";

type VoiceInputButtonProps = {
  onStart?: () => void;
  onStop?: (value: string) => void;
};

export function VoiceInputButton({ onStart, onStop }: VoiceInputButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  async function startRecording() {
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
        setIsRecording(false);
        stream.getTracks().forEach((t) => t.stop());

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "voice.webm");

        const res = await fetch("/api/stt", { method: "POST", body: formData });
        const data = await res.json();

        onStop?.(data?.text ?? "");
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
    <button
      type="button"
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className={`
        ${buttonVariants({ variant: "default", size: "icon" })} 
        rounded-full                      /* ensure circle */
        transition-all active:scale-95 
  
        ${isRecording
          ? "ring-4 ring-blue-300 animate-pulse"
          : ""
        }
      `}
    >
      🎤
    </button>
  );
}
