export interface CalculatorState {
  vehicleType: string;
  vehicleMiles: number;
  flightsShort: number;
  flightsLong: number;
  electricBill: number;
  gasBill: number;
  cleanEnergyShare: number;
  dietType: string;
  localFoodShare: number;
  wasteBags: number;
  recyclingRate: number;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
}

export interface Quest {
  id: string;
  name: string;
  desc: string;
  target: number;
  current: number;
  unit: string;
  rewardBadge: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export interface User {
  name: string;
  email: string;
  uid?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  signInWithGoogle: () => Promise<boolean>;
}

export interface AppStateContextType {
  calculator: CalculatorState;
  dailyLogs: Record<string, string[]>;
  totalSavings: number;
  streak: number;
  lastLoggedDate: string | null;
  hasCompletedCalc: boolean;
  unlockedBadges: Record<string, string>;
  toasts: ToastMessage[];
  badges: Badge[];
  quests: Quest[];
  updateCalculator: (updates: Partial<CalculatorState>) => void;
  saveCalculatorResults: () => void;
  submitDailyLog: (actionIds: string[]) => void;
  triggerToast: (title: string, desc: string, icon: string) => void;
  dismissToast: (id: string) => void;
  calculateBreakdown: () => {
    transport: number;
    energy: number;
    diet: number;
    waste: number;
    total: number;
  };
}
