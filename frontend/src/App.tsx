import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/Layout/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import Overview from "./pages/Overview";
import Metrics from "./pages/Metrics";
import SpendAnalysis from "./pages/SpendAnalysis";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import AnomalyDetection from "./pages/AnomalyDetection";
import LicenseOptimization from "./pages/LicenseOptimization";
import AdminPanel from "./pages/AdminPanel";
import Chatbot from "./pages/Chatbot";
import ApiTest from "./pages/ApiTest";
import WebSocketTest from "./pages/WebSocketTest";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><Overview /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/anomalies"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><AnomalyDetection /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/licenses"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><LicenseOptimization /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/metrics"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><Metrics /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/spend-analysis"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><SpendAnalysis /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><Team /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><AdminPanel /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><Settings /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chatbot"
                element={
                  <ProtectedRoute>
                    <DashboardLayout><Chatbot /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/api-test"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <DashboardLayout><ApiTest /></DashboardLayout>
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/websocket-test"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <DashboardLayout><WebSocketTest /></DashboardLayout>
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
