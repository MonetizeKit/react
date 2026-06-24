import type { Preview } from "@storybook/react";
import { MonetizeKitProvider } from "../src/provider";
import {
  resolveTokens,
  tokensToStyle,
  THEME_PRESET_NAMES,
  type ThemePresetName,
} from "../src/theme/tokens";

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
      description: "Theme preset",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: THEME_PRESET_NAMES.map((t) => ({ value: t, title: t })),
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
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as ThemePresetName) ?? "light";
      const locale = (context.globals.locale as string) ?? "en-US";
      const currency = (context.globals.currency as string) ?? "USD";
      return (
        <MonetizeKitProvider
          publishableKey="pk_demo"
          baseUrl="https://app.monetizekit.app"
          appearance={theme}
          locale={locale}
          currency={currency}
        >
          <div
            style={{
              ...tokensToStyle(resolveTokens(theme)),
              background: "var(--mk-bg)",
              color: "var(--mk-fg)",
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
