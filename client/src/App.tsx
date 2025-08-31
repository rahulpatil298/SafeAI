import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import RoutePlanning from "@/pages/route-planning";
import Workforce from "@/pages/workforce";
import Geofencing from "@/pages/geofencing";
import Chat from "@/pages/chat";
import NotFound from "@/pages/not-found";
import { firebaseService } from "@/lib/firebase";

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  // Initialize Firebase on app startup
  useEffect(() => {
    firebaseService.initialize();
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const isHomePage = location === "/";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {!isHomePage && (
            <>
              <Navbar 
                onMobileMenuToggle={handleMobileMenuToggle}
                isMobileMenuOpen={isMobileMenuOpen}
              />
              <MobileMenu 
                isOpen={isMobileMenuOpen}
                onClose={handleMobileMenuClose}
              />
            </>
          )}
          
          <main className={isHomePage ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/routes" component={RoutePlanning} />
              <Route path="/workforce" component={Workforce} />
              <Route path="/geofencing" component={Geofencing} />
              <Route path="/chat" component={Chat} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
