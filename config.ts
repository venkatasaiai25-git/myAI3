import { openai } from "@ai-sdk/openai";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";

export const MODEL = openai('gpt-4.1');

function getDateAndTime(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    return `The day today is ${dateStr} and the time right now is ${timeStr}.`;
}

export const DATE_AND_TIME = getDateAndTime();

export const AI_NAME = "BITsy";
export const OWNER_NAME = "Nanduri Anirudh";

export const WELCOME_MESSAGE = `Hi! I’m ${AI_NAME}, built by ${OWNER_NAME} to help make life at BITSoM easier. How can I help?`

export const CLEAR_CHAT_TEXT = "New Chat";

export const MODERATION_DENIAL_MESSAGE_SEXUAL = "I can't discuss explicit sexual content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS = "I can't discuss content involving minors in a sexual context. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT = "I can't engage with harassing content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT_THREATENING = "I won’t respond to threatening or harassing content. Let’s keep the conversation respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE = "I won't engage with hateful content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE_THREATENING = "I won't engage with threatening hate speech. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT = "I can't discuss illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT_VIOLENT = "I can't discuss violent illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM = "I’m really sorry you’re feeling this way, but I can’t encourage self-harm. You’re not alone. BITSoM’s M-Power team is available to support students. You can reach them on mpower.info-mumbai.cell@abet.co.in, or call the helpline at 07969016551.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INTENT = "I’m really sorry you're feeling this way, but I can’t talk about self-harm intentions. Please consider reaching out to BITSoM’s M-Power counsellors, they’re here to help and are available on mpower.info-mumbai.cell@abet.co.in or on Helpline: 07969016551.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INSTRUCTIONS = "I can’t provide any instructions related to self-harm. You deserve support. BITSoM’s M-Power counsellors are available Monday to Saturday, 11:30 AM to 6:30 PM, and can also be reached on mpower.info-mumbai.cell@abet.co.in or at the helpline 07969016551.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE = "I can't discuss violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE_GRAPHIC = "I can't discuss graphic violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_DEFAULT = "Your message violates our guidelines. I can't answer that.";

export const PINECONE_TOP_K = 20;
export const PINECONE_INDEX_NAME = "my-ai";
