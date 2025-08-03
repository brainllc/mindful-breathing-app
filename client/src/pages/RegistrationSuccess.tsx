import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Mail, 
  Crown, 
  Target, 
  Heart, 
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react";

export default function RegistrationSuccess() {
  const [, navigate] = useLocation();

  const benefits = [
    {
      icon: Crown,
      title: "Premium Exercises",
      description: "Access to all breathing techniques and guided sessions"
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Monitor your breathing journey and see your improvement"
    },
    {
      icon: Heart,
      title: "Personalized Experience",
      description: "Customized recommendations based on your needs"
    },
    {
      icon: Sparkles,
      title: "Expert Content",
      description: "Evidence-based techniques from breathing experts"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50/30 to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />
      
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />
      
      <main className="relative pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Success Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Welcome to breathwork.fyi! 🎉
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-6"
              >
                Your account has been created successfully
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  Premium Account Activated
                </Badge>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Email Confirmation Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
              >
                <Card className="border-2 border-blue-200 dark:border-blue-800/50">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex-shrink-0">
                        <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Check Your Email
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          We've sent a confirmation link to your email address. 
                          Click the link to activate your account and start your mindful breathing journey.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Don't see the email? Check your spam folder or wait a few minutes
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* What's Next Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
              >
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      What's Next?
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Confirm your email
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Click the link in your email to activate your account
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Sign in and explore
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Access all premium breathing exercises immediately
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Start breathing
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Begin with our beginner-friendly exercises
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Benefits Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                Your Premium Benefits
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.7 + index * 0.1 }}
                  >
                    <Card className="text-center h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-4">
                          <benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {benefit.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1 }}
              className="text-center space-y-4"
            >
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                Sign In Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already confirmed your email? Sign in to start breathing
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}