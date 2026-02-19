import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EnvironmentProvider } from "@/hooks/use-environment";
import AuthGuard from "./components/auth/AuthGuard";
import Index from "./pages/Index";
import LoginForm from "./components/auth/LoginForm";
import NotFound from "./pages/NotFound";
import EnvironmentsVerification from "./pages/EnvironmentsVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <EnvironmentProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/dev/environments" element={<EnvironmentsVerification />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </EnvironmentProvider>
  </QueryClientProvider>
);

export default App;
