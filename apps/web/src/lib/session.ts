import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "./types";

const memory = new Map<string, string>();
const safeStorage = {
  getItem: (key: string) =>
    typeof window === "undefined" ? (memory.get(key) ?? null) : localStorage.getItem(key),
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") memory.set(key, value);
    else localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") memory.delete(key);
    else localStorage.removeItem(key);
  },
};

type SessionState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: "zw_session_v1",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
      skipHydration: true,
    },
  ),
);
