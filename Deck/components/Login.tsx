/**
 * Login - Clean authentication screen
 */

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-8">
      {/* Back Button */}
      <a
        href="#"
        className="absolute top-8 left-8 flex items-center gap-2 text-[15px] text-[#525972] hover:text-[#21263F] transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </a>

      {/* Login Card */}
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <svg width="36" height="36" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="loginLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M 8 24 Q 8 8, 16 8 Q 24 8, 24 16 Q 24 24, 16 24"
              stroke="url(#loginLogoGradient)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[24px] font-semibold text-[#21263F] tracking-tight">Pathwise</span>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[16px] border border-[rgba(33,38,63,0.08)] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.28)] p-8">
          <div className="text-center mb-8">
            <h2 className="text-[#21263F] mb-2">Welcome back</h2>
            <p className="text-[15px] text-[#676F8E]">
              Sign in to your Pathwise account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-[#21263F] mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="sarah@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#FAFBFC] border-[rgba(33,38,63,0.12)]"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#21263F] mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#FAFBFC] border-[rgba(33,38,63,0.12)]"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-[14px] text-[#525972] cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-[14px] text-[#3D4468] hover:text-[#21263F] font-medium"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#21263F] hover:bg-[#3D4468] text-white"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(33,38,63,0.08)]">
            <div className="text-center text-[14px] text-[#676F8E]">
              Don't have an account?{' '}
              <a href="#" className="text-[#3D4468] hover:text-[#21263F] font-medium">
                Start free trial
              </a>
            </div>
          </div>
        </div>

        {/* SSO Options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(33,38,63,0.12)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#FAFBFC] text-[13px] text-[#676F8E]">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              variant="outline"
              className="bg-white border-[rgba(33,38,63,0.12)]"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="bg-white border-[rgba(33,38,63,0.12)]"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z" />
              </svg>
              GitHub
            </Button>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center text-[13px] text-[#676F8E]">
          By signing in, you agree to our{' '}
          <a href="#" className="text-[#525972] hover:text-[#21263F]">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#525972] hover:text-[#21263F]">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
