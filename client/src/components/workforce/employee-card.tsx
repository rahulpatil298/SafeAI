import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { Employee } from "@shared/schema";

interface EmployeeCardProps {
  employee: Employee;
  onLocationClick?: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onLocationClick }: EmployeeCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge variant="default" className="bg-success text-success-foreground">Online</Badge>;
      case "on_field":
        return <Badge variant="outline" className="border-accent text-accent">On Field</Badge>;
      case "offline":
        return <Badge variant="secondary">Offline</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "online":
        return "status-online";
      case "on_field":
        return "status-warning";
      case "offline":
        return "status-offline";
      default:
        return "status-offline";
    }
  };

  const getCheckInInfo = (employee: Employee) => {
    if (employee.status === "offline") {
      return <p className="text-xs text-muted-foreground">Absent today</p>;
    } else if (employee.status === "on_field") {
      return <p className="text-xs text-accent">On field: Project site</p>;
    } else {
      return <p className="text-xs text-muted-foreground">Checked in: 9:15 AM • Office</p>;
    }
  };

  return (
    <Card className="hover:bg-muted/50 transition-colors" data-testid={`employee-card-${employee.employeeId}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10 border-2 border-border">
            <AvatarImage src={employee.avatar || undefined} alt={employee.name} />
            <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-foreground" data-testid={`employee-name-${employee.employeeId}`}>
                {employee.name}
              </span>
              <span className={`status-indicator ${getStatusIndicator(employee.status)}`}></span>
              {getStatusBadge(employee.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              ID: {employee.employeeId} • {employee.position}
            </p>
            {getCheckInInfo(employee)}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onLocationClick?.(employee)}
            disabled={employee.status === "offline"}
            className="text-primary hover:text-primary/80 transition-colors"
            data-testid={`employee-location-${employee.employeeId}`}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
