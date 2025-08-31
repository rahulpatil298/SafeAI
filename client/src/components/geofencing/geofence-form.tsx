import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { insertGeofenceSchema } from "@shared/schema";
import { Plus, MapPin, Target } from "lucide-react";
import { z } from "zod";

const formSchema = insertGeofenceSchema.extend({
  centerLat: z.string(),
  centerLng: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface GeofenceFormProps {
  onSubmit: (data: FormData) => void;
  onLocationSelect?: () => void;
}

export function GeofenceForm({ onSubmit, onLocationSelect }: GeofenceFormProps) {
  const [radius, setRadius] = useState([200]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "office_zone",
      centerLat: "",
      centerLng: "",
      radius: 200,
      startTime: "09:00",
      endTime: "18:00",
      entryNotifications: true,
      exitNotifications: true,
      violationAlerts: false,
      isActive: true,
    }
  });

  const handleRadiusChange = (value: number[]) => {
    setRadius(value);
    setValue("radius", value[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Create Geofence</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Zone Name</Label>
              <Input
                id="name"
                placeholder="e.g., Mumbai Office Main"
                {...register("name")}
                className="mt-2"
                data-testid="geofence-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium text-foreground">Zone Type</Label>
              <Select onValueChange={(value) => setValue("type", value as any)} defaultValue="office_zone">
                <SelectTrigger className="mt-2" data-testid="geofence-type-select">
                  <SelectValue placeholder="Select zone type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office_zone">Office Zone</SelectItem>
                  <SelectItem value="project_site">Project Site</SelectItem>
                  <SelectItem value="restricted_area">Restricted Area</SelectItem>
                  <SelectItem value="client_location">Client Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Center Location</Label>
              <div className="relative mt-2">
                <Input
                  placeholder="Search or click on map"
                  {...register("centerLat")}
                  data-testid="geofence-location-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={onLocationSelect}
                  data-testid="geofence-location-select-button"
                >
                  <Target className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Radius (meters)</Label>
              <div className="mt-2">
                <Slider
                  value={radius}
                  onValueChange={handleRadiusChange}
                  max={1000}
                  min={50}
                  step={10}
                  className="w-full"
                  data-testid="geofence-radius-slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>50m</span>
                  <span className="font-medium text-primary">{radius[0]}m</span>
                  <span>1000m</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Active Hours</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label htmlFor="startTime" className="text-xs text-muted-foreground">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register("startTime")}
                    className="mt-1"
                    data-testid="geofence-start-time"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-xs text-muted-foreground">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register("endTime")}
                    className="mt-1"
                    data-testid="geofence-end-time"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Alert Settings</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="entryNotifications"
                    defaultChecked
                    onCheckedChange={(checked) => setValue("entryNotifications", !!checked)}
                    data-testid="geofence-entry-notifications"
                  />
                  <Label htmlFor="entryNotifications" className="text-sm text-foreground">
                    Entry notifications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exitNotifications"
                    defaultChecked
                    onCheckedChange={(checked) => setValue("exitNotifications", !!checked)}
                    data-testid="geofence-exit-notifications"
                  />
                  <Label htmlFor="exitNotifications" className="text-sm text-foreground">
                    Exit notifications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="violationAlerts"
                    onCheckedChange={(checked) => setValue("violationAlerts", !!checked)}
                    data-testid="geofence-violation-alerts"
                  />
                  <Label htmlFor="violationAlerts" className="text-sm text-foreground">
                    Violation alerts
                  </Label>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-hover"
              data-testid="create-geofence-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Geofence
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
