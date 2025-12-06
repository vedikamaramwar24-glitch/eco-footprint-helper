import { Lightbulb } from "lucide-react";

interface SavingTipsProps {
  tips: string[];
  category: string;
}

export const SavingTips = ({ tips, category }: SavingTipsProps) => {
  if (tips.length === 0) return null;

  const categoryLabels = {
    fuel: "Fuel",
    electricity: "Electricity",
    waste: "Waste",
  };

  return (
    <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">
          Tips to Reduce Your {categoryLabels[category as keyof typeof categoryLabels]} Emissions
        </h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};
