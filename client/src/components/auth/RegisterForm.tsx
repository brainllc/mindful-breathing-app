import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Calendar, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
  });
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const errorRef = useRef<HTMLDivElement>(null);

  // Scroll to error when it appears
  useEffect(() => {
    if (error) {
      // Check if error is related to checkboxes - scroll to top to avoid navbar blocking
      const isCheckboxError = error.includes("Terms of Service") || 
                            error.includes("Privacy Policy") ||
                            error.includes("must accept");
      
      if (isCheckboxError) {
        // Scroll to top of page for checkbox errors
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      } else if (errorRef.current) {
        // Scroll to error message for other errors
        errorRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
  }, [error]);

  const handleGoogleSignUp = async () => {
    if (!acceptTerms || !acceptPrivacy) {
      setError("You must accept the Terms of Service and Privacy Policy");
      return;
    }

    setIsGoogleLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            marketingConsent: acceptMarketing.toString(),
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      // The OAuth flow will redirect to the callback URL
      // The actual registration will be handled by the auth callback
    } catch (err) {
      setError("Google sign-up failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      setError("Display name is required");
      return false;
    }
    
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    
    if (!formData.dateOfBirth) {
      setError("Date of birth is required");
      return false;
    }
    
    const age = calculateAge(formData.dateOfBirth);
    if (age < 18) {
      setError("You must be 18 or older to use this service. Please consult with a parent or guardian.");
      return false;
    }
    
    // Set age verification flag but don't store the actual birthdate
    setIsAgeVerified(true);
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    if (!acceptTerms) {
      setError("You must accept the Terms of Service");
      return false;
    }
    
    if (!acceptPrivacy) {
      setError("You must accept the Privacy Policy");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          displayName: formData.displayName,
          isAgeVerified: isAgeVerified,
          password: formData.password,
          marketingConsent: acceptMarketing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting with a more user-friendly message
        if (response.status === 429 || data.rateLimited || data.error?.includes("rate limit") || data.error?.includes("too many") || data.error?.includes("email rate limit")) {
          setError("We're temporarily limiting new registrations to prevent spam. Please wait about 15 minutes and try again, or use 'Continue with Google' instead.");
        } else {
          setError(data.error || "Registration failed");
        }
        return;
      }

      // Use auth context to login the new user
      if (data.session && data.user) {
        login({
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.displayName,
          isPremium: data.user.isPremium,
        }, data.session);
      }
      
      toast({
        title: "Welcome to breathwork.fyi!",
        description: "Your account has been created successfully. You now have access to premium exercises!",
      });
      
      onSuccess?.();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <UserPlus className="w-6 h-6" />
            Create Account
          </CardTitle>
          <CardDescription>
            Join thousands of users on their mindful breathing journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive" ref={errorRef}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Consent checkboxes for Google OAuth */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms-google"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  required
                />
                <Label htmlFor="terms-google" className="text-sm leading-5">
                  I agree to the{" "}
                  <Link href="/terms-of-service" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy-google"
                  checked={acceptPrivacy}
                  onCheckedChange={(checked) => setAcceptPrivacy(checked === true)}
                  required
                />
                <Label htmlFor="privacy-google" className="text-sm leading-5">
                  I agree to the{" "}
                  <Link href="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing-google"
                  checked={acceptMarketing}
                  onCheckedChange={(checked) => setAcceptMarketing(checked === true)}
                />
                <Label htmlFor="marketing-google" className="text-sm leading-5">
                  I would like to receive helpful tips and updates about breathing techniques (optional)
                </Label>
              </div>
            </div>
            
            {/* Google Sign-Up Button */}
            <Button 
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || isLoading}
              variant="outline"
              className="w-full"
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Creating account with Google...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John D."
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This is how your name will appear to others. You can use your full name, first name, or initials.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10"
                  style={{
                    backgroundColor: 'transparent',
                    WebkitBoxShadow: '0 0 0 1000px transparent inset',
                    WebkitTextFillColor: 'inherit',
                    transition: 'background-color 5000s ease-in-out 0s'
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                  className="pl-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You must be 18 or older to use this service
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="pl-10 pr-10"
                  style={{
                    backgroundColor: 'transparent',
                    WebkitBoxShadow: '0 0 0 1000px transparent inset',
                    WebkitTextFillColor: 'inherit',
                    transition: 'background-color 5000s ease-in-out 0s'
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className="pl-10 pr-10"
                  style={{
                    backgroundColor: 'transparent',
                    WebkitBoxShadow: '0 0 0 1000px transparent inset',
                    WebkitTextFillColor: 'inherit',
                    transition: 'background-color 5000s ease-in-out 0s'
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
                disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 