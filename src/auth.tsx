import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { getInternalAuthEmail, isSupabaseConfigured, supabase } from "./supabaseClient";

export type User = {
  id: string;
  username: string;
  createdAt: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type RegisterInput = LoginInput;

type AuthContextValue = {
  currentUser: User | null;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const usernamePattern = /^[a-z0-9_]{3,24}$/;

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function assertSupabase() {
  if (!supabase) {
    throw new Error("Supabase 尚未配置");
  }

  return supabase;
}

function assertUsername(username: string) {
  const normalizedUsername = normalizeUsername(username);

  if (!usernamePattern.test(normalizedUsername)) {
    throw new Error("用户名只能包含小写字母、数字、下划线，长度 3-24 位");
  }

  return normalizedUsername;
}

function toPublicUser(authUser: {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: { username?: unknown };
}): User {
  const metadataUsername =
    typeof authUser.user_metadata?.username === "string"
      ? authUser.user_metadata.username
      : "";
  const emailUsername = authUser.email?.split("@")[0] ?? "";
  const username = normalizeUsername(metadataUsername || emailUsername);

  return {
    id: authUser.id,
    username,
    createdAt: authUser.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setCurrentUser(data.session?.user ? toPublicUser(data.session.user) : null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ? toPublicUser(session.user) : null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isConfigured: isSupabaseConfigured,
      isLoading,
      login: async ({ username, password }) => {
        const client = assertSupabase();
        const normalizedUsername = assertUsername(username);
        const { data, error } = await client.auth.signInWithPassword({
          email: getInternalAuthEmail(normalizedUsername),
          password,
        });

        if (error) {
          throw new Error("用户名或密码不正确");
        }

        const user = toPublicUser(data.user);
        setCurrentUser(user);
        return user;
      },
      register: async ({ username, password }) => {
        const client = assertSupabase();
        const normalizedUsername = assertUsername(username);

        if (password.length < 6) {
          throw new Error("密码至少需要 6 位");
        }

        const { data, error } = await client.auth.signUp({
          email: getInternalAuthEmail(normalizedUsername),
          password,
          options: {
            data: {
              username: normalizedUsername,
            },
          },
        });

        if (error) {
          throw new Error(error.message.includes("registered") ? "这个用户名已经注册过了" : error.message);
        }

        if (!data.user) {
          throw new Error("注册失败，请稍后再试");
        }

        const user = toPublicUser(data.user);
        setCurrentUser(user);
        return user;
      },
      logout: () => {
        if (supabase) {
          void supabase.auth.signOut();
        }

        setCurrentUser(null);
      },
    };
  }, [currentUser, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return auth;
}
