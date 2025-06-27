import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Staff from "@/pages/staff";
import AddStaff from "@/pages/add-staff";
import ClassMapping from "@/pages/class-mapping";
import AddClassMapping from "@/pages/add-class-mapping";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/staff" component={Staff} />
        <Route path="/staff/add" component={AddStaff} />
        <Route path="/class-mapping" component={ClassMapping} />
        <Route path="/add-class-mapping" component={AddClassMapping} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
