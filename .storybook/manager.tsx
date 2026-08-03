import React, { useCallback } from "react";
import { addons, types, useGlobals } from "@storybook/manager-api";
import { create } from "@storybook/theming";
import { version } from "../package.json";

const ADDON_ID = "monetizekit/publishable-key";
const TOOL_ID = `${ADDON_ID}/tool`;
const GLOBAL_KEY = "publishableKey";

function PublishableKeyTool() {
  const [globals, updateGlobals] = useGlobals();
  const value = String(globals[GLOBAL_KEY] ?? "");
  const updateValue = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateGlobals({ [GLOBAL_KEY]: event.target.value });
    },
    [updateGlobals],
  );

  return (
    <label
      title="MonetizeKit publishable key"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "0 8px",
        fontSize: 12,
      }}
    >
      <span>Key</span>
      <input
        aria-label="MonetizeKit publishable key"
        value={value}
        onChange={updateValue}
        placeholder="pk_live_..."
        style={{
          width: 180,
          border: "1px solid rgba(0,0,0,.2)",
          borderRadius: 4,
          padding: "3px 6px",
          font: "inherit",
        }}
      />
    </label>
  );
}

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: `MonetizeKit SDK v${version}`,
    brandUrl: "https://ui.monetizekit.app",
    brandImage: "/brand/logo/mk-badge-tilted.svg",
    brandTarget: "_self",
    // Brand type + palette (values from @monetizekit/design-tokens; §type/§color).
    fontBase: '"Inter", system-ui, -apple-system, sans-serif',
    fontCode: '"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace',
    colorPrimary: "#FF6B35",
    colorSecondary: "#4F46E5",
    appBg: "#FFFEF3",
    appContentBg: "#FFFFFF",
    appPreviewBg: "#FFFEF3",
    appBorderColor: "#1A1A1A",
    appBorderRadius: 8,
    textColor: "#1A1A1A",
    textInverseColor: "#FFFEF3",
    barTextColor: "#5C5C55",
    barSelectedColor: "#FF6B35",
    barHoverColor: "#FF6B35",
    barBg: "#FFFEF3",
    inputBg: "#FFFFFF",
    inputBorder: "#1A1A1A",
    inputTextColor: "#1A1A1A",
    inputBorderRadius: 6,
  }),
});

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    title: "MonetizeKit publishable key",
    type: types.TOOL,
    match: ({ viewMode }) => Boolean(viewMode),
    render: PublishableKeyTool,
  });
});
