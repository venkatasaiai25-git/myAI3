"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus, Square } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader, ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Link from "next/link";

// ------------------- SCHEMA ------------------- //
const formSchema = z.object({
  message: z.string().min(1).max(2000),
});

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

// ---------------- LOCAL STORAGE ---------------- //
const loadMessagesFromStorage = (): StorageData => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { messages: [], durations: {} };
  } catch {
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, durations }));
  }
};

// ------------------- CHAT COMPONENT ------------------- //
export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef(false);

  const stored = loadMessagesFromStorage();
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({ messages: initialMessages });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  useEffect(() => {
    if (isClient) saveMessagesToStorage(messages, durations);
  }, [messages, durations, isClient]);

  // ------------------ WELCOME MESSAGE FIX ------------------ //
  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant" as const,    // << FIXED TYPE
        parts: [{ type: "text", text: WELCOME_MESSAGE }],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  // ------------------ SEND MESSAGE ------------------ //
  const form = useForm<{ message: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  const onSubmit = (d: { message: string }) => {
    sendMessage({ text: d.message });
    form.reset();
  };

  function clearChat() {
    setMessages([]);
    setDurations({});
    saveMessagesToStorage([], {});
    toast.success("Chat cleared");
  }

  // =========================================================== //
  // =====================  UI  (CLEAN + FIXED) ================= //
  // =========================================================== //

  return (
    <div className="flex h-screen w-full font-sans dark:bg-black">
      <main className="w-full relative">

        {/* 🔶 Wave Header — working, clickable, non-blocking */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="relative h-24 bg-gradient-to-r from-orange-400 to-amber-300 shadow-md">

            {/* Wave SVG */}
            <svg className="absolute bottom-[-12px] w-full pointer-events-none" viewBox="0 0 1440 320">
              <path fill="#fff" d="M0,256L60,224C120,192,240,128,360,122C480,117,600,171,720,202C840,235,960,245,1080,213C1200,181,1320,107,1380,69L1440,32V0H0Z"/>
            </svg>

            <ChatHeader>
              <ChatHeaderBlock />
              <ChatHeaderBlock className="justify-center items-center gap-2">
                <Avatar className="size-8 ring-2 ring-white"><AvatarImage src="/logo.png"/></Avatar>
                <p className="text-white text-lg font-semibold drop-shadow">Chat with {AI_NAME}</p>
              </ChatHeaderBlock>
              <ChatHeaderBlock className="justify-end">
                <Button size="sm" onClick={clearChat} className="bg-white/90 text-orange-700 hover:bg-white shadow">
                  <Plus className="size-4 text-orange-700"/> {CLEAR_CHAT_TEXT}
                </Button>
              </ChatHeaderBlock>
            </ChatHeader>

          </div>
        </div>

        {/* Chat Window Area (original behavior restored) */}
        <div className="h-screen overflow-y-auto px-5 pt-[150px] pb-[150px]">
          <div className="flex flex-col items-center justify-end min-h-full">
            {isClient ? (
              <>
                <MessageWall messages={messages} status={status} durations={durations}
                  onDurationChange={(k, d)=>setDurations({ ...durations, [k]: d })}
                />
                {status==="submitted" && <Loader2 className="animate-spin mt-2" />}
              </>
            ) : <Loader2 className="animate-spin mt-10" />}
          </div>
        </div>

        {/* Input Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md z-50">
          <div className="max-w-3xl mx-auto px-5 py-4">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller name="message" control={form.control} render={({field,fieldState})=>(
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="sr-only">Message</FieldLabel>
                    <div className="relative">
                      <Input {...field} placeholder="Type your message…" className="rounded-full pr-14"/>

                      {(status==="ready"||status==="error")&&(
                        <Button type="submit" size="icon"
                          disabled={!field.value.trim()}
                          className="absolute top-1.5 right-1.5 rounded-full">
                          <ArrowUp/>
                        </Button>
                      )}

                      {(status==="submitted"||status==="streaming")&&(
                        <Button size="icon" onClick={stop}
                          className="absolute top-1.5 right-1.5 rounded-full">
                          <Square/>
                        </Button>
                      )}
                    </div>
                  </Field>
                )}/>
              </FieldGroup>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs pb-2 text-muted-foreground">
            © {new Date().getFullYear()} {OWNER_NAME} · <Link href="/terms" className="underline">Terms</Link>
          </p>
        </div>

      </main>
    </div>
  );
}
