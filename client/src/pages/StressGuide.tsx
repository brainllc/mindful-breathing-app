import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Clock, 
  Brain, 
  Heart, 
  Zap, 
  CheckCircle, 
  Download, 
  Mail, 
  ArrowRight,
  Target,
  Shield,
  Sparkles
} from "lucide-react";

export default function StressGuide() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const scrollToForm = () => {
    const formElement = document.getElementById('stress-guide-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const response = await fetch('https://assets.mailerlite.com/jsonp/1689950/forms/160846263230662467/subscribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsSuccess(true);
        // Reset form
        e.currentTarget.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // You could add error handling here
    } finally {
      setIsSubmitting(false);
    }
  };

  // MailerLite setup
  useEffect(() => {
    // Load reCAPTCHA script
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = 'https://www.google.com/recaptcha/api.js';
    recaptchaScript.async = true;
    document.head.appendChild(recaptchaScript);

    // Load MailerLite webforms script
    const mlScript = document.createElement('script');
    mlScript.src = 'https://groot.mailerlite.com/js/w/webforms.min.js?v176e10baa5e7ed80d35ae235be3d5024';
    mlScript.async = true;
    document.body.appendChild(mlScript);

    // Load MailerLite tracking script
    const trackingScript = document.createElement('script');
    trackingScript.innerHTML = `
      fetch("https://assets.mailerlite.com/jsonp/1689950/forms/160846263230662467/takel")
    `;
    document.body.appendChild(trackingScript);

    // MailerLite success handler (we handle success state in React)
    (window as any).ml_webform_success_28806241 = function() {
      // Success is handled by our React state
      console.log('MailerLite form submitted successfully');
    };

    return () => {
      // Cleanup
      delete (window as any).ml_webform_success_28806241;
      // Remove scripts if they exist
      const existingMLScript = document.querySelector('script[src*="webforms.min.js"]');
      if (existingMLScript) {
        existingMLScript.remove();
      }
      const existingRecaptchaScript = document.querySelector('script[src*="recaptcha"]');
      if (existingRecaptchaScript) {
        existingRecaptchaScript.remove();
      }
      const existingTrackingScript = document.querySelector('script[innerHTML*="takel"]');
      if (existingTrackingScript) {
        existingTrackingScript.remove();
      }
    };
  }, []);

  const benefits = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "5-Minute Reset",
      description: "Quick techniques that work anywhere, anytime"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Science-Backed",
      description: "Evidence-based methods proven to work"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Calm Your Nervous System",
      description: "Shift from stress to calm in 60 seconds"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Instant Results",
      description: "No experience or equipment required"
    }
  ];

  const features = [
    "Reduce anxiety and stress instantly",
    "Sharpen your focus and concentration",
    "Prepare your body for restful sleep",
    "Take back control of your well-being",
    "Simple techniques you can do anywhere",
    "No special equipment needed"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-purple-50 dark:from-background dark:via-background dark:to-background">
      <style>{`
        .g-recaptcha {
          transform: scale(1);
          -webkit-transform: scale(1);
          transform-origin: 0 0;
          -webkit-transform-origin: 0 0;
        }
        
        @media screen and (max-width: 480px) {
          .g-recaptcha {
            transform: scale(0.78);
            -webkit-transform: scale(0.78);
            transform-origin: 0 0;
            -webkit-transform-origin: 0 0;
          }
        }
      `}</style>
      <Navbar />
      
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />
      
      <main className="relative pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <div className="mb-8">
              <Badge variant="outline" className="mb-4 text-primary border-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                100% Free • No Spam • Instant Download
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-primary/90">
                Stop Stress in Just 5 Minutes
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed">
                The Science-Backed Guide to Go From<br/>
                <span className="text-red-500 font-semibold">Overwhelmed & Anxious</span> to <span className="text-green-500 font-semibold">Calm & Focused</span>
              </p>
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8">
                Whether you're dealing with work stress, family pressures, or life's daily challenges—these techniques work anywhere, anytime.
              </p>
              
                             {/* Social Proof in Hero */}
               <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span className="font-medium">15,000+ People Helped</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                   <span className="font-medium">4.9/5 Star Rating</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                   <span className="font-medium">Science-Based</span>
                 </div>
               </div>
               
               {/* Trust indicators */}
               <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/60">
                 <span>✓ Created by Certified Breathwork Experts</span>
                 <span>✓ Used by Students, Parents & Professionals</span>
                 <span>✓ Featured in Wellness Publications</span>
               </div>
            </div>
          </motion.div>

          {/* Problem Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto mb-16"
          >
            <Card className="border-2 border-amber-200 dark:border-amber-900/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10">
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-foreground/90 mb-6">
                  <strong>You know this feeling all too well:</strong> Whether it's work deadlines, family responsibilities, financial worries, or just the constant pace of modern life—that familiar knot in your stomach keeps getting tighter. Your mind races even when you're trying to relax, and you can't remember the last time you felt truly calm.
                </p>
                <p className="text-lg leading-relaxed text-foreground/90 mb-6">
                  You've tried meditation apps, but who has 20 minutes? You've tried "just breathe deeply," but it never seems to work when you actually need it. Meanwhile, the stress is taking its toll on your sleep, relationships, health, and happiness.
                </p>
                <div className="flex items-center gap-3 text-primary font-semibold text-lg">
                  <Target className="w-5 h-5" />
                  <span>What if you could go from stressed to calm in just 5 minutes using science?</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl font-bold mb-6 text-primary/90">
              The answer is strategic breathing.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              <strong>The 5-Minute Reset</strong> contains the exact breathing protocols used by everyone from Navy SEALs and elite athletes to busy parents, students, and healthcare workers to stay calm under pressure. These aren't feel-good techniques—they're performance tools that measurably change your nervous system in minutes.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-primary/10 hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* What You'll Learn */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-3xl mx-auto mb-16"
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <Shield className="w-6 h-6" />
                  What You'll Discover
                </CardTitle>
                <CardDescription className="text-center text-base">
                  In the next 10 minutes, you will learn a set of tools that can shift you from a state of stress to a state of calm in as little as 60 seconds.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* First CTA - Ready to Stop Stress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="max-w-md mx-auto mb-16"
          >
            <Card className="border-2 border-green-300 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2 text-green-800 dark:text-green-200">
                  Ready to Stop Stress in Its Tracks?
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Get instant access to the same techniques helping thousands find calm in chaos
                </p>
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={scrollToForm}>
                  <Download className="w-4 h-4 mr-2" />
                  Get My Free Guide Now
                </Button>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ⚡ Instant download • 100% free
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Guide Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="max-w-6xl mx-auto mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-primary/90">
                Here's What's Inside Your Guide
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get a sneak peek at the valuable content you'll receive. This isn't just theory - it's practical, actionable guidance you can use immediately.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Preview 1 - Understanding Stress - Updated for production images */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="group"
              >
                <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 aspect-[4/5]">
                    <img 
                      src="/images/stress-guide/preview-understanding-stress.jpg" 
                      alt="Understanding Your Stress Response - Guide Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                                             <Badge className="bg-blue-500 text-white mb-2">
                         Part 1
                       </Badge>
                      <h3 className="text-white font-bold text-lg leading-tight">
                        Understanding Your Stress Response
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>The science behind stress and anxiety</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>How your nervous system works</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Why breathing is your secret weapon</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Preview 2 - Emergency Techniques */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="group"
              >
                <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                  <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 aspect-[4/5]">
                                                             <img 
                      src="/images/stress-guide/preview-5-minute-techniques.jpg" 
                      alt="5-Minute Stress Techniques - Guide Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                                             <Badge className="bg-green-500 text-white mb-2">
                         Part 2
                       </Badge>
                                             <h3 className="text-white font-bold text-lg leading-tight">
                         5-Minute Stress Techniques
                       </h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>The 4-7-8 breath for instant calm</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Box breathing for anxiety attacks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Quick reset techniques for work</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Preview 3 - Personal Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="group"
              >
                <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 aspect-[4/5]">
                                                             <img 
                      src="/images/stress-guide/preview-getting-started.jpg" 
                      alt="How to Get Started the Right Way - Guide Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                     <div className="absolute bottom-4 left-4 right-4">
                       <Badge className="bg-purple-500 text-white mb-2">
                         Part 3
                       </Badge>
                       <h3 className="text-white font-bold text-lg leading-tight">
                         How to Get Started the Right Way
                       </h3>
                     </div>
                   </div>
                   <CardContent className="p-6">
                     <ul className="space-y-2 text-sm text-muted-foreground">
                       <li className="flex items-start gap-2">
                         <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                         <span>Step-by-step beginner's roadmap</span>
                       </li>
                       <li className="flex items-start gap-2">
                         <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                         <span>Common mistakes to avoid</span>
                       </li>
                       <li className="flex items-start gap-2">
                         <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                         <span>Building your first 5-minute routine</span>
                       </li>
                     </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

                         {/* Testimonial Quote */}
             <div className="text-center mt-12">
                                <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                                        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                       <CardContent className="p-6">
                         <p className="text-base italic text-green-700 dark:text-green-300 mb-3">
                           "I use the 4-7-8 technique before presentations and stressful family moments. It works every time."
                         </p>
                         <p className="text-sm font-medium text-green-600 dark:text-green-400">
                           — Sarah M., Working Mom
                         </p>
                       </CardContent>
                     </Card>
                     <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
                       <CardContent className="p-6">
                         <p className="text-base italic text-blue-700 dark:text-blue-300 mb-3">
                           "Finally, something that actually helps with my anxiety attacks. I keep this guide with me everywhere."
                         </p>
                         <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                           — Mike T., College Student
                         </p>
                       </CardContent>
                     </Card>
                 </div>
             </div>
           </motion.div>



                     {/* FAQ Section */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 1.2 }}
             className="max-w-3xl mx-auto mb-16"
           >
             <h2 className="text-3xl font-bold text-center mb-8 text-primary/90">
               Frequently Asked Questions
             </h2>
             <div className="space-y-6">
               <div className="border-l-4 border-primary pl-6">
                 <h4 className="text-lg font-semibold text-primary mb-3">
                   <span className="text-primary">Q:</span> How is this different from other breathing techniques?
                 </h4>
                 <p className="text-muted-foreground leading-relaxed">
                   <span className="text-primary font-semibold">A:</span> This guide focuses on evidence-based protocols with specific timing and measurable effects on your nervous system. No fluff, just what works.
                 </p>
               </div>
               
               <div className="border-l-4 border-primary pl-6">
                 <h4 className="text-lg font-semibold text-primary mb-3">
                   <span className="text-primary">Q:</span> Do I need any experience with meditation or breathing exercises?
                 </h4>
                 <p className="text-muted-foreground leading-relaxed">
                   <span className="text-primary font-semibold">A:</span> None at all. These techniques are designed for complete beginners and can be learned in minutes.
                 </p>
               </div>
               
               <div className="border-l-4 border-primary pl-6">
                 <h4 className="text-lg font-semibold text-primary mb-3">
                   <span className="text-primary">Q:</span> How quickly will I see results?
                 </h4>
                 <p className="text-muted-foreground leading-relaxed">
                   <span className="text-primary font-semibold">A:</span> Most people feel calmer within the first 2-3 minutes of trying the techniques. The physiological effects are immediate.
                 </p>
               </div>
               
               <div className="border-l-4 border-primary pl-6">
                 <h4 className="text-lg font-semibold text-primary mb-3">
                   <span className="text-primary">Q:</span> Is this really free?
                 </h4>
                 <p className="text-muted-foreground leading-relaxed">
                   <span className="text-primary font-semibold">A:</span> Yes, completely free. No hidden costs, 100% free. Just enter your email and get instant access.
                 </p>
               </div>
             </div>
           </motion.div>

          {/* CTA Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="max-w-md mx-auto"
          >
            <Card id="stress-guide-form" className="border-2 border-primary/30 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Download className="w-6 h-6" />
                  Get Instant Access
                </CardTitle>
                                 <CardDescription>
                   Join 15,000+ people who've transformed their relationship with stress
                 </CardDescription>
                <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span>✓ Instant Download</span>
                  <span>✓ Immediately Actionable</span>
                  <span>✓ Weekly Tips Included</span>
                </div>
              </CardHeader>
                            <CardContent>
                {/* MailerLite Form - Full Version */}
                <div className="mailerlite-form-wrapper">
                  {!isSuccess ? (
                    <form 
                      className="ml-block-form" 
                      action="https://assets.mailerlite.com/jsonp/1689950/forms/160846263230662467/subscribe" 
                      method="post"
                      onSubmit={handleFormSubmit}
                    >
                    <div className="space-y-4">
                      {/* Email Field */}
                      <div className="ml-form-fieldRow space-y-2">
                        <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                          <Label htmlFor="ml-email">Email Address *</Label>
                          <Input
                            id="ml-email"
                            type="email"
                            name="fields[email]"
                            placeholder="your@email.com"
                            required
                            className="h-12 form-control"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      {/* Required Opt-in Checkbox */}
                      <div className="ml-form-checkboxRow ml-validate-required">
                        <label className="checkbox flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            name="gdpr[]" 
                            value="Email"
                            required
                            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div className="label-description text-sm text-muted-foreground">
                            I agree to receive the free guide and a monthly breathwork newsletter. You can unsubscribe anytime. See our <Link href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link>. *
                          </div>
                        </label>
                      </div>

                      {/* reCAPTCHA */}
                      <div className="ml-form-recaptcha ml-validate-required flex justify-center">
                        <div 
                          className="g-recaptcha" 
                          data-sitekey="6Lf1KHQUAAAAAFNKEX1hdSWCS3mRMv4FlFaNslaD"
                        ></div>
                      </div>

                      {/* Hidden Fields */}
                      <input type="hidden" name="ml-submit" value="1" />
                      <input type="hidden" name="anticsrf" value="true" />

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5 mr-2" />
                            Yes, Send Me The Guide + Tips
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                                      </form>
                  ) : (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Success!</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                        Check your email for the download link. It should arrive within 2 minutes.
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ You're now subscribed to our weekly breathing tips
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Post-submit messaging */}
                {!isSuccess && (
                  <div className="text-center mt-4 space-y-2">
                    <p className="text-xs text-green-600 font-medium">
                      ⚡ You'll receive your guide within 60 seconds
                    </p>
                    <p className="text-xs text-muted-foreground">
                      📍 BR.AI.N LLC • Vancouver, WA • hello@breathwork.fyi
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="max-w-2xl mx-auto text-center mt-16"
          >
            <p className="text-lg text-primary/80 font-medium">
              Your journey to a calmer, more centered you starts now.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 