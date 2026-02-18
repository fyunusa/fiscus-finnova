/**
 * Signup Flow Redirect
 * Ensures users start from step 1 unless they've completed signup
 * Use this in any page that's part of the signup flow
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignupFlow } from '@/hooks/useSignupFlow';

interface SignupFlowRedirectProps {
  currentStep: number;
  children: React.ReactNode;
}

/**
 * Wrapper component for signup flow pages
 * Prevents skipping steps by redirecting to appropriate step on mount
 */
export function SignupFlowRedirect({
  currentStep,
  children,
}: SignupFlowRedirectProps) {
  const router = useRouter();
  const { completedSteps, isAccountCreated, isInitialized } = useSignupFlow();

  useEffect(() => {
    if (!isInitialized) return;

    console.log(`🔍 Validating signup flow:`, {
      currentPageStep: currentStep,
      completedSteps,
      isAccountCreated,
    });

    // If account already created, user can access steps 5-9 freely
    // (these are post-account-creation steps, no linear progression needed)
    if (isAccountCreated) {
      // Allow access to steps 5-9 for logged-in users
      if (currentStep >= 5) {
        console.log(`✅ Account created, allowing access to step ${currentStep}`);
        return;
      }
      
      // If trying to go back to steps 1-4 after account creation, redirect to step 5
      if (currentStep < 5) {
        console.log('⏩ Account already created, redirecting to step 5');
        router.push('/signup/individual/credentials');
        return;
      }
    }

    // For new users, enforce linear progression on steps 1-4
    const maxCompletedStep = completedSteps.length > 0 ? Math.max(...completedSteps) : 0;

    // Allow access to current step or next step (linear progression)
    // Only redirect if trying to skip ahead by more than 1 step
    if (currentStep > maxCompletedStep + 1) {
      console.log(`⚠️ Attempted to skip from step ${maxCompletedStep} to ${currentStep}, redirecting to step ${maxCompletedStep + 1}...`);
      router.push(getStepPath(maxCompletedStep + 1));
      return;
    }

    // If trying to access step 1+ but no steps completed, ensure on step 1
    if (currentStep > 1 && maxCompletedStep === 0) {
      console.log(`⚠️ Attempted to skip step 1, redirecting...`);
      router.push(getStepPath(1));
      return;
    }
  }, [isInitialized, completedSteps, currentStep, isAccountCreated, router]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

/**
 * Get route path for each step
 */
function getStepPath(step: number): string {
  const routes: Record<number, string> = {
    1: '/signup/individual/terms',
    2: '/signup/individual/verify',
    3: '/signup/individual/info', // Skip to Step 4
    4: '/signup/individual/info',
    5: '/signup/individual/credentials',
    6: '/signup/individual/bank',
    7: '/signup/individual/verify-account',
    8: '/signup/individual/kyc',
    9: '/signup/individual/pin',
  };
  return routes[step] || '/signup/individual/terms';
}
