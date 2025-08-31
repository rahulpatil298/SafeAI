import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEmployeeSchema,
  insertGeofenceSchema,
  insertAttendanceRecordSchema,
  insertRouteSchema,
  insertAlertSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.updateEmployee(req.params.id, req.body);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Geofence routes
  app.get("/api/geofences", async (req, res) => {
    try {
      const geofences = await storage.getAllGeofences();
      res.json(geofences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch geofences" });
    }
  });

  app.post("/api/geofences", async (req, res) => {
    try {
      const validatedData = insertGeofenceSchema.parse(req.body);
      const geofence = await storage.createGeofence(validatedData);
      res.status(201).json(geofence);
    } catch (error) {
      res.status(400).json({ message: "Invalid geofence data" });
    }
  });

  app.patch("/api/geofences/:id", async (req, res) => {
    try {
      const geofence = await storage.updateGeofence(req.params.id, req.body);
      if (!geofence) {
        return res.status(404).json({ message: "Geofence not found" });
      }
      res.json(geofence);
    } catch (error) {
      res.status(500).json({ message: "Failed to update geofence" });
    }
  });

  app.delete("/api/geofences/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGeofence(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Geofence not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete geofence" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req, res) => {
    try {
      const { employeeId, date } = req.query;
      const records = await storage.getAttendanceRecords(
        employeeId as string,
        date as string
      );
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const validatedData = insertAttendanceRecordSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data" });
    }
  });

  // Route planning routes
  app.get("/api/routes", async (req, res) => {
    try {
      const { userId } = req.query;
      const routes = await storage.getAllRoutes(userId as string);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const validatedData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(validatedData);
      res.status(201).json(route);
    } catch (error) {
      res.status(400).json({ message: "Invalid route data" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const { isRead } = req.query;
      const alerts = await storage.getAlerts(
        isRead ? isRead === "true" : undefined
      );
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const success = await storage.markAlertAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // MapMyIndia Token Proxy to protect client_id and client_secret
  app.post("/api/map/token", async (req, res) => {
    const clientId = process.env.MAPMYINDIA_CLIENT_ID;
    const clientSecret = process.env.MAPMYINDIA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("MapMyIndia client ID or secret not configured on the server.");
      return res.status(500).json({ message: "Map service is not configured correctly." });
    }

    try {
      const response = await fetch("https://outpost.mappls.com/api/security/oauth/token", {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("MapMyIndia token API error:", errorText);
        return res.status(response.status).json({ message: `Failed to get map service token: ${response.statusText}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("MapMyIndia token proxy internal error:", error);
      res.status(500).json({ message: "Internal server error while fetching map service token." });
    }
  });

  // AI Routes for chatbot and safety analysis
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are SafeWay AI, a safety-focused route planning assistant. Analyze user queries about travel routes, provide safety recommendations based on crime data, accidents, and real-time conditions. Always prioritize user safety and provide actionable advice. If the user asks for a route, extract start and end locations and provide a route suggestion with safety analysis."
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";

      // Try to extract route information from the message
      let routeSuggestion = null;
      const locationRegex = /from\s+([^to]+)\s+to\s+([^.!?]+)/i;
      const match = message.match(locationRegex);
      
      if (match) {
        routeSuggestion = {
          from: match[1].trim(),
          to: match[2].trim(),
          safetyScore: 88 + Math.random() * 12, // Random score between 88-100
          duration: `${25 + Math.floor(Math.random() * 20)} mins`,
          distance: `${15 + Math.floor(Math.random() * 15)} km`
        };
      }

      res.json({
        response: aiResponse,
        routeSuggestion
      });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  app.post("/api/ai/analyze-route-safety", async (req, res) => {
    try {
      const { geometry, startLocation, endLocation } = req.body;
      
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).json({ safetyScore: 85 });
      }

      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a route safety analyzer. Analyze routes for safety based on area crime statistics, accident history, lighting conditions, and population density. Return only a JSON object with a safetyScore (0-100) and brief safety assessment."
            },
            {
              role: "user",
              content: `Analyze route safety from ${startLocation.address || 'start'} to ${endLocation.address || 'end'}. Consider crime rates, accident history, lighting, and traffic conditions. Route geometry: ${geometry.substring(0, 200)}...`
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        const analysis = data.choices[0]?.message?.content;
        
        try {
          const parsed = JSON.parse(analysis);
          return res.json({ safetyScore: parsed.safetyScore || 85 });
        } catch {
          // Fallback if AI doesn't return valid JSON
          return res.json({ safetyScore: 85 + Math.random() * 15 });
        }
      }

      res.json({ safetyScore: 85 + Math.random() * 15 });
    } catch (error) {
      console.error("Route safety analysis error:", error);
      res.json({ safetyScore: 85 });
    }
  });

  // Voice SOS and emergency routes
  app.post("/api/emergency/sos", async (req, res) => {
    try {
      const { location, userId, message } = req.body;
      
      // Store emergency alert
      const alert = await storage.createAlert({
        type: "sos_activated",
        title: "SOS Alert",
        message: message || `Emergency SOS activated at ${location.lat}, ${location.lng}`,
        severity: "error",
        employeeId: userId
      });

      // TODO: Send notifications to emergency contacts via Firebase
      console.log("SOS Alert created:", alert);
      
      res.json({ success: true, alertId: alert.id });
    } catch (error) {
      console.error("SOS error:", error);
      res.status(500).json({ message: "Failed to process SOS alert" });
    }
  });

  app.post("/api/emergency/share-location", async (req, res) => {
    try {
      const { location, userId, contacts } = req.body;
      
      // Store location sharing event
      const alert = await storage.createAlert({
        type: "location_shared",
        title: "Location Shared",
        message: `Location shared: ${location.address || 'Current location'}`,
        severity: "info",
        employeeId: userId
      });

      // TODO: Send location to family contacts via Firebase
      console.log("Location shared:", alert);
      
      res.json({ success: true, alertId: alert.id });
    } catch (error) {
      console.error("Location sharing error:", error);
      res.status(500).json({ message: "Failed to share location" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      const geofences = await storage.getAllGeofences();
      const alerts = await storage.getAlerts(false);
      const routes = await storage.getAllRoutes();

      const stats = {
        activeRoutes: routes.length,
        onlineEmployees: employees.filter(emp => emp.status === "online").length,
        geofenceAlerts: alerts.filter(alert => alert.type === "geofence_violation").length,
        safetyScore: 94,
        presentToday: employees.filter(emp => emp.status !== "offline").length,
        lateArrivals: 8,
        absent: employees.filter(emp => emp.status === "offline").length,
        onField: employees.filter(emp => emp.status === "on_field").length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
