import type { ChatMessage, ChatSession, ChatContext, Level } from "@/types";
import { llmApi } from "../../database/api";
import { llmService } from "../index";
import { useLLMStore } from "@/store/llmStore";

export const chatService = {
  async startSession(context: ChatContext, title?: string): Promise<ChatSession> {
    const sessionTitle = title ?? `Chat — ${context.subject ?? context.mode}`;
    const session = await llmApi.createSession(sessionTitle, context.mode);
    useLLMStore.getState().setCurrentSession(session);
    useLLMStore.getState().setMessages([]);
    return session;
  },

  async loadSession(session: ChatSession): Promise<void> {
    const messages = await llmApi.getMessages(session.id);
    useLLMStore.getState().setCurrentSession(session);
    useLLMStore.getState().setMessages(messages);
  },

  async sendMessage(content: string, level: Level): Promise<void> {
    const store = useLLMStore.getState();
    const { currentSession, chatContext, messages } = store;

    if (!currentSession) throw new Error("Pas de session active");
    if (!chatContext) throw new Error("Pas de contexte de chat");

    const userMsg: ChatMessage = {
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    store.addMessage(userMsg);
    await llmApi.saveMessage(currentSession.id, "user", content);

    const assistantPlaceholder: ChatMessage = {
      role: "assistant",
      content: "",
      isStreaming: true,
      created_at: new Date().toISOString(),
    };
    store.addMessage(assistantPlaceholder);
    store.setIsStreaming(true);

    try {
      const allMessages = [...messages, userMsg];
      const response = await llmService.sendMessage(
        content,
        chatContext,
        allMessages,
        level,
        (fullContent) => {
          store.updateLastMessage(fullContent, false);
        }
      );

      store.updateLastMessage(response, true);
      store.setIsStreaming(false);

      const settings = store.settings;
      await llmApi.saveMessage(
        currentSession.id,
        "assistant",
        response,
        settings?.model_name
      );
    } catch (err) {
      store.setIsStreaming(false);
      const errMsg = err instanceof Error ? err.message : "Erreur inconnue";
      store.updateLastMessage(`Erreur : ${errMsg}`, true);
      throw err;
    }
  },

  async loadSessions(): Promise<void> {
    const sessions = await llmApi.getSessions(20);
    useLLMStore.getState().setSessions(sessions);
  },

  async deleteSession(sessionId: number): Promise<void> {
    await llmApi.deleteSession(sessionId);
    const sessions = useLLMStore.getState().sessions.filter((s: ChatSession) => s.id !== sessionId);
    useLLMStore.getState().setSessions(sessions);
  },

  async clearAll(): Promise<void> {
    await llmApi.clearHistory();
    useLLMStore.getState().setSessions([]);
    useLLMStore.getState().clearChat();
  },
};
