"use client";

import { useRef, useState } from "react";

type VoiceInputButtonProps = {
  onText: (value: string) => void; // gets transcribed text & sends back to parent
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
      alert("Microphone access blocked — allow mic to use voice input.");
      console.error(err);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  return (
    <button
      type="button"
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className={`px-3 py-1 rounded border text-sm ${
        isRecording ? "bg-red-600 text-white" : "bg-white text-black"
      }`}
    >
      {isRecording ? "Recording..." : "🎤 Hold to speak"}
    </button>
  );
}
