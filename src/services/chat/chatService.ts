import type { ChatMessage, ChatSession, ChatContext, Level } from "@/types";
import { llmApi } from "../database";
import { llmService } from "../llm";
import { useLLMStore } from "@/store/llmStore";

export const chatService = {
  /**
   * Ouvre ou crée une session de chat
   */
  async startSession(context: ChatContext, title?: string): Promise<ChatSession> {
    const sessionTitle = title ?? `Chat — ${context.subject ?? context.mode}`;
    const session = await llmApi.createSession(sessionTitle, context.mode);
    useLLMStore.getState().setCurrentSession(session);
    useLLMStore.getState().setMessages([]);
    return session;
  },

  /**
   * Charge les messages d'une session existante
   */
  async loadSession(session: ChatSession): Promise<void> {
    const messages = await llmApi.getMessages(session.id);
    useLLMStore.getState().setCurrentSession(session);
    useLLMStore.getState().setMessages(messages);
  },

  /**
   * Envoie un message et obtient une réponse
   */
  async sendMessage(
    content: string,
    level: Level
  ): Promise<void> {
    const store = useLLMStore.getState();
    const { currentSession, chatContext, messages } = store;

    if (!currentSession) {
      throw new Error("Pas de session active");
    }
    if (!chatContext) {
      throw new Error("Pas de contexte de chat");
    }

    // Ajouter le message utilisateur
    const userMsg: ChatMessage = {
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    store.addMessage(userMsg);

    // Sauvegarder en base
    await llmApi.saveMessage(currentSession.id, "user", content);

    // Préparer le placeholder assistant
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

      // Finaliser le message
      store.updateLastMessage(response, true);
      store.setIsStreaming(false);

      // Sauvegarder la réponse
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
      store.updateLastMessage(`❌ Erreur : ${errMsg}`, true);
      throw err;
    }
  },

  /**
   * Recharge toutes les sessions
   */
  async loadSessions(): Promise<void> {
    const sessions = await llmApi.getSessions(20);
    useLLMStore.getState().setSessions(sessions);
  },

  /**
   * Supprime une session
   */
  async deleteSession(sessionId: number): Promise<void> {
    await llmApi.deleteSession(sessionId);
    const sessions = useLLMStore.getState().sessions.filter((s) => s.id !== sessionId);
    useLLMStore.getState().setSessions(sessions);
  },

  /**
   * Efface tout l'historique
   */
  async clearAll(): Promise<void> {
    await llmApi.clearHistory();
    useLLMStore.getState().setSessions([]);
    useLLMStore.getState().clearChat();
  },
};
