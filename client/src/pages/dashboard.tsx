import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stats/stat-card";
import { Link } from "wouter";
import { 
  Route, 
  Users, 
  AlertTriangle, 
  Shield,
  ArrowUp,
  MapPinOff,
  UserCheck,
  CircleAlert,
  Plus,
  RefreshCw
} from "lucide-react";
import type { DashboardStats, SystemStatus } from "@/types";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
  });

  if (statsLoading) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const dashboardStats: DashboardStats = stats || {
    activeRoutes: 0,
    onlineEmployees: 0,
    geofenceAlerts: 0,
    safetyScore: 0,
    presentToday: 0,
    lateArrivals: 0,
    absent: 0,
    onField: 0,
  };

  const systemStatus: SystemStatus = {
    mapMyIndiaApi: "online",
    firebaseConnection: "online", 
    aiRouteEngine: "online",
    geofencingService: "warning",
  };

  return (
    <div className="fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Routes"
          value={dashboardStats.activeRoutes}
          icon={Route}
          trend={{
            value: "12% from last week",
            isPositive: true,
            icon: ArrowUp
          }}
        />
        
        <StatCard
          title="Online Employees"
          value={dashboardStats.onlineEmployees}
          icon={Users}
          iconColor="text-accent"
          trend={{
            value: "5% from yesterday",
            isPositive: true,
            icon: ArrowUp
          }}
        />
        
        <StatCard
          title="Geofence Alerts"
          value={dashboardStats.geofenceAlerts}
          icon={AlertTriangle}
          iconColor="text-warning"
          subtitle="Needs attention"
        />
        
        <StatCard
          title="Safety Score"
          value={`${dashboardStats.safetyScore}%`}
          icon={Shield}
          iconColor="text-accent"
          subtitle="Excellent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <MapPinOff className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground" data-testid="activity-route-optimized">
                      New route optimized for Team Delta
                    </p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground" data-testid="activity-employee-checkin">
                      Employee check-in at Mumbai Office
                    </p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <CircleAlert className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground" data-testid="activity-geofence-violation">
                      Geofence violation detected
                    </p>
                    <p className="text-xs text-muted-foreground">12 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/routes">
                  <Button 
                    className="w-full btn-hover bg-primary text-primary-foreground"
                    data-testid="quick-action-plan-route"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Plan New Route
                  </Button>
                </Link>
                
                <Link href="/geofencing">
                  <Button 
                    className="w-full btn-hover bg-secondary text-secondary-foreground"
                    data-testid="quick-action-create-geofence"
                  >
                    <MapPinOff className="h-4 w-4 mr-2" />
                    Create Geofence
                  </Button>
                </Link>
                
                <Link href="/workforce">
                  <Button 
                    className="w-full btn-hover bg-accent text-accent-foreground"
                    data-testid="quick-action-view-attendance"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Attendance
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">MapMyIndia API</span>
                  <span 
                    className={`status-indicator ${
                      systemStatus.mapMyIndiaApi === "online" ? "status-online" : "status-offline"
                    }`}
                    data-testid="status-mapmyindia"
                  ></span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Firebase Connection</span>
                  <span 
                    className={`status-indicator ${
                      systemStatus.firebaseConnection === "online" ? "status-online" : "status-offline"
                    }`}
                    data-testid="status-firebase"
                  ></span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Route Engine</span>
                  <span 
                    className={`status-indicator ${
                      systemStatus.aiRouteEngine === "online" ? "status-online" : "status-offline"
                    }`}
                    data-testid="status-ai-engine"
                  ></span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Geofencing Service</span>
                  <span 
                    className={`status-indicator ${
                      systemStatus.geofencingService === "warning" ? "status-warning" : 
                      systemStatus.geofencingService === "online" ? "status-online" : "status-offline"
                    }`}
                    data-testid="status-geofencing"
                  ></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
