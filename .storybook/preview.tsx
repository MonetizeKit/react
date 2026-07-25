import type { Preview } from "@storybook/react";
import { MonetizeKitProvider } from "../src/provider";
import {
  resolveTokens,
  tokensToStyle,
  THEME_NAMES,
  PALETTE_NAMES,
  type ThemeName,
  type ThemeMode,
  type PaletteName,
} from "../src/theme/tokens";

const storybookEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env ?? {};

export const STORYBOOK_MONETIZEKIT_BASE_URL =
  storybookEnv.STORYBOOK_MONETIZEKIT_BASE_URL || "https://app.monetizekit.app";

export const STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY =
  storybookEnv.STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY || "pk_demo";

/**
 * Global toolbar controls let you switch theme, locale, and currency for the
 * whole gallery — so each component has a single story rather than one per
 * permutation. The decorator wraps every story in a MonetizeKitProvider
 * configured from those globals.
 */
const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: "fullscreen",
  },
  globalTypes: {
    theme: {
      description: "Brand theme",
      defaultValue: "brand",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: THEME_NAMES.map((t) => ({ value: t, title: t })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Color mode",
      defaultValue: "light",
      toolbar: {
        title: "Mode",
        icon: "contrast",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
    palette: {
      description: "Semantic palette (brand theme only)",
      defaultValue: "default",
      toolbar: {
        title: "Palette",
        icon: "swatchbook",
        items: PALETTE_NAMES.map((p) => ({ value: p, title: p })),
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Locale (i18n)",
      defaultValue: "en-US",
      toolbar: {
        title: "Locale",
        icon: "globe",
        items: ["en-US", "es-ES", "fr-FR", "de-DE", "ja-JP"],
        dynamicTitle: true,
      },
    },
    currency: {
      description: "Currency",
      defaultValue: "USD",
      toolbar: {
        title: "Currency",
        icon: "circlehollow",
        items: ["USD", "EUR", "GBP", "JPY"],
        dynamicTitle: true,
      },
    },
    publishableKey: {
      description: "MonetizeKit publishable key for live Storybook stories",
      defaultValue: STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY,
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as ThemeName) ?? "brand";
      const mode = (context.globals.mode as ThemeMode) ?? "light";
      const palette = (context.globals.palette as PaletteName) ?? "default";
      const locale = (context.globals.locale as string) ?? "en-US";
      const currency = (context.globals.currency as string) ?? "USD";
      const publishableKey =
        (context.globals.publishableKey as string | undefined) ??
        STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY;
      // The palette axis only applies to the brand theme; hand-tuned themes ignore it.
      const appearance = theme === "brand" ? { theme, mode, palette } : { theme, mode };
      const prefersDark =
        typeof window !== "undefined" && window.matchMedia
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : false;
      return (
        <MonetizeKitProvider
          publishableKey={publishableKey}
          baseUrl={STORYBOOK_MONETIZEKIT_BASE_URL}
          appearance={appearance}
          locale={locale}
          currency={currency}
        >
          <div
            style={{
              ...tokensToStyle(resolveTokens(appearance, prefersDark)),
              // Cream (token) ground with a subtle static dot-grid texture (§03); reduced-motion
              // safe because it never animates. The dot tint derives from the theme foreground so
              // it reads correctly on every theme/mode.
              backgroundColor: "var(--mk-bg)",
              backgroundImage:
                "radial-gradient(color-mix(in srgb, var(--mk-fg) 6%, transparent) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              color: "var(--mk-fg)",
              fontFamily: "var(--mk-font)",
              padding: "2rem",
              minHeight: "100vh",
            }}
          >
            <Story />
          </div>
        </MonetizeKitProvider>
      );
    },
  ],
};

export default preview;
