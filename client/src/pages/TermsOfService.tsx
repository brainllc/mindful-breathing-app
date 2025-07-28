import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, Scale, Shield } from 'lucide-react';

export default function TermsOfService() {
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
                <Scale className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using our mindful breathing platform.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Last Updated: February 20, 2025
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-amber-100 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/20 rounded-lg p-6 border-l-4 border-amber-500 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Important Medical Disclaimer
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  This platform provides educational content about breathing techniques and wellness practices. It is not intended as medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals before beginning any new wellness practice.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Terms of Service Agreement
              </CardTitle>
              <CardDescription>
                By accessing and using this website and mobile application (collectively, the "Service"), you agree to be bound by these Terms of Service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* 1. Acceptance of Terms */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">1. Acceptance of Terms</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    By accessing or using the BR.AI.N LLC Mindful Breathing App ("Service"), you ("User" or "you") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between you and BR.AI.N LLC ("Company," "we," "us," or "our"). We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting.
                  </p>
                </div>
              </section>

              {/* 2. Medical Disclaimer */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">2. Medical Disclaimer and Health Warnings</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-gradient-to-r from-red-100 to-red-100 dark:from-red-900/20 dark:to-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
                    <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      IMPORTANT HEALTH DISCLAIMER:
                    </p>
                    <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                      <li>• The Service provides educational content about breathing techniques and wellness practices</li>
                      <li>• Content is NOT intended as medical advice, diagnosis, or treatment</li>
                      <li>• Always consult qualified healthcare professionals before beginning any new wellness practice</li>
                      <li>• Discontinue use and seek medical attention if you experience adverse effects</li>
                    </ul>
                  </div>
                  <p>
                    <strong>Contraindications:</strong> Certain breathing techniques may not be suitable for individuals with cardiovascular disease, respiratory conditions, pregnancy, epilepsy, or other medical conditions. You assume full responsibility for determining whether these practices are appropriate for your health status.
                  </p>
                  <p>
                    <strong>Emergency Situations:</strong> The Service is not intended for emergency situations. If you are experiencing a medical emergency, contact emergency services immediately.
                  </p>
                </div>
              </section>

              {/* 3. User Responsibilities */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">3. User Responsibilities</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>By using the Service, you agree to:</p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                    <li>Take full responsibility for your health and safety while using breathing techniques</li>
                    <li>Consult with healthcare professionals before beginning any new wellness practice</li>
                    <li>Not use the Service if you have contraindicated medical conditions without medical supervision</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Not attempt to gain unauthorized access to the Service or other users' accounts</li>
                    <li>Not upload, post, or transmit harmful, illegal, or inappropriate content</li>
                    <li>Not interfere with the Service's functionality or security</li>
                  </ul>
                </div>
              </section>

              {/* 4. Intellectual Property */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">4. Intellectual Property Rights</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    All content, features, and functionality of the Service, including but not limited to text, graphics, logos, audio files, software, and design, are owned by the Company or its licensors and are protected by copyright, trademark, and other intellectual property laws.
                  </p>
                  <p>
                    You are granted a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes only. You may not:
                  </p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>Reproduce, distribute, modify, or create derivative works of the Service</li>
                    <li>Reverse engineer, decompile, or disassemble the Service</li>
                    <li>Use the Service for commercial purposes without written consent</li>
                    <li>Remove or alter any proprietary notices or labels</li>
                  </ul>
                </div>
              </section>

              {/* 5. User-Generated Content */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">5. User-Generated Content</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    If you submit, post, or share content through the Service ("User Content"), you represent and warrant that:
                  </p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>You own or have the necessary rights to the User Content</li>
                    <li>Your User Content does not violate any third-party rights</li>
                    <li>Your User Content is not defamatory, obscene, or otherwise objectionable</li>
                  </ul>
                  <p>
                    By submitting User Content, you grant us a worldwide, royalty-free, perpetual, and transferable license to use, modify, distribute, and display such content in connection with the Service.
                  </p>
                </div>
              </section>

              {/* 6. Privacy and Data Protection */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">6. Privacy and Data Protection</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Your privacy is important to us. Our collection, use, and disclosure of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                  </p>
                  <p>
                    By using the Service, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy.
                  </p>
                </div>
              </section>

              {/* 7. Limitation of Liability */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">7. Limitation of Liability</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/20 rounded-lg p-6 border-l-4 border-yellow-500">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      LIMITATION OF LIABILITY:
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      TO THE FULLEST EXTENT PERMITTED BY LAW, THE COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, INCURRED BY YOU OR ANY THIRD PARTY, WHETHER IN AN ACTION IN CONTRACT OR TORT, EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                    </p>
                  </div>
                  <p>
                    <strong>Health-Related Limitations:</strong> The Company is not liable for any health-related issues, injuries, or adverse effects that may result from your use of breathing techniques or wellness practices accessed through the Service.
                  </p>
                  <p>
                    <strong>Maximum Liability:</strong> In no event shall the Company's total liability to you for all damages exceed the amount you paid to use the Service in the twelve (12) months preceding the claim.
                  </p>
                </div>
              </section>

              {/* 8. Disclaimers */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">8. Disclaimers</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE COMPANY MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                  </p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>The accuracy, completeness, or usefulness of the Service</li>
                    <li>The Service will be uninterrupted, secure, or error-free</li>
                    <li>Any specific results from using the Service</li>
                    <li>The Service will meet your particular needs or expectations</li>
                  </ul>
                </div>
              </section>

              {/* 9. Indemnification */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">9. Indemnification</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    You agree to indemnify, defend, and hold harmless the Company, its officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses arising from:
                  </p>
                  <ul className="space-y-2 list-disc list-inside ml-4">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Any health-related issues arising from your use of breathing techniques</li>
                  </ul>
                </div>
              </section>

              {/* 10. Termination */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">10. Termination</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
                  </p>
                  <p>
                    Upon termination, your right to use the Service will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive termination.
                  </p>
                </div>
              </section>

              {/* 11. Governing Law */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">11. Governing Law and Dispute Resolution</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of [Your State/Country], without regard to its conflict of law provisions.
                  </p>
                  <p>
                    <strong>Dispute Resolution:</strong> Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, rather than in court.
                  </p>
                  <p>
                    <strong>Class Action Waiver:</strong> You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
                  </p>
                </div>
              </section>

              {/* 12. Contact Information */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">12. Contact Information</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p><strong>Company:</strong> BR.AI.N LLC</p>
                    <p><strong>Email:</strong> hello@breathwork.fyi</p>
                    <p><strong>Address:</strong> 9407 Ne Vancouver Mall Dr, Ste 104 #2220, Vancouver, Washington 98662, United States</p>
                  </div>
                </div>
              </section>

            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>These Terms of Service are effective as of February 20, 2025.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 