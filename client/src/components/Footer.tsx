import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Heart, Shield, FileText, Mail } from 'lucide-react';

export function Footer() {
  return (
    <motion.footer 
      className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-primary/10 dark:to-background border-t border-gray-200 dark:border-gray-800 mt-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">breathwork.fyi</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Your go-to resource for mindful breathing techniques, stress management, and wellness education. 
              Discover the power of breathwork for better mental and physical health.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for your wellbeing</span>
            </div>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact & Legal</h3>
            <div className="space-y-3">
              <a 
                href="mailto:hello@breathwork.fyi" 
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </a>
              <Link 
                href="/terms-of-service" 
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Terms of Service
              </Link>
              <Link 
                href="/privacy-policy" 
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} breathwork.fyi. All rights reserved.
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Not medical advice. Consult healthcare professionals.
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer; 