import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Navbar } from "@/components/Navbar";

export default function Register() {
  const [, navigate] = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = () => {
    // Navigate to dashboard or home after successful login
    navigate("/");
  };

  const handleRegisterSuccess = () => {
    // Navigate to dashboard or home after successful registration
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />
      
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />
      
      <main className="relative pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            {showLogin ? (
              <LoginForm
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setShowLogin(false)}
              />
            ) : (
              <RegisterForm
                onSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setShowLogin(true)}
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
} 