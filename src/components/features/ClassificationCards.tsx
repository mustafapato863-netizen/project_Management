import React from "react";
import {
  Award,
  Target,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClassificationData {
  current: { A: number; B: number; C: number };
  previous: { A: number; B: number; C: number };
  change: { A: number; B: number; C: number };
  total?: number;
}

interface Props {
  data: ClassificationData;
  titleSuffix?: string; // لإضافة اسم الفريق مثلاً (Class A - Digital)
}

const ClassificationCards: React.FC<Props> = ({ data, titleSuffix = "" }) => {
  const cards = [
    {
      key: "A" as const,
      label: "Class A (Top)",
      badge: "Extra Reward",
      icon: Award,
      colorClass: "green",
      gradient: "from-green-50 to-emerald-50",
      border: "border-green-200",
    },
    {
      key: "B" as const,
      label: "Class B (Mid)",
      badge: "Development",
      icon: Target,
      colorClass: "blue",
      gradient: "from-blue-50 to-cyan-50",
      border: "border-blue-200",
    },
    {
      key: "C" as const,
      label: "Class C (Low)",
      badge: "Feedback",
      icon: AlertTriangle,
      colorClass: "orange",
      gradient: "from-orange-50 to-amber-50",
      border: "border-orange-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const currentVal = data.current[card.key];
        const prevVal = data.previous[card.key];
        const changeVal = data.change[card.key];

        return (
          <Card
            key={card.key}
            className={`${card.gradient} ${card.border} border-2`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 text-${card.colorClass}-600`} />
                  <span
                    className={`text-sm font-medium text-${card.colorClass}-700`}
                  >
                    {card.label} {titleSuffix}
                  </span>
                </div>
                <Badge
                  className={`bg-${card.colorClass}-600 text-white text-xs`}
                >
                  {card.badge}
                </Badge>
              </div>
              <div
                className={`text-4xl font-bold text-${card.colorClass}-800 mb-1`}
              >
                {currentVal}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                {changeVal > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      +{changeVal} from last week
                    </span>
                  </>
                ) : changeVal < 0 ? (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-red-600 font-semibold">
                      {changeVal} from last week
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500">
                    No change from last week
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Previous: {prevVal}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ClassificationCards;
