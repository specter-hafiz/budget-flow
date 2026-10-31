import { Budget } from "@/features/budgets/types/budget.type";
import { mergeBackupData } from "@/features/settings/services/mergeBackupService";
import { TransactionCategory } from "@/features/transactions/constants/categories";
import { Transaction } from "@/features/transactions/types/transaction.type";
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
  type Dispatch,
  type PropsWithChildren,
} from "react";
import { storage } from "../storage/mmkv";
import { persistAppState } from "../storage/persistAppState";

type UserProfile = {
  name: string;
  photoUri: string | null;
};

export type AppState = {
  profile: UserProfile | null;
  onboardingComplete: boolean;
  transactions: Transaction[];
  budgets: Budget[];
  settings: UserSettings;
  customCategories: TransactionCategory[];
};

type UserSettings = {
  language: string;
  currency: string;
};

type AppAction =
  | {
      type: "COMPLETE_ONBOARDING";
      payload: UserProfile;
    }
  | {
      type: "UPDATE_PROFILE";
      payload: Partial<UserProfile>;
    }
  | {
      type: "LOGOUT";
    }
  | {
      type: "RESET_ONBOARDING";
    }
  | {
      type: "ADD_TRANSACTION";
      payload: Transaction;
    }
  | {
      type: "UPDATE_TRANSACTION";
      payload: Transaction;
    }
  | {
      type: "DELETE_TRANSACTION";
      payload: string;
    }
  | {
      type: "ADD_BUDGET";
      payload: Budget;
    }
  | {
      type: "UPDATE_BUDGET";
      payload: Budget;
    }
  | {
      type: "DELETE_BUDGET";
      payload: string;
    }
  | {
      type: "UPDATE_SETTINGS";
      payload: Partial<UserSettings>;
    }
  | {
      type: "ADD_CUSTOM_CATEGORY";
      payload: TransactionCategory;
    }
  | {
      type: "UPDATE_CUSTOM_CATEGORY";
      payload: TransactionCategory;
    }
  | {
      type: "DELETE_CUSTOM_CATEGORY";
      payload: string;
    }
  | { type: "APPLY_VERIFIED_STATE"; payload: AppState };

const STORAGE_KEY = "budgetflow-app-state";

function loadInitialState(): AppState {
  try {
    const savedState = storage.getString(STORAGE_KEY);
    if (!savedState) {
      return initialState;
    }

    const parsed: unknown = JSON.parse(savedState);
    if (typeof parsed !== "object" || parsed === null) {
      return initialState;
    }

    const saved = parsed as Partial<AppState>;

    return {
      profile: saved.profile ?? null,
      onboardingComplete: saved.onboardingComplete === true,
      transactions: Array.isArray(saved.transactions) ? saved.transactions : [],
      budgets: Array.isArray(saved.budgets) ? saved.budgets : [],
      settings: {
        language:
          typeof saved.settings?.language === "string"
            ? saved.settings.language
            : "en",
        currency:
          typeof saved.settings?.currency === "string"
            ? saved.settings.currency
            : "GHS",
      },
      customCategories: Array.isArray(saved.customCategories)
        ? saved.customCategories
        : [],
    };
  } catch (e) {
    console.error("Failed to load BudgetFlow state:", e);
    return initialState;
  }
}
const initialState: AppState = {
  profile: null,
  onboardingComplete: false,
  transactions: [],
  budgets: [],
  settings: {
    language: "en",
    currency: "GHS",
  },
  customCategories: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "COMPLETE_ONBOARDING":
      return {
        ...state,
        profile: action.payload,
        onboardingComplete: true,
      };

    case "UPDATE_PROFILE":
      if (!state.profile) return state;

      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
      };

    case "RESET_ONBOARDING":
      return initialState;

    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };

    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case "ADD_BUDGET":
      return {
        ...state,
        budgets: [
          ...state.budgets.filter(
            (budget) =>
              !(
                budget.categoryId === action.payload.categoryId &&
                budget.month === action.payload.month
              ),
          ),
          action.payload,
        ],
      };

    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.payload.id ? action.payload : budget,
        ),
      };

    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((budget) => budget.id !== action.payload),
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case "ADD_CUSTOM_CATEGORY":
      return {
        ...state,
        customCategories: [...state.customCategories, action.payload],
      };

    case "UPDATE_CUSTOM_CATEGORY":
      return {
        ...state,
        customCategories: state.customCategories.map((category) =>
          category.id === action.payload.id ? action.payload : category,
        ),
      };

    case "DELETE_CUSTOM_CATEGORY":
      return {
        ...state,
        customCategories: state.customCategories.filter(
          (category) => category.id !== action.payload,
        ),
      };
    case "LOGOUT":
      return {
        ...state,
        profile: null,
        onboardingComplete: false,
      };
    case "APPLY_VERIFIED_STATE":
      return action.payload;
    default:
      return state;
  }
}

type AppStateContextValue = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  applyBackup: (backupState: AppState, mode: "merge" | "replace") => void;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined,
);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, reducerDispatch] = useReducer(
    appReducer,
    undefined,
    loadInitialState,
  );

  const stateRef = useRef(state);

  const dispatch = useCallback(
    (action: AppAction): void => {
      const nextState = appReducer(stateRef.current, action);

      // Persist and verify before updating React state.
      persistAppState(nextState);

      // Update the reference only after persistence succeeds.
      stateRef.current = nextState;

      // Commit the exact state that was persisted.
      reducerDispatch({
        type: "APPLY_VERIFIED_STATE",
        payload: nextState,
      });
    },
    [reducerDispatch],
  );

  const applyBackup = useCallback(
    (backupState: AppState, mode: "merge" | "replace"): void => {
      const nextState =
        mode === "merge"
          ? mergeBackupData(stateRef.current, backupState)
          : backupState;

      dispatch({
        type: "APPLY_VERIFIED_STATE",
        payload: nextState,
      });
    },
    [dispatch],
  );

  return (
    <AppStateContext.Provider value={{ state, dispatch, applyBackup }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
function reducerDispatch(action: AppAction) {
  throw new Error("Function not implemented.");
}
