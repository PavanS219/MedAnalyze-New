import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronRight, Shield, Zap, FileText, MessageSquare, Stethoscope, TrendingUp, Users, Clock, CheckCircle, ArrowRight, Brain, Heart, Activity } from 'lucide-react';
import { FloatingScene } from './FloatingScene';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage = ({ onEnterApp }: LandingPageProps) => {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Check which sections are visible
      const sections = document.querySelectorAll('[data-section]');
      const visible = new Set<string>();
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          visible.add(section.getAttribute('data-section') || '');
        }
      });
      
      setVisibleSections(visible);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const CounterStat = ({ end, label, icon: Icon, suffix = '' }: { end: number; label: string; icon: any; suffix?: string }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (visibleSections.has('stats') && !hasAnimated) {
        setHasAnimated(true);
        let start = 0;
        const duration = 2000;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        
        return () => clearInterval(timer);
      }
    }, [visibleSections, hasAnimated, end]);

    return (
      <Card className="glass-panel p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon className="w-12 h-12 mx-auto mb-4 text-primary relative z-10" />
        <div className="text-4xl font-bold gradient-text mb-2 relative z-10">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-muted-foreground relative z-10">{label}</div>
      </Card>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Floating Elements Background */}
      <FloatingScene />
      
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20 animate-gradient-x" style={{ zIndex: -1 }} />
      
      {/* Sticky Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'bg-background/80 backdrop-blur-lg shadow-lg' : ''
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">MedAnalyze</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="hidden md:flex items-center gap-2">
              <Shield className="w-4 h-4" />
              HIPAA Compliant
            </Badge>
            <Badge variant="secondary" className="hidden md:flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Enhanced
            </Badge>
            <Button onClick={onEnterApp} size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Experience MedAnalyze
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 text-lg px-6 py-2 animate-pulse">
            <Sparkles className="w-5 h-5 mr-2" />
            Powered by Advanced AI
          </Badge>
          
          <h1 className="text-7xl md:text-8xl font-bold mb-6 gradient-text animate-fade-in">
            MedAnalyze
          </h1>
          
          <p className="text-3xl md:text-4xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            AI-Powered Medical Intelligence Platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              onClick={onEnterApp}
              size="lg"
              className="relative group px-12 py-8 text-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 pulse-glow"
            >
              <Sparkles className="w-6 h-6 mr-3 animate-spin-slow" />
              Experience MedAnalyze
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="px-12 py-8 text-xl border-2 border-primary/50 hover:bg-primary/10"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <Badge variant="secondary" className="text-lg px-6 py-3">
              <Shield className="w-5 h-5 mr-2" />
              HIPAA Compliant
            </Badge>
            <Badge variant="secondary" className="text-lg px-6 py-3">
              <Zap className="w-5 h-5 mr-2" />
              AI Enhanced
            </Badge>
            <Badge variant="secondary" className="text-lg px-6 py-3">
              <Clock className="w-5 h-5 mr-2" />
              24/7 Available
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" data-section="features" className="py-32 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-6 gradient-text">
            Powerful Medical Intelligence Features
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Transform how you understand and act on medical information
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-panel p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <MessageSquare className="w-16 h-16 text-primary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">AI Assistant</h3>
              <p className="text-muted-foreground mb-6 relative z-10">
                Chat with our advanced AI to get instant answers about your medical reports and health concerns.
              </p>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Natural language understanding</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Context-aware responses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>24/7 availability</span>
                </li>
              </ul>
            </Card>

            <Card className="glass-panel p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileText className="w-16 h-16 text-secondary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">Report Summary</h3>
              <p className="text-muted-foreground mb-6 relative z-10">
                Automatically analyze and summarize complex medical reports into easy-to-understand insights.
              </p>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span>Intelligent extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span>Key findings highlighted</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span>Visual comparisons</span>
                </li>
              </ul>
            </Card>

            <Card className="glass-panel p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Stethoscope className="w-16 h-16 text-primary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">Find Specialists</h3>
              <p className="text-muted-foreground mb-6 relative z-10">
                Connect with verified medical professionals and book consultations instantly.
              </p>
              <ul className="space-y-3 relative z-10">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Verified doctors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Specialty matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Easy booking</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section data-section="stats" className="py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <CounterStat end={10000} label="Reports Analyzed" icon={FileText} suffix="+" />
            <CounterStat end={2500} label="Verified Doctors" icon={Users} suffix="+" />
            <CounterStat end={95} label="Accuracy Rate" icon={TrendingUp} suffix="%" />
            <CounterStat end={24} label="AI Available" icon={Clock} suffix="/7" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section data-section="how-it-works" className="py-32 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-6 gradient-text">
            Simple, Fast, Accurate
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Get insights from your medical reports in three easy steps
          </p>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-1 bg-gradient-to-r from-primary via-secondary to-primary transform -translate-y-1/2 opacity-30" />
            
            <div className="text-center relative">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl animate-pulse">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Upload Reports</h3>
              <p className="text-muted-foreground">
                Securely upload your medical reports, lab results, or prescriptions in any format.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-2xl animate-pulse" style={{ animationDelay: '0.2s' }}>
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our advanced AI processes and analyzes your reports to extract key insights.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl animate-pulse" style={{ animationDelay: '0.4s' }}>
                <Heart className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Get Results</h3>
              <p className="text-muted-foreground">
                Receive comprehensive summaries and connect with specialists for guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-6xl font-bold mb-8 gradient-text">
            Ready to Transform Your Health Journey?
          </h2>
          <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Join thousands of users who trust MedAnalyze for their medical intelligence needs
          </p>
          
          <Button 
            onClick={onEnterApp}
            size="lg"
            className="relative group px-16 py-10 text-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 pulse-glow"
          >
            <Sparkles className="w-8 h-8 mr-4 animate-spin-slow" />
            Experience MedAnalyze Now
            <ArrowRight className="w-8 h-8 ml-4 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 relative z-10">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MedAnalyze. All rights reserved. HIPAA Compliant.</p>
        </div>
      </footer>
    </div>
  );
};
