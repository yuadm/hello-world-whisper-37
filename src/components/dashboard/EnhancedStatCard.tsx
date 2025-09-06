import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  showGlow?: boolean;
}

export function EnhancedStatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  trend,
  className,
  showGlow = false
}: EnhancedStatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          card: "border-success/30 bg-gradient-to-br from-success-soft via-card to-card",
          icon: "bg-gradient-to-br from-success to-success/80 text-white shadow-lg shadow-success/25",
          trend: "text-success",
          glow: "shadow-[0_0_30px_hsl(var(--success)/0.3)]"
        };
      case "warning":
        return {
          card: "border-warning/30 bg-gradient-to-br from-warning-soft via-card to-card",
          icon: "bg-gradient-to-br from-warning to-warning/80 text-white shadow-lg shadow-warning/25",
          trend: "text-warning",
          glow: "shadow-[0_0_30px_hsl(var(--warning)/0.3)]"
        };
      case "danger":
        return {
          card: "border-destructive/30 bg-gradient-to-br from-destructive-soft via-card to-card",
          icon: "bg-gradient-to-br from-destructive to-destructive/80 text-white shadow-lg shadow-destructive/25",
          trend: "text-destructive",
          glow: "shadow-[0_0_30px_hsl(var(--destructive)/0.3)]"
        };
      case "info":
        return {
          card: "border-accent/30 bg-gradient-to-br from-accent-soft via-card to-card",
          icon: "bg-gradient-to-br from-accent to-accent/80 text-white shadow-lg shadow-accent/25",
          trend: "text-accent",
          glow: "shadow-[0_0_30px_hsl(var(--accent)/0.3)]"
        };
      default:
        return {
          card: "border-primary/30 bg-gradient-to-br from-primary-soft via-card to-card",
          icon: "bg-gradient-primary text-white shadow-lg shadow-primary/25",
          trend: "text-primary",
          glow: "shadow-glow-lg"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-sm",
        "transition-all duration-300 ease-smooth hover-lift",
        "before:absolute before:inset-0 before:bg-gradient-mesh before:opacity-0 before:transition-opacity before:duration-500",
        "hover:before:opacity-30",
        styles.card,
        showGlow && styles.glow,
        className
      )}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
      </div>

      <div className="relative p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="space-y-1">
              <p className="text-4xl font-bold text-foreground tracking-tight">
                {value}
              </p>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          <div className={cn(
            "relative w-14 h-14 rounded-2xl flex items-center justify-center",
            "transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            styles.icon
          )}>
            <Icon className="w-7 h-7" />
            {showGlow && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-50 blur-xl animate-pulse" />
            )}
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              "bg-gradient-to-r",
              trend.value > 0 
                ? "from-success/10 to-success/20 text-success" 
                : "from-destructive/10 to-destructive/20 text-destructive"
            )}>
              {trend.value > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}