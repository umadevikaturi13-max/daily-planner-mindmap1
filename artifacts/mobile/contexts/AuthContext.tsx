import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type User = { email: string; name: string };

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "auth.user";
const ACCOUNTS_KEY = "auth.accounts";

type StoredAccount = { name: string; email: string; password: string };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(USER_KEY);
        if (raw) setUser(JSON.parse(raw));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persistUser = useCallback(async (next: User | null) => {
    setUser(next);
    if (next) await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const getAccounts = async (): Promise<StoredAccount[]> => {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const e = email.trim().toLowerCase();
      if (!name.trim() || !e || !password) throw new Error("All fields required");
      const accounts = await getAccounts();
      if (accounts.find((a) => a.email === e))
        throw new Error("Account already exists");
      const next = [...accounts, { name: name.trim(), email: e, password }];
      await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
      await persistUser({ name: name.trim(), email: e });
    },
    [persistUser],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const e = email.trim().toLowerCase();
      const accounts = await getAccounts();
      const match = accounts.find((a) => a.email === e && a.password === password);
      if (!match) throw new Error("Invalid email or password");
      await persistUser({ name: match.name, email: match.email });
    },
    [persistUser],
  );

  const signOut = useCallback(async () => {
    await persistUser(null);
  }, [persistUser]);

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
