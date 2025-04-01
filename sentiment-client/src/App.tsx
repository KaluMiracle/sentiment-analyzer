import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/dashboard";
import Timeline from "./pages/timeline";
import RawData from "./pages/raw-data-new";
import RealTime from "./pages/real-time";
import { DisasterContextProvider } from "./context/disaster-context";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import Login from "./pages/auth/login";
import Posts from "./pages/posts";
import Comments from "./pages/comments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/raw-data" component={RawData} />
      <Route path="/posts" component={Posts} />
      <Route path="/comments" component={Comments} />
      <Route path="/real-time" component={RealTime} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DisasterContextProvider>
          {/* <MainLayout> */}
          <Router />
          {/* </MainLayout> */}
          <Toaster />
        </DisasterContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
