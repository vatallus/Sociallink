import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import Admin from "@/pages/admin";
import Biolinks from "@/pages/biolinks";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";
import PublicBiolink from "@/pages/bio/[slug]";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/booking" component={Booking} />
      <Route path="/auth" component={Auth} />
      <ProtectedRoute path="/admin" component={Admin} />
      <ProtectedRoute path="/biolinks" component={Biolinks} />
      <Route path="/bio/:slug" component={PublicBiolink} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;