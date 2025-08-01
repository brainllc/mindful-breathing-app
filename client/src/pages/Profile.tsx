import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Mail, 
  Crown, 
  Save, 
  Lock, 
  Trash2, 
  Shield,
  Calendar,
  Activity,
  Target,
  Eye,
  EyeOff
} from "lucide-react";
import { Link } from "wouter";

interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  favoriteExercise: string;
  joinedDate: string;
  lastSessionDate: string;
}

export default function Profile() {
  const { user, logout, login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fetch user stats and check OAuth status
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const storedSession = localStorage.getItem("supabase.auth.token");
        if (storedSession) {
          const session = JSON.parse(storedSession);
          
          // Check if user is OAuth (Google) user
          const isOAuth = session.provider_token && session.user?.app_metadata?.provider !== 'email';
          setIsOAuthUser(isOAuth);
          
          const response = await fetch("/api/user/stats", {
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const stats = await response.json();
            setUserStats(stats);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };

    if (isAuthenticated) {
      fetchUserStats();
    }
  }, [isAuthenticated]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName,
        email: user.email
      });
    }
  }, [user]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
              <Link href="/login">
                <Button>Log In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const storedSession = localStorage.getItem("supabase.auth.token");
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const response = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Update auth context with new user data
          login({
            id: data.user.id,
            email: data.user.email,
            displayName: data.user.displayName,
            isPremium: data.user.isPremium,
          }, session);
          
          toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
          });
          setIsEditing(false);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update profile");
        }
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || "",
      email: user?.email || ""
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Use user's local timezone
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const storedSession = localStorage.getItem("supabase.auth.token");
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const response = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        });

        if (response.ok) {
          toast({
            title: "Password Changed",
            description: "Your password has been successfully updated.",
          });
          setIsChangingPassword(false);
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
        } else {
          const error = await response.json();
          let errorMessage = "Failed to change password. Please try again.";
          
          if (error.error) {
            if (error.error.includes("Current password is incorrect")) {
              errorMessage = "Your current password is incorrect. Please check and try again.";
            } else if (error.error.includes("New password must be at least")) {
              errorMessage = "New password must be at least 8 characters long.";
            } else {
              errorMessage = error.error;
            }
          }
          
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: error instanceof Error ? error.message : "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <User className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              User Settings
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Profile Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Update your account details and personal information
                      </CardDescription>
                    </div>
                    {user?.isPremium && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`pl-10 ${!isEditing ? "bg-muted" : ""}`}
                        placeholder="How you'd like to be addressed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`pl-10 ${!isEditing ? "bg-muted" : ""}`}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSave} 
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                          onClick={handleCancel} 
                          variant="outline"
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isOAuthUser ? (
                    <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">Google Account</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Your account is secured by Google. Password changes are managed through your Google account settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : !isChangingPassword ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-muted-foreground">Last updated 30 days ago</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                        Change Password
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">Change Password</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter your current password"
                            className="pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter your new password"
                            className="pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm your new password"
                            className="pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={handleChangePassword} 
                          disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isLoading ? "Changing..." : "Change Password"}
                        </Button>
                        <Button 
                          onClick={cancelPasswordChange} 
                          variant="outline"
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isOAuthUser && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your account is secured with industry-standard encryption. 
                        We never store your passwords in plain text.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              {/* User Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userStats ? (
                    <>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{userStats.totalSessions}</div>
                        <div className="text-sm text-muted-foreground">Total Sessions</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{userStats.totalMinutes}</div>
                        <div className="text-sm text-muted-foreground">Minutes Practiced</div>
                      </div>

                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{userStats.currentStreak}</div>
                        <div className="text-sm text-muted-foreground">Day Streak</div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Favorite:</span>
                          <span className="font-medium">{userStats.favoriteExercise || "None yet"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Joined:</span>
                          <span className="font-medium">{formatDate(userStats.joinedDate)}</span>
                        </div>

                        {userStats.lastSessionDate ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Last session:</span>
                            <span className="font-medium">{formatDate(userStats.lastSessionDate)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Last session:</span>
                            <span className="font-medium">No sessions yet</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Loading your progress...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Button>
                  </Link>
                  
                  <Link href="/privacy-policy">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy Policy
                    </Button>
                  </Link>

                  <Separator />

                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={logout}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
} 