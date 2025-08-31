import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Route, 
  BarChart3, 
  MapPin, 
  Users 
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/routes", label: "Route Planning", icon: MapPin },
    { path: "/workforce", label: "Workforce", icon: Users },
    { path: "/geofencing", label: "Geofencing", icon: Route },
  ];

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-lg animate-slide-in-left">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Route className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">SafeWay AI</h1>
          </div>
          
          <nav className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-medium text-foreground hover:bg-muted"
                    onClick={onClose}
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
