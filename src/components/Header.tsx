import React, { useState } from 'react';
import { ImageIcon, User, LogOut, Settings, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';
import type { User as UserType } from '../lib/supabase';
import AdUnit from './AdUnit';

interface HeaderProps {
  user: UserType | null;
  onAuthClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onAuthClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured) {
      setShowUserMenu(false);
      return;
    }
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Continue with sign out even if API call fails
    }
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-sm opacity-20"></div>
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent ml-3">
              Image Compressor Pro
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
              Pricing
            </a>
            <a href="#support" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
              Support
            </a>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onAuthClick}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ⭐ Go Premium
            </button>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-700 font-semibold">
                    {user.email.split('@')[0]}
                  </span>
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs px-2.5 py-1 rounded-full ml-2 font-semibold">
                    PRO
                  </span>
                </button>

                {/* User Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/50 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">{user.email}</p>
                      <p className="text-xs text-purple-600 font-semibold">Premium Plan</p>
                    </div>
                    
                    <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center font-medium transition-colors">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Usage Statistics
                    </button>
                    
                    <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center font-medium transition-colors">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </button>
                    
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Header Ad Banner */}
      <div className="bg-slate-50 border-b border-slate-200/50 py-3">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="max-w-4xl w-full">
            <AdUnit 
              slot="9829278545"
              className="header-ad"
            />
          </div>
        </div>
      </div>
    </header>
  );
    {/* Header Ad Banner - Compact */}
    <div className="bg-slate-50/80 border-b border-slate-200/30 py-2">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-1">
            <span className="text-xs text-slate-400 uppercase tracking-wide">Advertisement</span>
          </div>
          <AdUnit 
            slot="9829278545"
            className="header-ad"
            style={{ minHeight: '60px', maxHeight: '90px' }}
          />
        </div>
      </div>
    </div>
}