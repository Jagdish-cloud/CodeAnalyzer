import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/layout";
import NotFound from "@/pages/not-found";
import AddInstitution from "@/pages/add-institution";
import Dashboard from "@/pages/dashboard";
import Mapping from "@/pages/mapping";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={AddInstitution} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/mapping" component={Mapping} />
        <Route path="/add-institution" component={AddInstitution} />
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
