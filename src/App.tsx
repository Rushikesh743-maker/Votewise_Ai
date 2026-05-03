import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import { useAnalytics } from "@/hooks/use-analytics";

const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Flow = lazy(() => import("./pages/Flow.tsx"));
const Learn = lazy(() => import("./pages/Learn.tsx"));
const Simulate = lazy(() => import("./pages/Simulate.tsx"));
const Quiz = lazy(() => import("./pages/Quiz.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>
);

const RoutedApp = () => {
  useAnalytics();
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flow" element={<Flow />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/quiz" element={<Quiz />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoutedApp />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
