import { useEffect } from "react";
import { Bot, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { useLLMStore } from "@/store/llmStore";
import { llmService } from "@/services/llm";

interface ModelStatusProps {
  compact?: boolean;
  className?: string;
}

export default function ModelStatus({ compact = false, className }: ModelStatusProps) {
  const modelStatus = useLLMStore((s) => s.modelStatus);
  const isChecking = useLLMStore((s) => s.isCheckingModel);

  useEffect(() => {
    llmService.checkStatus();
  }, []);

  const handleRefresh = () => llmService.checkStatus();

  if (compact) {
    return (
      <button
        onClick={handleRefresh}
        title={modelStatus?.available ? `IA : ${modelStatus.model}` : (modelStatus?.error ?? "IA non disponible")}
        className={clsx("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors", className,
          isChecking ? "bg-gray-100 dark:bg-gray-800 text-gray-500" :
          modelStatus?.available
            ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
            : "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
        )}
      >
        {isChecking ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : modelStatus?.available ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        {!compact && <span>IA</span>}
        <Bot className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className={clsx("rounded-xl border p-4", className,
      modelStatus?.available
        ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
        : "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isChecking ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : modelStatus?.available ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-orange-500" />
          )}
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {isChecking ? "Vérification..." : modelStatus?.available ? "IA disponible" : "IA non disponible"}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isChecking}
          className="btn-icon text-gray-400 hover:text-gray-600"
        >
          <RefreshCw className={clsx("w-4 h-4", isChecking && "animate-spin")} />
        </button>
      </div>

      {modelStatus && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Modèle : <span className="font-mono font-medium">{modelStatus.model}</span></p>
          <p>Provider : <span className="capitalize">{modelStatus.provider}</span></p>
          {!modelStatus.available && modelStatus.error && (
            <p className="text-orange-600 dark:text-orange-400 mt-2">{modelStatus.error}</p>
          )}
        </div>
      )}

      {!modelStatus?.available && (
        <div className="mt-3 p-2 bg-white dark:bg-gray-900 rounded-lg text-xs text-gray-600 dark:text-gray-300">
          <p className="font-medium mb-1">Pour activer l'IA :</p>
          <code className="block bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 mt-1">ollama serve</code>
          <code className="block bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 mt-1">ollama pull qwen2.5:7b</code>
        </div>
      )}
    </div>
  );
}
