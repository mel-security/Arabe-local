import { clsx } from "clsx";

interface ProgressBarProps {
  value: number;     // 0-100
  max?: number;      // optionnel, si on passe total/current
  current?: number;
  label?: string;
  showPercent?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "green" | "blue" | "purple" | "orange";
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const colorClasses = {
  primary: "from-primary-400 to-primary-600",
  green:   "from-green-400 to-green-600",
  blue:    "from-blue-400 to-blue-600",
  purple:  "from-purple-400 to-purple-600",
  orange:  "from-orange-400 to-orange-600",
};

export default function ProgressBar({
  value,
  max,
  current,
  label,
  showPercent = false,
  size = "md",
  color = "primary",
  className,
  animated = false,
}: ProgressBarProps) {
  let percent = value;
  if (max !== undefined && current !== undefined) {
    percent = max > 0 ? (current / max) * 100 : 0;
  }

  percent = Math.max(0, Math.min(100, percent));

  return (
    <div className={clsx("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
          )}
          {showPercent && (
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}

      <div className={clsx("progress-bar", sizeClasses[size])}>
        <div
          className={clsx(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
            colorClasses[color],
            animated && percent > 0 && "animate-pulse-slow"
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {max !== undefined && current !== undefined && (
        <p className="text-xs text-gray-400 mt-1">
          {current} / {max}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Cercle de progression
// ============================================================

interface CircleProgressProps {
  value: number;  // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CircleProgress({
  value,
  size = 80,
  strokeWidth = 6,
  color = "#e09415",
  children,
  className,
}: CircleProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className={clsx("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-sand-200 dark:text-gray-700"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
