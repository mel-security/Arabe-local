import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Send, Square, Mic } from "lucide-react";
import { clsx } from "clsx";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = "Posez votre question en arabe ou en français...",
}: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize du textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || isStreaming) return;
    onSend(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Détecter si le texte contient de l'arabe pour RTL
  const hasArabic = /[\u0600-\u06FF]/.test(text);

  return (
    <div className="flex items-end gap-2 p-3 border-t border-sand-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isStreaming}
          placeholder={placeholder}
          rows={1}
          dir={hasArabic ? "rtl" : "ltr"}
          className={clsx(
            "w-full resize-none rounded-xl px-4 py-3 pr-10",
            "bg-sand-50 dark:bg-gray-800",
            "border border-sand-200 dark:border-gray-700",
            "text-sm text-gray-900 dark:text-gray-100",
            "placeholder-gray-400 dark:placeholder-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600",
            "transition-all duration-200",
            (disabled || isStreaming) && "opacity-60 cursor-not-allowed",
            hasArabic && "arabic-text text-base"
          )}
          style={{ minHeight: "44px", maxHeight: "200px" }}
        />
        {text.length > 0 && !isStreaming && (
          <span className="absolute bottom-2 right-3 text-xs text-gray-300 dark:text-gray-600">
            ⏎
          </span>
        )}
      </div>

      {isStreaming ? (
        <button
          onClick={onStop}
          className="flex-shrink-0 w-11 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
          title="Arrêter la génération"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={clsx(
            "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
            text.trim() && !disabled
              ? "bg-primary-500 hover:bg-primary-600 text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
          )}
          title="Envoyer (Entrée)"
        >
          <Send className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
