"use client";

import { useRef, useState } from "react";

type VoiceInputButtonProps = {
  onText: (value: string) => void; // gets transcribed text & sends back to parent
};

export function VoiceInputButton({ onText }: VoiceInputButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState<boolean | null>(null);

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
      alert("Microphone access blocked — allow mic to use voice input.");
      console.error(err);
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  return (
    <button
      type="button"
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className={`
        size-9 rounded-full flex items-center justify-center
        bg-primary text-primary-foreground
        hover:bg-primary/90 active:scale-95 shadow-sm transition-all
        ${isRecording === true ? "ring-4 ring-red-400 animate-pulse" : ""}
      `}
    >
      🎤
    </button>
  );
}
