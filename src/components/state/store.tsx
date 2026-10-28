"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { ColourwayId, Size } from "@/lib/data/types";

export interface CartItem {
  key: string;
  teeId: string;
  colourway: ColourwayId;
  size: Size;
  years: number;
}

export interface Settings {
  sound: boolean;
  needle: boolean;
  lights: "on" | "out";
}

interface State {
  settings: Settings;
  cart: CartItem[];
  hydrated: boolean;
}

type Action =
  | { type: "hydrate"; state: Partial<State> }
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "cart:add"; item: CartItem }
  | { type: "cart:remove"; key: string }
  | { type: "cart:clear" };

const initial: State = {
  settings: { sound: false, needle: false, lights: "on" },
  cart: [],
  hydrated: false,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "hydrate":
      return { ...s, ...a.state, hydrated: true };
    case "settings":
      return { ...s, settings: { ...s.settings, ...a.patch } };
    case "cart:add":
      if (s.cart.some((c) => c.key === a.item.key)) return s;
      return { ...s, cart: [...s.cart, a.item] };
    case "cart:remove":
      return { ...s, cart: s.cart.filter((c) => c.key !== a.key) };
    case "cart:clear":
      return { ...s, cart: [] };
  }
}

interface Ctx extends State {
  setSettings: (patch: Partial<Settings>) => void;
  addToTable: (item: CartItem) => void;
  removeFromTable: (key: string) => void;
  clearTable: () => void;
}

const NomadCtx = createContext<Ctx | null>(null);

const KEY = "nomad:v1";

export function NomadProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const first = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        dispatch({ type: "hydrate", state: { cart: parsed.cart ?? [], settings: { ...initial.settings, ...(parsed.settings ?? {}), lights: "on" } } });
        return;
      }
    } catch {}
    dispatch({ type: "hydrate", state: {} });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ cart: state.cart, settings: state.settings }));
    } catch {}
  }, [state.cart, state.settings, state.hydrated]);

  useEffect(() => {
    document.body.dataset.lights = state.settings.lights;
    document.documentElement.style.setProperty("--pinhole", state.settings.lights === "out" ? "#0b0b0d" : "#f1f0ec");
  }, [state.settings.lights]);

  const setSettings = useCallback((patch: Partial<Settings>) => dispatch({ type: "settings", patch }), []);
  const addToTable = useCallback((item: CartItem) => dispatch({ type: "cart:add", item }), []);
  const removeFromTable = useCallback((key: string) => dispatch({ type: "cart:remove", key }), []);
  const clearTable = useCallback(() => dispatch({ type: "cart:clear" }), []);

  const value = useMemo<Ctx>(
    () => ({ ...state, setSettings, addToTable, removeFromTable, clearTable }),
    [state, setSettings, addToTable, removeFromTable, clearTable],
  );

  return <NomadCtx.Provider value={value}>{children}</NomadCtx.Provider>;
}

export function useNomad() {
  const ctx = useContext(NomadCtx);
  if (!ctx) throw new Error("useNomad outside NomadProvider");
  return ctx;
}
