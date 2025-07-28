import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function DownloadStressGuide() {
  const [downloadCount, setDownloadCount] = useState(0);

  const handleDownload = async () => {
    // Track the download
    try {
      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guide: 'stress-guide' })
      });
    } catch (error) {
      console.error('Tracking error:', error);
    }

    // Start the download
    const link = document.createElement('a');
    link.href = '/stress-guide.pdf';
    link.download = '5-Minute-Reset-Stress-Guide.pdf';
    link.click();
    
    setDownloadCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Your Guide is Ready!</h1>
            <p className="text-xl text-muted-foreground">
              Thanks for joining our community. Here's your science-backed stress guide:
            </p>
          </div>

          {/* Download Card */}
          <Card className="border-2 border-primary/20 shadow-xl mb-12">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Download className="w-6 h-6" />
                5-Minute Reset: Stress Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg mb-6">
                <h3 className="font-bold mb-3">What's Inside:</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>✓ Understanding stress science</div>
                  <div>✓ 5-minute emergency techniques</div>
                  <div>✓ Getting started the right way</div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                onClick={handleDownload}
                className="text-lg px-8 py-6 h-auto"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Your Guide Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              {downloadCount > 0 && (
                <p className="text-sm text-green-600 mt-4">
                  ✅ Downloaded! Check your Downloads folder.
                </p>
              )}
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="border border-primary/10">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">What's Next?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">📧 Monthly Newsletter</h3>
                  <p className="text-sm text-muted-foreground">
                    Every month, you'll get new science-backed techniques and insights delivered to your inbox.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🌬️ Try Interactive Exercises</h3>
                  <p className="text-sm text-muted-foreground">
                    Ready for guided breathing sessions? 
                    <a href="/" className="text-primary hover:underline"> Try our interactive breathing exercises</a>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">📚 Free Learning Library</h3>
                  <p className="text-sm text-muted-foreground">
                    Dive deeper with our collection of expert articles on breathwork science and techniques.
                    <a href="/library" className="text-primary hover:underline"> Explore our library</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
      
      <Footer />
    </div>
  );
} 