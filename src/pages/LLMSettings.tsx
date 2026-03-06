import { useState, useEffect } from "react";
import { Bot, Save, RefreshCw, Trash2, ChevronDown, Check, AlertCircle, Info } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useLLMStore } from "@/store/llmStore";
import { llmService } from "@/services/llm";
import { chatService } from "@/services/chat/chatService";
import { KNOWN_MODELS } from "@/services/llm/modelManager";
import ModelStatus from "@/components/chat/ModelStatus";
import type { LLMSettings as LLMSettingsType } from "@/types";

export default function LLMSettings() {
  const storeSettings = useLLMStore((s) => s.settings);
  const modelStatus = useLLMStore((s) => s.modelStatus);

  const [settings, setSettings] = useState<Partial<LLMSettingsType>>({});
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (storeSettings) {
      setSettings(storeSettings);
    } else {
      llmService.init();
    }
  }, [storeSettings]);

  const handleLoadModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await llmService.listAvailableModels();
      setAvailableModels(models);
      if (models.length === 0) {
        toast("Aucun modèle trouvé. Lancez : ollama pull qwen2.5:7b", { icon: "ℹ️" });
      }
    } catch {
      toast.error("Impossible de lister les modèles");
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await llmService.updateSettings(settings as LLMSettingsType);
      toast.success("Paramètres IA sauvegardés");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Supprimer tout l'historique des conversations ?")) return;
    try {
      await chatService.clearAll();
      toast.success("Historique supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const update = (key: keyof LLMSettingsType, value: unknown) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Assistant IA</h1>
          <p className="text-sm text-gray-400">Configuration du modèle local</p>
        </div>
      </div>

      {/* Statut du modèle */}
      <ModelStatus />

      {/* Provider */}
      <section className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🔧</span> Configuration du provider
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider LLM
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "ollama", label: "Ollama", desc: "Recommandé" },
                { id: "llamacpp", label: "llama.cpp", desc: "Avancé" },
                { id: "none", label: "Désactivé", desc: "" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => update("provider", p.id)}
                  className={clsx(
                    "p-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                    settings.provider === p.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                      : "border-sand-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  )}
                >
                  <div>{p.label}</div>
                  {p.desc && <div className="text-xs opacity-60 mt-0.5">{p.desc}</div>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL du serveur
            </label>
            <input
              type="text"
              value={settings.base_url ?? "http://localhost:11434"}
              onChange={(e) => update("base_url", e.target.value)}
              className="input-text w-full"
              placeholder="http://localhost:11434"
            />
          </div>
        </div>
      </section>

      {/* Modèle */}
      <section className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🤖</span> Modèle
        </h2>

        <div className="space-y-4">
          {/* Modèle actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Modèle actif
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.model_name ?? ""}
                onChange={(e) => update("model_name", e.target.value)}
                className="input-text flex-1"
                placeholder="qwen2.5:7b"
              />
              <button
                onClick={handleLoadModels}
                disabled={isLoadingModels}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={clsx("w-4 h-4", isLoadingModels && "animate-spin")} />
                {isLoadingModels ? "..." : "Lister"}
              </button>
            </div>
          </div>

          {/* Modèles disponibles localement */}
          {availableModels.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Modèles installés :</p>
              {availableModels.map((m) => (
                <button
                  key={m}
                  onClick={() => update("model_name", m)}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    settings.model_name === m
                      ? "bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                      : "bg-sand-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-sand-100"
                  )}
                >
                  <span className="font-mono">{m}</span>
                  {settings.model_name === m && <Check className="w-4 h-4 text-primary-500" />}
                </button>
              ))}
            </div>
          )}

          {/* Modèles recommandés */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">Modèles recommandés :</p>
            <div className="space-y-2">
              {KNOWN_MODELS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => update("model_name", m.name)}
                  className={clsx(
                    "w-full text-left p-3 rounded-xl border transition-all",
                    settings.model_name === m.name
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-950"
                      : "border-sand-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{m.display_name}</span>
                    <div className="flex items-center gap-1.5">
                      {m.is_recommended && (
                        <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                          Recommandé
                        </span>
                      )}
                      {settings.model_name === m.name && (
                        <Check className="w-4 h-4 text-primary-500" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {m.description_fr}
                  </div>
                  <div className="mt-1.5 flex gap-2">
                    <span className="text-xs bg-sand-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
                      {m.language_focus}
                    </span>
                    <span className="text-xs bg-sand-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
                      ctx: {(m.context_size / 1000).toFixed(0)}k
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Paramètres avancés */}
      <section className="card">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between font-semibold text-gray-900 dark:text-white"
        >
          <span className="flex items-center gap-2">⚙️ Paramètres avancés</span>
          <ChevronDown className={clsx("w-4 h-4 transition-transform", showAdvanced && "rotate-180")} />
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 space-y-4"
          >
            {/* Température */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span>Température (créativité)</span>
                <span className="font-mono text-primary-500">{settings.temperature?.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={0} max={1} step={0.1}
                value={settings.temperature ?? 0.7}
                onChange={(e) => update("temperature", parseFloat(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Précis</span>
                <span>Créatif</span>
              </div>
            </div>

            {/* Max tokens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tokens maximum par réponse
              </label>
              <input
                type="number"
                min={256} max={8192} step={256}
                value={settings.max_tokens ?? 2048}
                onChange={(e) => update("max_tokens", parseInt(e.target.value))}
                className="input-text w-full"
              />
            </div>

            {/* Langue système */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Langue de l'assistant
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: "fr", label: "Français" }, { id: "en", label: "English" }].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => update("system_language", l.id)}
                    className={clsx(
                      "p-2.5 rounded-xl border text-sm font-medium transition-all",
                      settings.system_language === l.id
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700"
                        : "border-sand-200 dark:border-gray-700 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Streaming des réponses</span>
                <button
                  onClick={() => update("streaming", !settings.streaming)}
                  className={clsx(
                    "w-11 h-6 rounded-full transition-colors",
                    settings.streaming ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
                  )}
                >
                  <span className={clsx(
                    "block w-5 h-5 rounded-full bg-white shadow transition-transform m-0.5",
                    settings.streaming ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode tuteur actif</span>
                <button
                  onClick={() => update("tutor_mode", !settings.tutor_mode)}
                  className={clsx(
                    "w-11 h-6 rounded-full transition-colors",
                    settings.tutor_mode ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
                  )}
                >
                  <span className={clsx(
                    "block w-5 h-5 rounded-full bg-white shadow transition-transform m-0.5",
                    settings.tutor_mode ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </label>
            </div>
          </motion.div>
        )}
      </section>

      {/* Danger zone */}
      <section className="card border-red-200 dark:border-red-900">
        <h2 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Zone de danger
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Supprimer tout l'historique des conversations IA. Cette action est irréversible.
        </p>
        <button
          onClick={handleClearHistory}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer l'historique
        </button>
      </section>

      {/* Bouton sauvegarder */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {isSaving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
      </button>
    </div>
  );
}
