import { Fuel, Zap, Trash2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  emission: number;
  isHighest: boolean;
  color: "fuel" | "electricity" | "waste";
}

const colorClasses = {
  fuel: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  electricity: "from-yellow-400/20 to-amber-400/20 border-yellow-500/30",
  waste: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
};

const iconColors = {
  fuel: "text-amber-600",
  electricity: "text-yellow-500",
  waste: "text-emerald-600",
};

export const CategoryCard = ({ icon: Icon, title, emission, isHighest, color }: CategoryCardProps) => {
  return (
    <div
      className={cn(
        "relative p-4 rounded-xl bg-gradient-to-br border transition-all duration-300",
        colorClasses[color],
        isHighest && "ring-2 ring-destructive/50 scale-105"
      )}
    >
      {isHighest && (
        <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-medium">
          Highest
        </span>
      )}
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-card/50", iconColors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-lg font-semibold text-foreground">
            {emission.toFixed(2)} <span className="text-sm font-normal">kg CO₂</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const CategoryIcons = { Fuel, Zap, Trash2 };
