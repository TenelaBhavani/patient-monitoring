import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "normal" | "warning" | "critical" | "offline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusIndicator({ 
  status, 
  size = "md", 
  className 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4",
  };

  const statusClasses = {
    normal: "bg-green-500 shadow-green-500/50",
    warning: "bg-yellow-500 shadow-yellow-500/50 animate-pulse",
    critical: "bg-red-500 shadow-red-500/50 animate-pulse",
    offline: "bg-slate-500 shadow-slate-500/50",
  };

  return (
    <div
      className={cn(
        "rounded-full shadow-lg",
        sizeClasses[size],
        statusClasses[status],
        className
      )}
    />
  );
}