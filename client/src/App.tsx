import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import MindMapView from "./pages/MindMapView";
import CalendarView from "./pages/CalendarView";
import Goals from "./pages/Goals";
import Pomodoro from "./pages/Pomodoro";
import NotFound from "@/pages/not-found";
import { UserProvider } from "./contexts/UserContext";
import AuthPage from "./pages/auth-page";
import { useAuth, AuthProvider } from "./hooks/use-auth";

// Componente que protege rotas, verificando se o usuário está autenticado
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  try {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
      return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    }
    
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
  } catch (error) {
    console.error("Erro no ProtectedRoute:", error);
    return <Navigate to="/auth" replace />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <Layout>
              <Tasks />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mindmap" 
        element={
          <ProtectedRoute>
            <Layout>
              <MindMapView />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <Layout>
              <CalendarView />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/goals" 
        element={
          <ProtectedRoute>
            <Layout>
              <Goals />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pomodoro" 
        element={
          <ProtectedRoute>
            <Layout>
              <Pomodoro />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster />
            </BrowserRouter>
          </AuthProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
