# SafeWay AI & Workforce Tracker

## Overview

SafeWay AI & Workforce Tracker is a comprehensive web platform that combines AI-powered route planning with workforce management through geofencing technology. The application provides intelligent travel route optimization based on safety factors while enabling real-time employee attendance tracking through geofence zones. Built as a modern full-stack application, it features interactive mapping capabilities, animated UI components, and real-time data synchronization.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 30, 2025)

- ✅ Implemented real MapMyIndia API integration with place search and route calculation
- ✅ Added AI-powered safety scoring using OpenAI GPT-5 for route analysis
- ✅ Built comprehensive voice assistance with SOS keywords detection
- ✅ Integrated Firebase for real-time data synchronization and emergency alerts
- ✅ Connected AI chatbot with backend for route suggestions and safety advice
- ✅ Added emergency contact sharing and location broadcasting features
- ✅ Updated Home page as main landing page with safety-focused UI
- ✅ Real-time speech recognition for voice-activated SOS features
- ✅ Complete integration of MapMyIndia routing API with crime/accident analysis

## System Architecture

### Full-Stack Architecture
The application follows a monorepo structure with clear separation between client and server code. The frontend is built with React and TypeScript, while the backend uses Express.js with Node.js. The architecture supports both development and production environments with Vite handling the build process and development server.

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design system variables for consistent theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL as the primary database
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Shared schema definitions between client and server using Zod
- **API Design**: RESTful API structure with typed routes and error handling

### Database Design
The database schema includes core entities for workforce management and route planning:
- **Users**: Authentication and role-based access
- **Employees**: Workforce profiles with status tracking
- **Geofences**: Location-based zones with time restrictions and notification settings
- **Attendance Records**: Time-stamped entry/exit logs linked to geofences
- **Routes**: User-generated travel routes with preferences
- **Alerts**: System notifications and violations

### Component Architecture
- **Layout Components**: Responsive navigation with mobile-first design
- **Feature Modules**: Modular components for dashboard, workforce, geofencing, and route planning
- **UI Components**: Reusable design system components with consistent styling
- **Map Integration**: Containerized mapping components for interactive visualizations

### Development Workflow
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: Comprehensive TypeScript configuration across the entire codebase
- **Code Quality**: ESM modules with modern JavaScript features
- **Development Tools**: Hot module replacement and real-time error overlay in development

## External Dependencies

### Mapping Services
- **MapMyIndia API**: Primary mapping service for route calculation, place search, and geofencing capabilities
- **Interactive Maps**: Real-time map rendering with support for markers, zones, and route visualization

### Database Infrastructure
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

### Real-time Services
- **Firebase**: Real-time database and authentication services for live updates
- **WebSocket Support**: Real-time attendance tracking and geofence alerts

### UI and Design
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide Icons**: Comprehensive icon library for consistent visual elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

### Development and Build Tools
- **Vite**: Modern build tool with TypeScript support and plugin ecosystem
- **PostCSS**: CSS processing with Tailwind integration
- **TanStack Query**: Server state synchronization and caching layer

### Authentication and Security
- **Session Management**: Server-side session handling with secure cookie storage
- **Environment Configuration**: Secure environment variable management for API keys and database credentials