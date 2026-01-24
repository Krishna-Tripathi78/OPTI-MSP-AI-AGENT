import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FirebaseLoginModal from '@/components/FirebaseLoginModal';
import { userService } from '@/services/userService';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import {
  Brain,
  TrendingUp,
  DollarSign,
  Users,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; role?: string } | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = userService.getCurrentUser();
    if (user) {
      setCurrentUser({ email: user.email, role: user.role });
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user: any) => {
    console.log('Login successful, user:', user);
    if (user) {
      // Get proper user name from Firebase user object
      const userName = user.displayName || user.email?.split('@')[0] || 'User';

      // Generate initials from name
      const getInitials = (name: string) => {
        const words = name.split(' ');
        if (words.length >= 2) {
          return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };

      // Store user in userService for ProtectedRoute compatibility
      const userData = {
        email: user.email || user.uid,
        name: userName,
        initials: getInitials(userName),
        role: 'user'
      };

      console.log('Storing user data:', userData);

      // Store in localStorage for ProtectedRoute
      localStorage.setItem('optimsp_session', JSON.stringify(userData));

      setCurrentUser({ email: user.email || user.uid, role: 'user' });
      setIsLoggedIn(true);

      // Immediate redirect
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    // Clear Firebase and userService
    localStorage.removeItem('optimsp_session');
    userService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OptiMSP AI" className="w-8 h-8" />
            <span className="text-xl font-semibold">OptiMSP AI</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeCustomizer />
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, {currentUser?.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground px-4 py-2"
                >
                  Logout
                </Button>
                <Button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <>
                <button
                  className="text-muted-foreground hover:text-foreground px-4 py-2"
                  onClick={() => setShowLoginModal(true)}
                >
                  Login
                </button>
                <button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                  onClick={() => setShowLoginModal(true)}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero - More Human */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mb-6">
            💡 AI-Powered MSP Financial Advisor
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Stop Flying Blind on
            <span className="text-primary">Profitability</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Most MSPs lose money without knowing it. Hidden costs, unused licenses,
            and client churn eat into profits. We help you see what's really happening
            in your business.
          </p>

          <div className="flex gap-4 mb-12">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={() => isLoggedIn ? navigate('/dashboard') : setShowLoginModal(true)}
            >
              Start Free Trial →
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 px-8 py-3"
              onClick={() => window.open('https://1drv.ms/v/c/faf86bc519089114/IQCaE2c4gTWdSbME-c-hzAgGAdKThYWhzsumIPyaEl-OtNY?e=nxC9sU', '_blank')}
            >
              <Play className="mr-2 h-4 w-4" />
              See Demo
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            ✓ No credit card required • ✓ 14-day free trial • ✓ Setup in 5 minutes
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Sound Familiar?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border">
              <AlertCircle className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold mb-2">"We're busy but not profitable"</h3>
              <p className="text-muted-foreground text-sm">
                Revenue is up but margins are shrinking. You're working harder
                but making less per client.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-4" />
              <h3 className="font-semibold mb-2">"Software costs are out of control"</h3>
              <p className="text-muted-foreground text-sm">
                Paying for licenses nobody uses. Multiple tools doing the same thing.
                Bills keep growing.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">"Clients leave without warning"</h3>
              <p className="text-muted-foreground text-sm">
                Everything seemed fine, then they cancel. No early warning signs,
                no chance to fix issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Here's What We Do
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple tools that show you exactly where money is being wasted
              and which clients might leave.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Real-time Analytics</h3>
                    <p className="text-muted-foreground text-sm">
                      See your actual profit margins by client, service, and month.
                      No more guessing.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">AI Anomaly Detection</h3>
                    <p className="text-muted-foreground text-sm">
                      Automatically spots unusual patterns that signal problems
                      before they cost you money.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">License Optimization</h3>
                    <p className="text-muted-foreground text-sm">
                      Find unused software licenses and duplicate tools.
                      Most clients save $2,000+ per month.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Conversational Insights</h3>
                    <p className="text-muted-foreground text-sm">
                      Ask questions like "Which clients are unprofitable?"
                      and get instant answers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted p-8 rounded-lg">
              <div className="bg-card p-4 rounded border mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Client Profitability</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">TechCorp Inc</span>
                    <span className="text-green-600 font-medium">+$2,400/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">StartupXYZ</span>
                    <span className="text-red-600 font-medium">-$800/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">MidSize LLC</span>
                    <span className="text-green-600 font-medium">+$1,200/mo</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 See exactly which clients make you money
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Real Numbers */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Real Results from Real MSPs
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$47K</div>
              <div className="text-sm text-muted-foreground">Average annual savings found</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">23%</div>
              <div className="text-sm text-muted-foreground">Increase in profit margins</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">89%</div>
              <div className="text-sm text-muted-foreground">Reduction in client churn</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">3 days</div>
              <div className="text-sm text-muted-foreground">Average setup time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to See What You're Missing?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start your free trial. No setup fees, no long-term contracts.
            Cancel anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
              onClick={() => isLoggedIn ? navigate('/dashboard') : setShowLoginModal(true)}
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Start Free Trial'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            14-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t bg-muted py-8">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OptiMSP AI" className="w-6 h-6" />
            <span className="font-medium text-foreground">OptiMSP AI</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Built by Team OpsMind

          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <FirebaseLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}