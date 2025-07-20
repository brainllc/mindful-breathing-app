import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, Lock, Eye, Database, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background">
      <div className="container mx-auto px-4 py-8">
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
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Learn how we collect, use, and protect your personal information when you use our mindful breathing platform.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Last Updated: February 20, 2025
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500 mb-8">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Your Privacy Matters
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  We are committed to protecting your privacy and being transparent about how we collect, use, and share your personal information. This policy complies with GDPR, CCPA, and other applicable privacy laws.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Policy
              </CardTitle>
              <CardDescription>
                This Privacy Policy explains how BR.AI.N LLC collects, uses, and protects your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* 1. Information We Collect */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  1. Information We Collect
                </h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Personal Information You Provide:</h4>
                    <ul className="space-y-1 text-sm list-disc list-inside ml-4">
                      <li>Account information (name, email address, username)</li>
                      <li>Profile information (age, wellness goals, preferences)</li>
                      <li>Communication data (messages, feedback, support requests)</li>
                      <li>Payment information (processed securely by third-party providers)</li>
                      <li>Health-related information (only if voluntarily provided)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Information Collected Automatically:</h4>
                    <ul className="space-y-1 text-sm list-disc list-inside ml-4">
                      <li>Usage data (breathing sessions, time spent, features used)</li>
                      <li>Device information (operating system, browser type, device ID)</li>
                      <li>Technical data (IP address, cookies, session data)</li>
                      <li>Analytics data (app performance, user interactions)</li>
                      <li>Location data (if enabled, for localized content)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Information from Third Parties:</h4>
                    <ul className="space-y-1 text-sm list-disc list-inside ml-4">
                      <li>Social media login information (if you choose to connect)</li>
                      <li>Analytics providers (Google Analytics, etc.)</li>
                      <li>Payment processors (Stripe, PayPal, etc.)</li>
                      <li>Authentication services (OAuth providers)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 2. How We Use Your Information */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">2. How We Use Your Information</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>We use your personal information for the following purposes:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-green-100 to-green-100 dark:from-green-900/20 dark:to-green-900/20 rounded-lg p-6 border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Service Provision</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside text-green-700 dark:text-green-300">
                        <li>Provide breathing exercises and wellness content</li>
                        <li>Personalize your experience and recommendations</li>
                        <li>Track your progress and preferences</li>
                        <li>Enable social features (if opted in)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Communication</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside text-blue-700 dark:text-blue-300">
                        <li>Send service-related notifications</li>
                        <li>Provide customer support</li>
                        <li>Send wellness tips and updates (if consented)</li>
                        <li>Respond to your inquiries</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-100 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-lg p-6 border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Improvement & Analytics</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside text-purple-700 dark:text-purple-300">
                        <li>Analyze usage patterns and trends</li>
                        <li>Improve app functionality and user experience</li>
                        <li>Conduct research and development</li>
                        <li>Monitor app performance and security</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-100 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/20 rounded-lg p-6 border-l-4 border-orange-500">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Legal & Security</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside text-orange-700 dark:text-orange-300">
                        <li>Comply with legal obligations</li>
                        <li>Protect against fraud and abuse</li>
                        <li>Enforce our Terms of Service</li>
                        <li>Resolve disputes and claims</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Legal Basis for Processing */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">3. Legal Basis for Processing (GDPR)</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>If you are located in the European Union, we process your personal information based on:</p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li><strong>Consent:</strong> For marketing communications and optional features</li>
                    <li><strong>Contract:</strong> To provide the service you requested</li>
                    <li><strong>Legitimate Interest:</strong> For analytics, security, and service improvement</li>
                    <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
                  </ul>
                </div>
              </section>

              {/* 4. Information Sharing */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">4. How We Share Your Information</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-gradient-to-r from-red-100 to-red-100 dark:from-red-900/20 dark:to-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
                    <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      We do NOT sell your personal information to third parties.
                    </p>
                  </div>
                  
                  <p>We may share your information in the following limited circumstances:</p>
                  
                  <div className="space-y-3">
                    <div className="pl-4 border-l-4 border-gray-300 dark:border-gray-600">
                      <h4 className="font-semibold">Service Providers:</h4>
                      <p className="text-sm">Third-party vendors who help us operate our service (hosting, analytics, payment processing, customer support)</p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300 dark:border-gray-600">
                      <h4 className="font-semibold">Legal Requirements:</h4>
                      <p className="text-sm">When required by law, court order, or government request</p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300 dark:border-gray-600">
                      <h4 className="font-semibold">Business Transfers:</h4>
                      <p className="text-sm">In connection with a merger, acquisition, or sale of assets</p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300 dark:border-gray-600">
                      <h4 className="font-semibold">Consent:</h4>
                      <p className="text-sm">With your explicit consent for specific purposes</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Cookies and Tracking */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">5. Cookies and Tracking Technologies</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>We use cookies and similar technologies to:</p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Essential Cookies</h4>
                      <p className="text-sm">Required for basic functionality, authentication, and security</p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Analytics Cookies</h4>
                      <p className="text-sm">Help us understand how users interact with our service</p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Preference Cookies</h4>
                      <p className="text-sm">Remember your settings and personalization choices</p>
                    </div>
                  </div>
                  
                  <p className="text-sm">You can manage cookie preferences through your browser settings or our cookie consent manager.</p>
                </div>
              </section>

              {/* 6. Data Security */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">6. Data Security</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-gradient-to-r from-green-100 to-green-100 dark:from-green-900/20 dark:to-green-900/20 rounded-lg p-6 border-l-4 border-green-500">
                    <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Security Measures We Implement:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-green-700 dark:text-green-300">
                      <li>End-to-end encryption for sensitive data</li>
                      <li>Regular security audits and assessments</li>
                      <li>Secure data centers with 24/7 monitoring</li>
                      <li>Access controls and authentication protocols</li>
                      <li>Regular software updates and security patches</li>
                      <li>Employee training on data protection</li>
                    </ul>
                  </div>
                  
                  <p>
                    While we implement industry-standard security measures, no system is completely secure. We cannot guarantee absolute security, but we continually work to protect your information.
                  </p>
                </div>
              </section>

              {/* 7. Data Retention */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">7. Data Retention</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>We retain your personal information for as long as necessary to:</p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>Provide our services to you</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes and enforce agreements</li>
                    <li>Improve our services (in aggregated, anonymized form)</li>
                  </ul>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Typical Retention Periods:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Account data: Until account deletion + 30 days</li>
                      <li>Usage data: 24 months</li>
                      <li>Communication records: 3 years</li>
                      <li>Payment data: 7 years (for tax/legal compliance)</li>
                      <li>Marketing consent: Until withdrawn</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 8. Your Rights */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">8. Your Privacy Rights</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-gradient-to-r from-purple-100 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-lg p-6 border-l-4 border-purple-500">
                    <p className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                      Under GDPR, CCPA, and other privacy laws, you have the right to:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      <ul className="text-sm space-y-1 list-disc list-inside text-purple-700 dark:text-purple-300">
                        <li>Access your personal information</li>
                        <li>Correct inaccurate information</li>
                        <li>Delete your personal information</li>
                        <li>Restrict processing of your data</li>
                      </ul>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Data portability</li>
                        <li>Object to processing</li>
                        <li>Withdraw consent</li>
                        <li>Non-discrimination for exercising rights</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p>
                    To exercise your rights, please contact us at breathwork.fyi@gmail.com. We will respond within 30 days (or as required by applicable law).
                  </p>
                </div>
              </section>

              {/* 9. International Transfers */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  9. International Data Transfers
                </h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including:
                  </p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                    <li>Adequacy decisions for certain countries</li>
                    <li>Binding Corporate Rules where applicable</li>
                    <li>Your explicit consent for specific transfers</li>
                  </ul>
                </div>
              </section>

              {/* 10. Children's Privacy */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">10. Children's Privacy</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Age Restrictions:
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                    </p>
                  </div>
                  
                  <p>
                    If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
                  </p>
                </div>
              </section>

              {/* 11. Updates to Privacy Policy */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">11. Updates to This Privacy Policy</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                  </p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>Email notification to registered users</li>
                    <li>Prominent notice on our website</li>
                    <li>In-app notification</li>
                    <li>Updated "Last Modified" date</li>
                  </ul>
                  <p>
                    Your continued use of the Service after any changes indicates your acceptance of the updated Privacy Policy.
                  </p>
                </div>
              </section>

              {/* 12. Contact Information */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">12. Contact Information</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    If you have questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">General Privacy Inquiries:</h4>
                      <p className="text-sm">breathwork.fyi@gmail.com</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Data Protection Officer:</h4>
                      <p className="text-sm">breathwork.fyi@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Mailing Address:</h4>
                    <p className="text-sm">
                      BR.AI.N LLC<br />
                      9407 Ne Vancouver Mall Dr, Ste 104 #2220<br />
                      Vancouver, Washington 98662<br />
                      United States
                    </p>
                  </div>
                  
                  <p className="text-sm">
                    <strong>EU Users:</strong> You also have the right to lodge a complaint with your local supervisory authority.
                  </p>
                </div>
              </section>

            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>This Privacy Policy is effective as of February 20, 2025.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 