import { 
  type User, 
  type InsertUser,
  type Employee,
  type InsertEmployee,
  type Geofence,
  type InsertGeofence,
  type AttendanceRecord,
  type InsertAttendanceRecord,
  type Route,
  type InsertRoute,
  type Alert,
  type InsertAlert
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Employees
  getAllEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Geofences
  getAllGeofences(): Promise<Geofence[]>;
  getGeofence(id: string): Promise<Geofence | undefined>;
  createGeofence(geofence: InsertGeofence): Promise<Geofence>;
  updateGeofence(id: string, updates: Partial<Geofence>): Promise<Geofence | undefined>;
  deleteGeofence(id: string): Promise<boolean>;

  // Attendance Records
  getAttendanceRecords(employeeId?: string, date?: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;

  // Routes
  getAllRoutes(userId?: string): Promise<Route[]>;
  getRoute(id: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  deleteRoute(id: string): Promise<boolean>;

  // Alerts
  getAlerts(isRead?: boolean): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private employees: Map<string, Employee>;
  private geofences: Map<string, Geofence>;
  private attendanceRecords: Map<string, AttendanceRecord>;
  private routes: Map<string, Route>;
  private alerts: Map<string, Alert>;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.geofences = new Map();
    this.attendanceRecords = new Map();
    this.routes = new Map();
    this.alerts = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample employees
    const employees: Employee[] = [
      {
        id: "emp1",
        employeeId: "EMP001",
        name: "Rajesh Kumar",
        email: "rajesh.kumar@company.com",
        department: "Engineering",
        position: "Software Engineer",
        phone: "+91 9876543210",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256",
        status: "online",
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      {
        id: "emp2",
        employeeId: "EMP002",
        name: "Priya Sharma",
        email: "priya.sharma@company.com",
        department: "Management",
        position: "Project Manager",
        phone: "+91 9876543211",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256",
        status: "online",
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      {
        id: "emp3",
        employeeId: "EMP003",
        name: "Arjun Patel",
        email: "arjun.patel@company.com",
        department: "Engineering",
        position: "Field Engineer",
        phone: "+91 9876543212",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256",
        status: "on_field",
        lastSeen: new Date(),
        createdAt: new Date(),
      },
    ];

    employees.forEach(emp => this.employees.set(emp.id, emp));

    // Sample geofences
    const geofences: Geofence[] = [
      {
        id: "geo1",
        name: "Mumbai Office Main",
        type: "office_zone",
        centerLat: "19.0760",
        centerLng: "72.8777",
        radius: 150,
        startTime: "09:00",
        endTime: "18:00",
        entryNotifications: true,
        exitNotifications: true,
        violationAlerts: false,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "geo2",
        name: "Project Site Alpha",
        type: "project_site",
        centerLat: "12.9716",
        centerLng: "77.5946",
        radius: 300,
        startTime: "08:00",
        endTime: "17:00",
        entryNotifications: true,
        exitNotifications: true,
        violationAlerts: true,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    geofences.forEach(geo => this.geofences.set(geo.id, geo));

    // Sample alerts
    const alerts: Alert[] = [
      {
        id: "alert1",
        type: "geofence_violation",
        title: "Unauthorized Exit",
        message: "EMP003 left Project Site Alpha at 2:30 PM",
        severity: "warning",
        employeeId: "emp3",
        geofenceId: "geo2",
        isRead: false,
        timestamp: new Date(),
      },
      {
        id: "alert2",
        type: "system_update",
        title: "Zone Entry",
        message: "EMP001 entered Mumbai Office at 9:15 AM",
        severity: "success",
        employeeId: "emp1",
        geofenceId: "geo1",
        isRead: false,
        timestamp: new Date(),
      },
    ];

    alerts.forEach(alert => this.alerts.set(alert.id, alert));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Employees
  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(
      (emp) => emp.employeeId === employeeId,
    );
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = { 
      ...insertEmployee, 
      id, 
      createdAt: new Date(),
      lastSeen: null 
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee = { ...employee, ...updates };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Geofences
  async getAllGeofences(): Promise<Geofence[]> {
    return Array.from(this.geofences.values());
  }

  async getGeofence(id: string): Promise<Geofence | undefined> {
    return this.geofences.get(id);
  }

  async createGeofence(insertGeofence: InsertGeofence): Promise<Geofence> {
    const id = randomUUID();
    const geofence: Geofence = { 
      ...insertGeofence, 
      id, 
      createdAt: new Date() 
    };
    this.geofences.set(id, geofence);
    return geofence;
  }

  async updateGeofence(id: string, updates: Partial<Geofence>): Promise<Geofence | undefined> {
    const geofence = this.geofences.get(id);
    if (!geofence) return undefined;
    
    const updatedGeofence = { ...geofence, ...updates };
    this.geofences.set(id, updatedGeofence);
    return updatedGeofence;
  }

  async deleteGeofence(id: string): Promise<boolean> {
    return this.geofences.delete(id);
  }

  // Attendance Records
  async getAttendanceRecords(employeeId?: string, date?: string): Promise<AttendanceRecord[]> {
    let records = Array.from(this.attendanceRecords.values());
    
    if (employeeId) {
      records = records.filter(record => record.employeeId === employeeId);
    }
    
    if (date) {
      const targetDate = new Date(date);
      records = records.filter(record => 
        record.timestamp && 
        record.timestamp.toDateString() === targetDate.toDateString()
      );
    }
    
    return records.sort((a, b) => 
      (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
    );
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const id = randomUUID();
    const record: AttendanceRecord = { 
      ...insertRecord, 
      id, 
      timestamp: new Date() 
    };
    this.attendanceRecords.set(id, record);
    return record;
  }

  // Routes
  async getAllRoutes(userId?: string): Promise<Route[]> {
    let routes = Array.from(this.routes.values());
    
    if (userId) {
      routes = routes.filter(route => route.createdBy === userId);
    }
    
    return routes.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const route: Route = { 
      ...insertRoute, 
      id, 
      createdAt: new Date() 
    };
    this.routes.set(id, route);
    return route;
  }

  async deleteRoute(id: string): Promise<boolean> {
    return this.routes.delete(id);
  }

  // Alerts
  async getAlerts(isRead?: boolean): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values());
    
    if (isRead !== undefined) {
      alerts = alerts.filter(alert => alert.isRead === isRead);
    }
    
    return alerts.sort((a, b) => 
      (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
    );
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      timestamp: new Date() 
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: string): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;
    
    alert.isRead = true;
    this.alerts.set(id, alert);
    return true;
  }
}

export const storage = new MemStorage();
