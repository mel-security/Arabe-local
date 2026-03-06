import { clsx } from "clsx";
import type { Level } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "green" | "blue" | "purple" | "orange" | "gray" | "red";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  primary: "bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300",
  green:   "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  blue:    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  purple:  "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  orange:  "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  gray:    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  red:     "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const sizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export default function Badge({ children, variant = "gray", size = "md", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Badge spécifique au niveau
const levelConfig: Record<Level, { label: string; variant: BadgeProps["variant"] }> = {
  beginner:     { label: "Débutant",     variant: "green" },
  intermediate: { label: "Intermédiaire", variant: "blue" },
  advanced:     { label: "Avancé",       variant: "purple" },
  expert:       { label: "Expert",       variant: "orange" },
};

export function LevelBadge({ level }: { level: Level }) {
  const { label, variant } = levelConfig[level] ?? { label: level, variant: "gray" };
  return <Badge variant={variant}>{label}</Badge>;
}

// Badge "Appris"
export function LearnedBadge({ learned }: { learned: boolean }) {
  if (!learned) return null;
  return (
    <Badge variant="green" size="sm">
      ✓ Appris
    </Badge>
  );
}
