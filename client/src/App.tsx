import { Route, Switch } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/mindmap" component={MindMapView} />
      <Route path="/calendar" component={CalendarView} />
      <Route path="/goals" component={Goals} />
      <Route path="/pomodoro" component={Pomodoro} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
