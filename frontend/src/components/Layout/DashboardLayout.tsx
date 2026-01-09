import React, { ReactNode, useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  Menu,
  X,
  Sparkles,
  Zap,
  MessageCircle,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLiveData } from "@/hooks/useLiveData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { userService } from "@/services/userService";
import { preferencesService } from "@/services/preferencesService";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Metrics", href: "/metrics", icon: BarChart3 },
  { name: "Spend Analysis", href: "/spend-analysis", icon: TrendingUp },
  { name: "Team", href: "/team", icon: Users },
  { name: "AI Chat", href: "/chatbot", icon: MessageCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Admin Panel", href: "/admin", icon: Settings },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return userService.isLoggedIn();
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return userService.isAdmin();
  });
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const user = userService.getCurrentUser();
    if (user) {
      // Use stored initials if available, otherwise generate from name
      const initials = user.initials || (() => {
        const nameParts = user.name.split(' ');
        return nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : user.name.substring(0, 2).toUpperCase();
      })();
      return {
        name: user.name,
        email: user.email,
        initials: initials
      };
    }
    return { name: '', email: '', initials: '' };
  });
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleStep, setGoogleStep] = useState('email'); // 'email' or 'password'
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showAccountPreferences, setShowAccountPreferences] = useState(false);
  const [preferences, setPreferences] = useState(() => preferencesService.getPreferences());
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: ''
  });
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Sync state with userService on mount and when storage changes
    const syncWithUserService = () => {
      const user = userService.getCurrentUser();
      const isUserLoggedIn = userService.isLoggedIn();
      const isUserAdmin = userService.isAdmin();

      setIsLoggedIn(isUserLoggedIn);
      setIsAdmin(isUserAdmin);

      if (user) {
        // Use stored initials if available, otherwise generate from name
        const initials = user.initials || (() => {
          const nameParts = user.name.split(' ');
          return nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : user.name.substring(0, 2).toUpperCase();
        })();
        setLoggedInUser({
          name: user.name,
          email: user.email,
          initials: initials
        });
      } else {
        setLoggedInUser({ name: '', email: '', initials: '' });
      }
    };

    syncWithUserService();

    // Listen for storage changes (useful for multiple tabs)
    window.addEventListener('storage', syncWithUserService);

    // Listen for preferences changes
    const handlePreferencesChange = (event: CustomEvent) => {
      setPreferences(event.detail);
    };
    window.addEventListener('preferencesChanged', handlePreferencesChange as EventListener);

    return () => {
      window.removeEventListener('storage', syncWithUserService);
      window.removeEventListener('preferencesChanged', handlePreferencesChange as EventListener);
    };
  }, []);
  const location = useLocation();
  const { isLive, setIsLive } = useLiveData();

  const handleLogin = async () => {
    if (userEmail && userPassword) {
      setIsLoggingIn(true);
      setLoginError('');

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const result = await userService.login(userEmail, userPassword);

        if (result.success && result.user) {
          const nameParts = result.user.name.split(' ');
          const initials = nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : result.user.name.substring(0, 2).toUpperCase();

          setLoggedInUser({
            name: result.user.name,
            email: result.user.email,
            initials: initials
          });
          setIsLoggedIn(true);
          setIsAdmin(result.user.role === 'admin');

          setTimeout(() => {
            setShowUserMenu(false);
            setUserEmail('');
            setUserPassword('');
          }, 100);
        } else {
          setLoginError(result.message);
        }
      } catch (error) {
        setLoginError('Login failed');
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (provider === 'google') {
        setShowGoogleLogin(true);
        setGoogleStep('email');
      } else {
        const sampleUsers = {
          microsoft: { name: 'Microsoft User', email: 'user@outlook.com', initials: 'MU' }
        };
        setLoggedInUser(sampleUsers[provider]);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUser', JSON.stringify(sampleUsers[provider]));
        setTimeout(() => {
          setShowUserMenu(false);
        }, 100);
      }
    } catch (error) {
      setLoginError('Social login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleEmailNext = () => {
    if (googleEmail) {
      setGoogleStep('password');
    }
  };

  const handleGoogleLogin = () => {
    if (googleEmail) {
      const emailParts = googleEmail.split('@')[0];
      const nameParts = emailParts.split('.');
      const firstName = nameParts[0] || emailParts;
      const lastName = nameParts[1] || '';
      const fullName = lastName ? `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}` : firstName.charAt(0).toUpperCase() + firstName.slice(1);
      const initials = lastName ? `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}` : firstName.charAt(0).toUpperCase() + (firstName.charAt(1) || '').toUpperCase();

      setLoggedInUser({
        name: fullName,
        email: googleEmail,
        initials: initials
      });
      setIsLoggedIn(true);
      // Save to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loggedInUser', JSON.stringify({
        name: fullName,
        email: googleEmail,
        initials: initials
      }));
      setShowGoogleLogin(false);
      setShowUserMenu(false);
      setGoogleEmail('');
      setGoogleStep('email');
    }
  };

  const handleLogout = () => {
    userService.logout();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setLoggedInUser({ name: '', email: '', initials: '' });
    // Redirect to landing page
    navigate('/');
  };

  const handleProfileUpdate = async () => {
    if (profileData.name && profileData.email) {
      try {
        const result = await userService.updateProfile({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          company: profileData.company,
          role: profileData.role
        });

        if (result.success && result.user) {
          const user = result.user;
          const nameParts = user.name.split(' ');
          const initials = nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : user.name.substring(0, 2).toUpperCase();

          setLoggedInUser({
            name: user.name,
            email: user.email,
            initials: initials
          });
          setShowProfileSettings(false);
        }
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    }
  };

  const openProfileSettings = () => {
    setProfileData({
      name: loggedInUser.name,
      email: loggedInUser.email,
      phone: '',
      company: 'OptiMSP',
      role: 'Administrator'
    });
    setShowProfileSettings(true);
    setShowUserMenu(false);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    preferencesService.updatePreferences({ [key]: value });
  };

  const handleForgotPassword = () => {
    if (resetEmail) {
      // Simulate password reset
      alert(`Password reset link sent to ${resetEmail}`);
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };



  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full border-r border-border bg-card transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="OptiMSP" className="h-10 w-10 object-contain" />
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  OptiMSP AI
                </span>
                <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning">
                  BETA
                </span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-3">
          <div className="mb-4 space-y-1">
            <p className={cn(
              "px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
              !sidebarOpen && "sr-only"
            )}>
              Dashboard
            </p>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              );
            })}

            {/* Admin Only Navigation */}
            {isAdmin && (
              <>
                <div className={cn(
                  "mt-4 pt-4 border-t border-border",
                  !sidebarOpen && "sr-only"
                )}>
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Admin
                  </p>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-destructive to-orange-500 text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && <span>{item.name}</span>}
                    </NavLink>
                  );
                })}
              </>
            )}
          </div>

          {/* AI Assistant */}
          {sidebarOpen && (
            <div className="mt-6 rounded-lg bg-gradient-to-br from-primary to-secondary p-4 text-primary-foreground relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">AI Assistant</span>
              </div>
              <p className="text-xs opacity-90 mb-3">
                Get instant insights about your MSP operations
              </p>
              <Button
                onClick={() => {
                  const aiSection = document.querySelector('[data-ai-assistant]');
                  if (aiSection) {
                    aiSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Wait for scroll to complete, then trigger the AI chat
                    setTimeout(() => {
                      const aiButton = aiSection.querySelector('button');
                      if (aiButton) {
                        aiButton.click();
                      }
                    }, 500);
                  }
                }}
                className="w-full bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white border border-white/30 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                size="sm"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="p-1 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                  </div>
                  <span className="font-semibold tracking-wide">ASK AI</span>
                  <div className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs font-bold">
                    β
                  </div>
                </div>
              </Button>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-16 items-center gap-4 px-6">

            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30">
                <Button
                  variant={isLive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsLive(!isLive)}
                  className={`h-8 px-3 ${isLive ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' : 'hover:bg-muted'}`}
                >
                  <Zap className={`h-4 w-4 mr-2 ${isLive ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-medium">Live Data</span>
                </Button>
                {isLive && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-600">LIVE</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <NotificationCenter />
                <ThemeCustomizer />
              </div>

              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground">
                    {isLoggedIn ? loggedInUser.initials : '?'}
                  </div>
                  {isLoggedIn && <span className="text-sm hidden sm:block">{loggedInUser.name.split(' ')[0]}</span>}
                </Button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-card border border-border rounded-lg shadow-lg z-50">
                    {!isLoggedIn ? (
                      <>
                        <div className="p-4 border-b border-border">
                          <h3 className="font-semibold mb-3 text-base">Account Login</h3>
                          <div className="space-y-3">
                            <Input
                              placeholder="john.doe@company.com"
                              className="h-10"
                              value={userEmail}
                              onChange={(e) => setUserEmail(e.target.value)}
                            />
                            <Input
                              type="password"
                              placeholder="Password"
                              className="h-10"
                              value={userPassword}
                              onChange={(e) => setUserPassword(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            />
                            {loginError && (
                              <div className="text-sm text-destructive mb-2 p-2 bg-destructive/10 rounded">
                                {loginError}
                              </div>
                            )}
                            <Button
                              onClick={handleLogin}
                              disabled={isLoggingIn || !userEmail || !userPassword}
                              className="w-full h-10 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                            >
                              {isLoggingIn ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Signing in...
                                </div>
                              ) : (
                                'Sign In'
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-3">
                            <button
                              onClick={() => handleSocialLogin('google')}
                              disabled={isLoggingIn}
                              className="flex items-center justify-center w-full p-3 bg-background border border-border rounded-md hover:bg-muted transition-colors shadow-sm disabled:opacity-50"
                            >
                              {isLoggingIn ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-3"></div>
                              ) : (
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                              )}
                              <span className="text-sm font-medium">{isLoggingIn ? 'Connecting...' : 'Continue with Google'}</span>
                            </button>
                            <button
                              onClick={() => handleSocialLogin('microsoft')}
                              disabled={isLoggingIn}
                              className="flex items-center justify-center w-full p-3 bg-[#0078d4] text-white rounded-md hover:bg-[#106ebe] transition-colors shadow-sm disabled:opacity-50"
                            >
                              {isLoggingIn ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                              ) : (
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                                </svg>
                              )}
                              <span className="text-sm font-medium">{isLoggingIn ? 'Connecting...' : 'Continue with Microsoft'}</span>
                            </button>
                            <div className="relative my-4">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">or</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowForgotPassword(true)}
                              className="block w-full text-center text-sm text-primary hover:underline py-2"
                            >
                              Forgot Password?
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                          <div className="relative">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground ring-2 ring-background">
                              {loggedInUser.initials}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-base">{loggedInUser.name}</p>
                            <p className="text-sm text-muted-foreground">{loggedInUser.email}</p>
                            <p className="text-xs text-green-600 font-medium">● Online</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={openProfileSettings}
                            className="block w-full text-left p-2 hover:bg-muted rounded-md transition-colors"
                          >
                            Profile Settings
                          </button>
                          <button
                            onClick={() => setShowAccountPreferences(true)}
                            className="block w-full text-left p-2 hover:bg-muted rounded-md transition-colors"
                          >
                            Account Preferences
                          </button>
                          <hr className="my-2" />
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left p-2 hover:bg-muted rounded-md transition-colors text-destructive"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Google Login Modal */}
      {showGoogleLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl w-96 max-w-[90vw] border border-border">
            <div className="p-8">
              <div className="text-center mb-6">
                <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <h2 className="text-2xl font-normal mb-2">Sign in</h2>
                <p className="text-sm text-muted-foreground">to continue to OptiMSP AI</p>
              </div>

              {googleStep === 'email' ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email or phone"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGoogleEmailNext()}
                      className="w-full p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="text-sm text-primary hover:underline cursor-pointer">
                    Forgot email?
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Not your computer? Use Guest mode to sign in privately.
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => setShowGoogleLogin(false)}
                      className="text-primary hover:bg-muted px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGoogleEmailNext}
                      disabled={!googleEmail}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {googleEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{googleEmail}</p>
                    </div>
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      onKeyPress={(e) => e.key === 'Enter' && handleGoogleLogin()}
                      className="w-full p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="text-sm text-primary hover:underline cursor-pointer">
                    Forgot password?
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => setGoogleStep('email')}
                      className="text-primary hover:bg-muted px-4 py-2 rounded"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleGoogleLogin}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowProfileSettings(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Company</label>
                <Input
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  placeholder="Enter your company"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Role</label>
                <Input
                  value={profileData.role}
                  onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                  placeholder="Enter your role"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowProfileSettings(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleProfileUpdate}
                disabled={!profileData.name || !profileData.email}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Account Preferences Modal */}
      {showAccountPreferences && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Account Preferences</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAccountPreferences(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Alerts</span>
                    <input
                      type="checkbox"
                      checked={preferences.smsAlerts}
                      onChange={(e) => handlePreferenceChange('smsAlerts', e.target.checked)}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Reports</span>
                    <input
                      type="checkbox"
                      checked={preferences.weeklyReports}
                      onChange={(e) => handlePreferenceChange('weeklyReports', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-logout</span>
                    <input
                      type="checkbox"
                      checked={preferences.autoLogout}
                      onChange={(e) => handlePreferenceChange('autoLogout', e.target.checked)}
                      className="rounded"
                    />
                  </div>

                  {preferences.autoLogout && (
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-sm text-muted-foreground">Timeout (minutes)</span>
                      <select
                        value={preferences.autoLogoutTime}
                        onChange={(e) => handlePreferenceChange('autoLogoutTime', parseInt(e.target.value))}
                        className="text-sm border border-input rounded px-2 py-1 bg-background"
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  preferencesService.resetToDefaults();
                  setPreferences(preferencesService.getPreferences());
                }}
              >
                Reset to Defaults
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => setShowAccountPreferences(false)}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Reset Password</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForgotPassword(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div>
                <label className="text-sm font-medium mb-1 block">Email Address</label>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowForgotPassword(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleForgotPassword}
                disabled={!resetEmail}
              >
                Send Reset Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
