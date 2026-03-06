import { clsx } from "clsx";

interface ArabicTextProps {
  text: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "display";
  className?: string;
  color?: string;
  bold?: boolean;
  onClick?: () => void;
  title?: string;
}

const sizeClasses: Record<string, string> = {
  sm:      "arabic-sm",
  md:      "arabic-word",
  lg:      "arabic-text text-arabic-lg",
  xl:      "arabic-text text-arabic-xl",
  "2xl":   "arabic-text text-arabic-2xl",
  "3xl":   "arabic-text text-arabic-3xl",
  display: "arabic-display",
};

/**
 * Composant pour afficher du texte arabe avec les bons paramètres de rendu.
 * Gère automatiquement RTL, les polices et le scaling.
 */
export default function ArabicText({
  text,
  size = "md",
  className,
  color,
  bold = false,
  onClick,
  title,
}: ArabicTextProps) {
  return (
    <span
      className={clsx(
        sizeClasses[size],
        bold && "font-bold",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      style={color ? { color } : undefined}
      onClick={onClick}
      title={title}
      lang="ar"
    >
      {text}
    </span>
  );
}

/**
 * Bloc RTL pour les paragraphes arabes
 */
export function ArabicBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      dir="rtl"
      lang="ar"
      className={clsx(
        "arabic-text text-right leading-loose",
        className
      )}
    >
      {children}
    </div>
  );
}
