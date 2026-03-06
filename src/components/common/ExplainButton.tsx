import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useLLMStore } from "@/store/llmStore";
import { useAppStore } from "@/store";
import { llmService } from "@/services/llm";
import toast from "react-hot-toast";
import type { ChatContext } from "@/types";

interface ExplainButtonProps {
  subject: string;
  type: "letter" | "word" | "verse";
  context?: ChatContext;
  variant?: "button" | "icon" | "inline";
  label?: string;
  className?: string;
}

export default function ExplainButton({
  subject,
  type,
  context,
  variant = "button",
  label = "Expliquer avec l'IA",
  className,
}: ExplainButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const openChatWith = useLLMStore((s) => s.openChatWith);
  const modelStatus = useLLMStore((s) => s.modelStatus);
  const user = useAppStore((s) => s.user);

  const handleExplain = async () => {
    if (!modelStatus?.available) {
      toast.error("L'IA locale n'est pas disponible. Lancez Ollama et téléchargez un modèle.", {
        duration: 4000,
      });
      return;
    }

    const chatCtx: ChatContext = context ?? {
      mode: "explanation",
      subject,
      contextRef: type,
    };

    // Ouvrir le chat avec le contexte
    openChatWith(chatCtx);

    // Envoyer automatiquement la question d'explication
    if (!isLoading) {
      setIsLoading(true);
      try {
        const { chatService } = await import("@/services/chat/chatService");
        await chatService.startSession(chatCtx, `Explication : ${subject}`);
        const question = getExplainQuestion(subject, type);
        await chatService.sendMessage(question, user?.level ?? "beginner");
      } catch (err) {
        console.error("Explain error:", err);
        toast.error("Erreur lors de la génération de l'explication");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleExplain}
        disabled={isLoading}
        title={label}
        className={clsx(
          "btn-icon transition-all",
          modelStatus?.available
            ? "text-accent-500 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950"
            : "text-gray-300 dark:text-gray-600 cursor-not-allowed",
          className
        )}
      >
        {isLoading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Sparkles className="w-4 h-4" />
        }
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        onClick={handleExplain}
        disabled={isLoading || !modelStatus?.available}
        className={clsx(
          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all",
          modelStatus?.available
            ? "text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950 hover:bg-accent-100 dark:hover:bg-accent-900"
            : "text-gray-400 bg-gray-50 dark:bg-gray-800 cursor-not-allowed",
          className
        )}
      >
        {isLoading
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <Sparkles className="w-3 h-3" />
        }
        {isLoading ? "Génération..." : label}
      </button>
    );
  }

  return (
    <button
      onClick={handleExplain}
      disabled={isLoading || !modelStatus?.available}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all",
        modelStatus?.available
          ? "bg-accent-500 hover:bg-accent-600 text-white shadow-sm"
          : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed",
        className
      )}
    >
      {isLoading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <Sparkles className="w-4 h-4" />
      }
      {isLoading ? "Génération en cours..." : label}
    </button>
  );
}

function getExplainQuestion(subject: string, type: "letter" | "word" | "verse"): string {
  if (type === "letter") {
    return `Explique-moi en détail la lettre arabe "${subject}" : sa prononciation, ses formes, ses exemples d'usage et ses voyelles.`;
  }
  if (type === "word") {
    return `Explique-moi en détail le mot arabe "${subject}" : son sens, sa racine, ses exemples d'usage dans des phrases, et les mots de la même famille.`;
  }
  return `Explique-moi ce verset coranique : "${subject}". Quel est son sens, son contexte, et les mots-clés importants ?`;
}
