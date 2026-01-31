import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/features/auth/hooks/use-auth";
import { Suspense, lazy } from "react";
import Index from "./routes/Index";
import Jobs from "./routes/Jobs";
import JobDetail from "./routes/JobDetail";
import NotFound from "./routes/NotFound";

// Lazy load admin components to reduce initial bundle size
const AdminLogin = lazy(() => import("./routes/AdminLogin"));
const AdminDashboard = lazy(() => import("./routes/AdminDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/admin/login" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <AdminLogin />
              </Suspense>
            } />
            <Route path="/admin/dashboard" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <AdminDashboard />
              </Suspense>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
