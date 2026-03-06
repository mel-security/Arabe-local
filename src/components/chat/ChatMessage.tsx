import { useState } from "react";
import { Copy, Check, Bot, User } from "lucide-react";
import { clsx } from "clsx";
import type { ChatMessage as ChatMsg } from "@/types";

interface ChatMessageProps {
  message: ChatMsg;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Détecter si le contenu contient de l'arabe (RTL)
  const hasArabic = /[\u0600-\u06FF]/.test(message.content);

  return (
    <div className={clsx(
      "flex gap-3 group",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={clsx(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
        isUser
          ? "bg-primary-500 text-white"
          : "bg-accent-500 text-white"
      )}>
        {isUser
          ? <User className="w-4 h-4" />
          : <Bot className="w-4 h-4" />
        }
      </div>

      {/* Bulle de message */}
      <div className={clsx(
        "relative max-w-[80%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "bg-primary-500 text-white rounded-tr-sm"
          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-sand-100 dark:border-gray-700 rounded-tl-sm shadow-sm"
      )}>
        {/* Contenu du message */}
        <div
          className={clsx(
            "whitespace-pre-wrap break-words leading-relaxed",
            hasArabic && !isUser && "text-right"
          )}
          dir={hasArabic && !isUser ? "auto" : "ltr"}
        >
          {formatMessageContent(message.content)}
        </div>

        {/* Indicateur de streaming */}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-current opacity-70 animate-pulse ml-1 rounded-sm" />
        )}

        {/* Heure + bouton copier (assistant uniquement) */}
        {!isUser && !isStreaming && message.content && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-sand-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.created_at && (
              <span className="text-xs text-gray-400">
                {new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatMessageContent(content: string) {
  if (!content) return null;

  // Sépare le texte en segments : code blocks, texte arabe, texte normal
  const lines = content.split("\n");
  const result: React.ReactNode[] = [];
  let codeBuffer: string[] = [];
  let inCode = false;

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (inCode) {
        result.push(
          <pre key={`code-${i}`} className="mt-2 mb-2 p-3 bg-gray-900 dark:bg-gray-950 text-green-400 rounded-lg text-xs overflow-x-auto font-mono">
            {codeBuffer.join("\n")}
          </pre>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }
    } else if (inCode) {
      codeBuffer.push(line);
    } else {
      // Détecter l'arabe dans la ligne pour RTL
      const hasAr = /[\u0600-\u06FF]/.test(line);
      result.push(
        <span key={i} dir={hasAr ? "rtl" : "ltr"} className={clsx("block", hasAr && "arabic-text text-base")}>
          {line || " "}
        </span>
      );
    }
  });

  return result;
}
