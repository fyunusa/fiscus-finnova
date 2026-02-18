/**
 * useSignupFlow Hook
 * Manages data persistence across all signup steps (1-5)
 * Data is stored in sessionStorage and cleared after successful account creation
 */

import { useEffect, useState, useCallback } from 'react';

export interface SignupData {
  // Step 1: Agreement
  agreedToTerms?: boolean;
  agreedToPrivacy?: boolean;
  agreedToMarketing?: boolean;

  // Step 2: NICE Verification & Phone
  niceToken?: string;
  niceCI?: string;
  niceDI?: string;
  verifiedName?: string;
  verifiedBirthDate?: string;
  verifiedGender?: string;
  verifiedPhone?: string;

  // Step 3: Account Verification (1 Won)
  accountVerificationToken?: string;
  verifiedAccountNumber?: string;
  verifiedBankCode?: string;
  verifiedAccountHolder?: string;

  // Step 4: Personal Info & Address
  address?: string;
  detailAddress?: string;
  buildingName?: string;
  postcode?: string;

  // Step 5: Login Credentials
  username?: string;
  email?: string;
  password?: string; // hashed on backend
}

interface SignupFlowState {
  data: SignupData;
  currentStep: number;
  completedSteps: number[];
  isAccountCreated: boolean;
}

const STORAGE_KEY = 'signup_flow_data';
const COMPLETION_FLAG_KEY = 'signup_account_created';

/**
 * Load signup data from sessionStorage and localStorage
 */
function loadSignupData(): SignupFlowState {
  if (typeof window === 'undefined') {
    return {
      data: {},
      currentStep: 1,
      completedSteps: [],
      isAccountCreated: false,
    };
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const completionFlag = sessionStorage.getItem(COMPLETION_FLAG_KEY);

    if (stored) {
      const state = JSON.parse(stored);
      return {
        ...state,
        isAccountCreated: completionFlag === 'true',
      };
    }

    // If sessionStorage is empty, check localStorage for individual step completion flags
    // This handles page refreshes where sessionStorage was cleared
    const completedSteps: number[] = [];
    for (let i = 1; i <= 9; i++) {
      if (localStorage.getItem(`signup_step_${i}_completed`) === 'true') {
        completedSteps.push(i);
      }
    }

    const isAccountCreated = localStorage.getItem('signup_account_created') === 'true' ||
                              localStorage.getItem('accessToken') !== null; // Also check for auth token

    return {
      data: {},
      currentStep: 1,
      completedSteps,
      isAccountCreated,
    };
  } catch (error) {
    console.error('Error loading signup data:', error);
  }

  return {
    data: {},
    currentStep: 1,
    completedSteps: [],
    isAccountCreated: false,
  };
}

/**
 * Save signup data to sessionStorage
 */
function saveSignupData(state: SignupFlowState): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.isAccountCreated) {
      sessionStorage.setItem(COMPLETION_FLAG_KEY, 'true');
    }
  } catch (error) {
    console.error('Error saving signup data:', error);
  }
}

/**
 * Clear signup data from sessionStorage
 */
function clearSignupData(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(COMPLETION_FLAG_KEY);
  } catch (error) {
    console.error('Error clearing signup data:', error);
  }
}

export function useSignupFlow() {
  const [state, setState] = useState<SignupFlowState>({
    data: {},
    currentStep: 1,
    completedSteps: [],
    isAccountCreated: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const loadedState = loadSignupData();
    setState(loadedState);
    setIsInitialized(true);

    console.log('📋 Signup flow initialized:', {
      currentStep: loadedState.currentStep,
      completedSteps: loadedState.completedSteps,
      isAccountCreated: loadedState.isAccountCreated,
      dataKeys: Object.keys(loadedState.data),
    });
  }, []);

  /**
   * Update signup data for current step
   */
  const updateData = useCallback((stepData: Partial<SignupData>) => {
    setState(prev => {
      const updated = {
        ...prev,
        data: {
          ...prev.data,
          ...stepData,
        },
      };
      saveSignupData(updated);
      return updated;
    });

    console.log('💾 Signup data updated:', stepData);
  }, []);

  /**
   * Move to next step
   */
  const moveToStep = useCallback((stepNumber: number) => {
    setState(prev => {
      const updated = {
        ...prev,
        currentStep: stepNumber,
        completedSteps: Array.from(new Set([...prev.completedSteps, stepNumber - 1])),
      };
      saveSignupData(updated);
      return updated;
    });

    console.log(`➡️ Moved to step ${stepNumber}`);
  }, []);

  /**
   * Mark step as completed
   */
  const completeStep = useCallback((stepNumber: number) => {
    setState(prev => {
      const updated = {
        ...prev,
        completedSteps: Array.from(new Set([...prev.completedSteps, stepNumber])),
      };
      saveSignupData(updated);
      return updated;
    });

    // Also save to localStorage as backup for persistence across sessions
    if (typeof window !== 'undefined') {
      localStorage.setItem(`signup_step_${stepNumber}_completed`, 'true');
    }

    console.log(`✅ Step ${stepNumber} completed`);
  }, []);

  /**
   * Mark account as created
   */
  const markAccountCreated = useCallback(() => {
    setState(prev => {
      const updated = {
        ...prev,
        isAccountCreated: true,
      };
      saveSignupData(updated);
      return updated;
    });

    // Also save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('signup_account_created', 'true');
    }

    console.log('🎉 Account marked as created');
  }, []);

  /**
   * Get all collected data
   */
  const getAllData = useCallback(() => {
    return state.data;
  }, [state.data]);

  /**
   * Get data for specific step
   */
  const getStepData = useCallback((step: number) => {
    switch (step) {
      case 1:
        return {
          agreedToTerms: state.data.agreedToTerms,
          agreedToPrivacy: state.data.agreedToPrivacy,
          agreedToMarketing: state.data.agreedToMarketing,
        };
      case 2:
        return {
          niceToken: state.data.niceToken,
          verifiedName: state.data.verifiedName,
          verifiedPhone: state.data.verifiedPhone,
        };
      case 3:
        return {
          accountVerificationToken: state.data.accountVerificationToken,
          verifiedAccountNumber: state.data.verifiedAccountNumber,
        };
      case 4:
        return {
          address: state.data.address,
          detailAddress: state.data.detailAddress,
          buildingName: state.data.buildingName,
          postcode: state.data.postcode,
        };
      case 5:
        return {
          username: state.data.username,
          email: state.data.email,
          password: state.data.password,
        };
      default:
        return {};
    }
  }, [state.data]);

  /**
   * Reset all signup data
   */
  const reset = useCallback(() => {
    clearSignupData();
    setState({
      data: {},
      currentStep: 1,
      completedSteps: [],
      isAccountCreated: false,
    });

    console.log('🔄 Signup flow reset');
  }, []);

  return {
    ...state,
    isInitialized,
    updateData,
    moveToStep,
    completeStep,
    markAccountCreated,
    getAllData,
    getStepData,
    reset,
  };
}
