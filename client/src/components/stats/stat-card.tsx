import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    icon: LucideIcon;
  };
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = "text-primary",
  trend 
}: StatCardProps) {
  return (
    <Card className="card-hover" data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground" data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
            {(subtitle || trend) && (
              <div className="flex items-center mt-1">
                {trend && (
                  <div className={`text-xs flex items-center ${
                    trend.isPositive ? "text-accent" : "text-warning"
                  }`}>
                    <trend.icon className="h-3 w-3 mr-1" />
                    {trend.value}
                  </div>
                )}
                {subtitle && !trend && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            )}
          </div>
          <div className={`w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center`}>
            <Icon className={`text-xl ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
