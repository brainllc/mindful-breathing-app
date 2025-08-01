import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Menu, User, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, logout, isAuthenticated } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when at the top or scrolling up
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past a certain threshold
        setIsVisible(false);
        // Close mobile menu if open when hiding navbar
        setIsOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  // Listen for theme changes from ThemeToggle
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for direct theme changes
    const observer = new MutationObserver(() => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    });

    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const navItems = [
    {
      label: "Breathing Exercises",
      href: "/",
      active: location === "/",
    },
    {
      label: "Stress Guide",
      href: "/stress-guide",
      active: location === "/stress-guide",
    },
    {
      label: "Library",
      href: "/library",
      active: location.startsWith("/library"),
      disabled: false,
    },
    ...(isAuthenticated ? [{
      label: "Dashboard",
      href: "/dashboard",
      active: location === "/dashboard",
    }] : []),
  ];

  const NavLinks = ({ mobile = false }) => (
    <div className={`flex ${mobile ? "flex-col space-y-4" : "items-center space-x-8"}`}>
      {navItems.map((item) => (
        <div key={item.label} className="relative">
          {item.disabled ? (
            <span className="text-muted-foreground cursor-not-allowed">
              <span className={mobile ? "text-base" : "text-sm font-medium"}>{item.label}</span>
            </span>
          ) : (
            <Link
              href={item.href}
              onClick={() => mobile && setIsOpen(false)}
              className={`${mobile ? "text-base" : "text-sm font-medium"} transition-colors hover:text-primary ${
                item.active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40"
      initial={{ y: 0, opacity: 1 }}
      animate={{ 
        y: isVisible ? 0 : -100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
              breathwork.fyi
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Right Side - User Menu & Theme Toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden xl:flex items-center">
              <ThemeToggle />
            </div>
            
            {/* Desktop Auth */}
            {isAuthenticated ? (
              <div className="hidden xl:flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      {user?.displayName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2">
                    <DropdownMenuItem asChild className="px-3 py-2">
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="mx-2" />
                    <DropdownMenuItem onClick={logout} className="px-3 py-2">
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden xl:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">
                    <User className="w-4 h-4 mr-0.5" />
                    Register
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="xl:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-8 mt-8">
                  <NavLinks mobile />
                  
                  {/* Mobile Auth */}
                  <div className="flex flex-col space-y-4 pt-4 border-t">
                    {isAuthenticated ? (
                      <>
                        <Button variant="ghost" asChild>
                          <Link href="/profile" onClick={() => setIsOpen(false)}>
                            <User className="w-4 h-4 mr-3" />
                            Profile
                          </Link>
                        </Button>
                        <Button variant="outline" onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}>
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" asChild>
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            <LogIn className="w-4 h-4 mr-1" />
                            Login
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/register" onClick={() => setIsOpen(false)}>
                            <User className="w-4 h-4 mr-0.5" />
                            Register
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Mobile Theme Toggle */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm font-medium">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 