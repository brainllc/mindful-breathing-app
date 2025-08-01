import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import React from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";

// Lazy load route components
const Home = lazy(() => import("@/pages/Home"));
const Exercise = lazy(() => import("@/pages/Exercise"));
const StressGuide = lazy(() => import("@/pages/StressGuide"));
const DownloadStressGuide = lazy(() => import("@/pages/DownloadStressGuide"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Profile = lazy(() => import("@/pages/Profile"));
const Library = lazy(() => import("@/pages/Library"));
const Article = lazy(() => import("@/pages/Article"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
    </div>
  );
}



function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/exercise/:id" component={Exercise} />
        <Route path="/stress-guide" component={StressGuide} />
        <Route path="/download-stress-guide" component={DownloadStressGuide} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/auth/reset-password" component={ResetPassword} />
        <Route path="/profile" component={Profile} />
        <Route path="/library" component={Library} />
        <Route path="/library/:slug" component={Article} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  console.log("🚀 App.tsx: App component initializing...");
  console.log("🔍 App.tsx: Current pathname:", window.location.pathname);
  console.log("🔍 App.tsx: Current hash:", window.location.hash);
  
  // Clean up any lingering auth fragments that might interfere with navigation
  React.useEffect(() => {
    console.log("🚀 App.tsx: useEffect running...");
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    
    // If we're not on auth callback but have auth tokens in URL, clean them
    if (currentPath !== '/auth/callback' && currentHash.includes('access_token')) {
      console.log("🧹 App.tsx: Cleaning auth tokens from URL");
      window.history.replaceState({}, document.title, currentPath);
    }
    console.log("✅ App.tsx: useEffect completed");
  }, []);

  console.log("🚀 App.tsx: About to render providers...");
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;