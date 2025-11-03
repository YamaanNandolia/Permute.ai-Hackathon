/**
 * Landing Page - Marketing hero with expandable insight cards
 */

import React, { useState } from 'react';
import { Eye, Target, TrendingUp, Zap, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  const [activeCard, setActiveCard] = useState(0);

  const features = [
    {
      icon: Eye,
      title: 'Theory-of-Mind Analytics',
      description: 'Understand customer attention patterns with advanced visibility modeling'
    },
    {
      icon: Target,
      title: 'Smart Placement',
      description: 'AI-powered recommendations for optimal product positioning'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Insights',
      description: 'Track visibility metrics and sales lift across your store network'
    },
    {
      icon: Zap,
      title: 'Interactive Simulation',
      description: 'Test layout changes with drag-and-drop before implementation'
    }
  ];

  const insightCards = [
    {
      title: 'Visibility',
      metric: '76%',
      description: 'Track eye-level placement and attention zones',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Attention',
      metric: '+15%',
      description: 'Measure customer focus on key products',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'End-Caps',
      metric: '42%',
      description: 'Optimize high-traffic promotional zones',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Hotspots',
      metric: '3',
      description: 'Identify and leverage peak attention areas',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const benefits = [
    'Increase visibility by up to 23%',
    'Boost sales through optimal placement',
    'Reduce planogram planning time by 60%',
    'Data-driven layout decisions',
    'Multi-store comparison & insights',
    'No hardware installation required'
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-[20px] border-b border-[rgba(33,38,63,0.08)]">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Flow Path Logo */}
            <svg width="32" height="32" viewBox="0 0 32 32" className="drop-shadow-md">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                </linearGradient>
                <filter id="logoBlur">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                </filter>
              </defs>
              <path
                d="M 8 24 Q 8 8, 16 8 Q 24 8, 24 16 Q 24 24, 16 24"
                stroke="url(#logoGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                filter="url(#logoBlur)"
              />
              <path
                d="M 8 24 Q 8 8, 16 8 Q 24 8, 24 16 Q 24 24, 16 24"
                stroke="url(#logoGradient)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[19px] font-semibold text-[#21263F] tracking-tight">Pathwise</span>
          </div>

          <div className="flex items-center gap-8">
            <a href="#features" className="text-[15px] text-[#525972] hover:text-[#21263F] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-[15px] text-[#525972] hover:text-[#21263F] transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-[15px] text-[#525972] hover:text-[#21263F] transition-colors">
              Pricing
            </a>
            <Button
              variant="outline"
              onClick={onGetStarted}
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[rgba(33,38,63,0.08)] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[13px] text-[#525972] font-semibold">Now with AI-powered simulation</span>
          </div>

          <h1 className="text-[#21263F] mb-6 max-w-[800px] mx-auto">
            Unveil the path behind every experience
          </h1>

          <p className="text-[20px] leading-[32px] text-[#525972] max-w-[600px] mx-auto mb-10">
            Turn store layouts into data-driven growth.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#3D4468] hover:bg-[#21263F] text-white px-8"
              onClick={onGetStarted}
            >
              Get Started
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8"
            >
              Watch Demo
            </Button>
          </div>

          <div className="mt-8 text-[13px] text-[#676F8E]">
            14-day free trial • No credit card required • Setup in minutes
          </div>
        </div>
      </section>

      {/* Drive Results Section with Mini-Cards */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[#21263F] mb-4">Drive results with data-driven insights</h2>
            <p className="text-[18px] text-[#525972] max-w-[600px] mx-auto">
              Pathwise gives you real-time visibility into customer behavior and product performance
            </p>
          </div>

          {/* Stacked Mini-Cards */}
          <div className="space-y-4 max-w-[900px] mx-auto">
            {insightCards.map((card, i) => (
              <div
                key={i}
                onClick={() => setActiveCard(i)}
                className={`
                  bg-gradient-to-r ${card.color} rounded-[16px] p-6 cursor-pointer
                  transition-all duration-300 hover:shadow-lg
                  ${activeCard === i ? 'shadow-xl transform scale-[1.02]' : 'opacity-90'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-[48px] font-bold text-white">{card.metric}</div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{card.title}</h3>
                      <p className="text-white/90 text-[14px]">{card.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[#21263F] mb-4">Everything you need to optimize</h2>
            <p className="text-[18px] text-[#525972]">
              Powerful features designed for retail success
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-8 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.32)] transition-all"
                >
                  <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-[#3D4468] to-[#525972] flex items-center justify-center mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-[#21263F] mb-2">{feature.title}</h3>
                  <p className="text-[15px] text-[#525972] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[#21263F] mb-4">Why leading retailers choose Pathwise</h2>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-[#22C55E]" />
                </div>
                <span className="text-[16px] text-[#21263F]">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[20px] p-12 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.28)]">
            <h2 className="text-[#21263F] mb-4">
              Ready to transform your business?
            </h2>
            <p className="text-[18px] text-[#525972] mb-8 max-w-[500px] mx-auto">
              Join leading retailers using AI to optimize their layouts and boost sales.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#3D4468] hover:bg-[#21263F] text-white px-8"
                onClick={onGetStarted}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8"
              >
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(33,38,63,0.08)] py-12 px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <defs>
                  <linearGradient id="logoGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 8 24 Q 8 8, 16 8 Q 24 8, 24 16 Q 24 24, 16 24"
                  stroke="url(#logoGradientFooter)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <div className="text-[16px] font-semibold text-[#21263F]">Pathwise</div>
                <div className="text-[13px] text-[#676F8E]">Unveil the path behind every experience.</div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-[14px] text-[#676F8E] hover:text-[#21263F]">
                Privacy
              </a>
              <a href="#" className="text-[14px] text-[#676F8E] hover:text-[#21263F]">
                Terms
              </a>
              <a href="#" className="text-[14px] text-[#676F8E] hover:text-[#21263F]">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-[13px] text-[#676F8E]">
            © 2025 Pathwise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
