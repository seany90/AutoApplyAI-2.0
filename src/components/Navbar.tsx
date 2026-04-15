import { Link } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Button } from './ui/button';
import { Bot, LogOut, Menu } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { syncAuthWithExtension } from '../lib/extensionBridge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';

export default function Navbar({ user }: { user: User | null }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync auth state with the Chrome Extension whenever the user changes
  useEffect(() => {
    syncAuthWithExtension();
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
    setIsMobileMenuOpen(false);
  };

  const openLogin = () => {
    setAuthTab('login');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const openSignup = () => {
    setAuthTab('signup');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white shrink-0">
            <Bot className="w-6 h-6 text-blue-500" />
            <span className="hidden sm:inline-block">AutoApply<span className="text-blue-500">AI</span></span>
            <span className="sm:hidden">AA<span className="text-blue-500">AI</span></span>
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
                <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <Link to="/resume" className="hover:text-white transition-colors">My Resume</Link>
                <Link to="/analyzer" className="hover:text-white transition-colors">Job Analyzer</Link>
                <Link to="/interview" className="hover:text-white transition-colors">Interview Buddy</Link>
                <Link to="/learning" className="hover:text-white transition-colors">Learning Lab</Link>
                <Link to="/tools" className="hover:text-white transition-colors">Power Tools</Link>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign Out" className="hidden lg:flex">
                  <LogOut className="w-4 h-4" />
                </Button>
                
                {/* Mobile Nav */}
                <div className="lg:hidden">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-slate-950 border-slate-800 text-slate-50 w-[250px] sm:w-[300px]">
                      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                      <div className="flex flex-col gap-6 mt-8">
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">Dashboard</Link>
                        <Link to="/resume" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">My Resume</Link>
                        <Link to="/analyzer" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">Job Analyzer</Link>
                        <Link to="/interview" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">Interview Buddy</Link>
                        <Link to="/learning" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">Learning Lab</Link>
                        <Link to="/tools" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-blue-400 transition-colors">Power Tools</Link>
                        <div className="h-px bg-slate-800 my-2"></div>
                        <Button variant="ghost" onClick={handleLogout} className="justify-start px-0 text-red-400 hover:text-red-300 hover:bg-transparent">
                          <LogOut className="w-5 h-5 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" onClick={openLogin} className="text-sm px-2 sm:px-4">Log In</Button>
              <Button onClick={openSignup} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 sm:px-4">Sign Up</Button>
            </div>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultTab={authTab} 
      />
    </>
  );
}
