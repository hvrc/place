import { useMemo } from "react";
import { createMenuStore } from "@engine/state/menuStore";
import { MenuProvider } from "@engine/state/MenuContext";
import { MenuShell } from "@engine/components/MenuShell";
import { buildPspModel } from "./buildPspModel";
import { pspWordmark } from "./pspTheme";

/**
 * The PSP frontend: builds the menu model from portfolio content, creates a
 * store for it, and renders the reusable menu shell with PSP styling.
 */
export default function PspMenu() {
  const model = useMemo(() => buildPspModel(), []);
  const store = useMemo(() => createMenuStore(model), [model]);

  return (
    <MenuProvider store={store} model={model}>
      <MenuShell wordmark={pspWordmark} />
    </MenuProvider>
  );
}
