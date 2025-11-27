"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button"; // USE SAME COMPONENT AS SEND!

type VoiceInputButtonProps = {
  onText: (value: string) => void;
};

export function VoiceInputButton({ onText }: VoiceInputButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setIsRecording(true);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        stream.getTracks().forEach((t) => t.stop());

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "voice.webm");

        const res = await fetch("/api/stt", { method: "POST", body: formData });
        const data = await res.json();

        if (data?.text) onText(data.text);
      };

      mediaRecorder.start();
    } catch (err) {
      alert("Microphone blocked — enable permissions.");
      console.error(err);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  return (
    <Button
      size="icon"                 // SAME AS SEND BUTTON
      variant="default"           // SAME COLOR SYSTEM
      className={`rounded-full transition-all ${
        isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/80"
      }`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
    >
      🎤
    </Button>
  );
}
