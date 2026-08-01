import { createContext, useContext, type ReactNode } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import type { MenuState } from "./menuStore";
import type { MenuModel } from "@engine/model/types";

interface MenuContextValue {
  store: StoreApi<MenuState>;
  model: MenuModel;
}

const MenuContext = createContext<MenuContextValue | null>(null);

/** Provides a menu store + model to the engine components below it. */
export function MenuProvider({
  store,
  model,
  children,
}: MenuContextValue & { children: ReactNode }) {
  return <MenuContext.Provider value={{ store, model }}>{children}</MenuContext.Provider>;
}

function useMenuContext(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menu components must be rendered inside a <MenuProvider>.");
  return ctx;
}

/** Subscribe to the menu store with a selector (like the zustand hook). */
export function useMenu<T>(selector: (s: MenuState) => T): T {
  return useStore(useMenuContext().store, selector);
}

/** The raw store, for imperative reads/writes (getState / actions) in handlers. */
export function useMenuStore(): StoreApi<MenuState> {
  return useMenuContext().store;
}

/** The menu model (categories, groups, palette) for this frontend. */
export function useMenuModel(): MenuModel {
  return useMenuContext().model;
}
