import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  displayName: string;
  isPremium: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, session: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("useAuth called outside of AuthProvider!");
    console.trace("Stack trace:");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const storedSession = localStorage.getItem("supabase.auth.token");
      if (!storedSession) {
        setIsLoading(false);
        return;
      }

      const session = JSON.parse(storedSession);
      if (!session.access_token) {
        setIsLoading(false);
        return;
      }

      // Verify the session with our backend
      const response = await fetch("/api/user/profile", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Clear invalid session
        localStorage.removeItem("supabase.auth.token");
      }
    } catch (error) {
      console.error("Session check failed:", error);
      localStorage.removeItem("supabase.auth.token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User, session: any) => {
    // Store session in localStorage
    localStorage.setItem("supabase.auth.token", JSON.stringify(session));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("supabase.auth.token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
} 