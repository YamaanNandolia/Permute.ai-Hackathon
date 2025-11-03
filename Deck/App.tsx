/**
 * Pathwise - See behavior. Shape experience
 * 
 * An Apple-grade light interface for retail store optimization.
 * Built with React, Tailwind CSS, and shadcn/ui components.
 * 
 * Design System:
 * - Font: Manrope (300/400/600/700)
 * - Colors: #21263F, #3D4468, #525972, #676F8E (used as accents on light canvas)
 * - Light theme: #FAFBFC background, white cards with soft elevation
 * - Border radius: 16-20px, subtle shadows, inner hairlines
 * - Transitions: 120-200ms ease-out
 * 
 * Navigation Flow:
 * 1. Landing → Marketing hero with features
 * 2. Login → Clean authentication
 * 3. Onboarding → 4-step data import wizard
 * 4. App → Main dashboard with 6 screens:
 *    - Dashboard: KPI tiles, heatmap, visibility drivers
 *    - Optimize Item: Product analysis with floor plan heatmap
 *    - Learning Insights: AI-powered pattern cards
 *    - Simulation: Drag-and-drop layout testing
 *    - Saved Plans: Plan management & comparison
 *    - Settings: Profile, store, integrations, billing
 */

import React, { useState } from 'react';
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './components/Dashboard';
import { OptimizeItem } from './components/OptimizeItem';
import { LearningInsights } from './components/LearningInsights';
import { Simulation } from './components/Simulation';
import { SavedPlans } from './components/SavedPlans';
import { Settings } from './components/Settings';
import { Toaster } from './components/ui/sonner';

type AppScreen = 'landing' | 'login' | 'onboarding' | 'app';
type AppPage = 'dashboard' | 'optimize' | 'insights' | 'simulation' | 'plans' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');

  const handleGetStarted = () => {
    setScreen('login');
  };

  const handleLogin = () => {
    setScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    setScreen('app');
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AppPage);
  };

  // Landing screen
  if (screen === 'landing') {
    return (
      <>
        <Landing onGetStarted={handleGetStarted} />
        <Toaster />
      </>
    );
  }

  // Login screen
  if (screen === 'login') {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // Onboarding screen
  if (screen === 'onboarding') {
    return (
      <>
        <Onboarding onComplete={handleOnboardingComplete} />
        <Toaster />
      </>
    );
  }

  // Main app with navigation
  return (
    <>
      <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {currentPage === 'optimize' && <OptimizeItem onNavigate={handleNavigate} />}
        {currentPage === 'insights' && <LearningInsights onNavigate={handleNavigate} />}
        {currentPage === 'simulation' && <Simulation onNavigate={handleNavigate} />}
        {currentPage === 'plans' && <SavedPlans onNavigate={handleNavigate} />}
        {currentPage === 'settings' && <Settings />}
      </AppLayout>

      <Toaster />
    </>
  );
}
