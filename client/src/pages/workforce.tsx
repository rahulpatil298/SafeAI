import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/stats/stat-card";
import { EmployeeCard } from "@/components/workforce/employee-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { MapContainer } from "@/components/maps/map-container";
import { 
  UserCheck, 
  Watch, 
  UserX, 
  MapPin,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Bell
} from "lucide-react";
import type { Employee } from "@shared/schema";

export default function Workforce() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: employees, isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const filteredEmployees = employees?.filter((employee: Employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEmployeeLocationClick = (employee: Employee) => {
    console.log("Show employee location:", employee);
    // TODO: Focus map on employee location
  };

  if (isLoading) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Workforce Management</h2>
          <p className="text-muted-foreground">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Workforce Management</h2>
        <p className="text-muted-foreground">Monitor employee attendance and location tracking</p>
      </div>

      {/* Workforce Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Present Today"
          value={dashboardStats?.presentToday || 0}
          icon={UserCheck}
          iconColor="text-accent"
        />
        
        <StatCard
          title="Late Arrivals"
          value={dashboardStats?.lateArrivals || 0}
          icon={Watch}
          iconColor="text-warning"
        />
        
        <StatCard
          title="Absent"
          value={dashboardStats?.absent || 0}
          icon={UserX}
          iconColor="text-destructive"
        />
        
        <StatCard
          title="On Field"
          value={dashboardStats?.onField || 0}
          icon={MapPin}
          iconColor="text-primary"
        />
      </div>

      {/* Employee List and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">Employee Status</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                    data-testid="employee-search-input"
                  />
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="outline" size="icon" data-testid="employee-filter-button">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No employees found</p>
                </div>
              ) : (
                filteredEmployees.map((employee: Employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onLocationClick={handleEmployeeLocationClick}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Map */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Employee Locations</CardTitle>
                <Button size="sm" className="bg-primary text-primary-foreground" data-testid="refresh-locations-button">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ErrorBoundary fallbackMessage="The map could not be loaded. Please try again later.">
                <MapContainer
                  title=""
                  type="employee"
                  height="400px"
                  showControls={false}
                  showLegend={true}
                />
              </ErrorBoundary>
              
              {/* Quick Actions */}
              <div className="flex space-x-2 mt-4">
                <Button variant="outline" className="flex-1" data-testid="export-report-button">
                  <FileText className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
                <Button variant="outline" className="flex-1" data-testid="send-alert-button">
                  <Bell className="h-4 w-4 mr-1" />
                  Send Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
