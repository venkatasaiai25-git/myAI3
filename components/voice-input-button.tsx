"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button"; // Matches UI theme

type VoiceInputButtonProps = {
  onText: (value: string) => void;
  className?: string;
};

export function VoiceInputButton({ onText, className }: VoiceInputButtonProps) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [recording, setRecording] = useState(false);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorderRef.current = recorder;
      chunks.current = [];
      setRecording(true);

      recorder.ondataavailable = e => e.data.size && chunks.current.push(e.data);

      recorder.onstop = async () => {
        setRecording(false);
        stream.getTracks().forEach(t => t.stop());

        const audio = new Blob(chunks.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("file", audio, "voice.webm");

        const res = await fetch("/api/stt", { method: "POST", body: form });
        const data = await res.json();
        if (data?.text) onText(data.text);
      };

      recorder.start();

      // Safety auto cutoff (10 sec)
      setTimeout(() => {
        if (recorderRef.current?.state === "recording") stopRecording();
      }, 10000);

    } catch {
      alert("Enable microphone access to use voice input");
    }
  }

  function stopRecording() {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }

  return (
    <Button
      size="icon"
      variant="default"
      className={`rounded-full transition ${recording && "bg-red-500 hover:bg-red-600"} ${className}`}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
    >
      🎤
    </Button>
  );
}
