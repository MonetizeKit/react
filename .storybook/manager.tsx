import React, { useCallback } from "react";
import { addons, types, useGlobals } from "@storybook/manager-api";
import { create } from "@storybook/theming";
import { version } from "../package.json";

/**
 * The MonetizeKit brand badge (tilted MK per §01), inlined as a data-URI so the manager chrome is
 * on-brand without a runtime asset dependency. Vector letterforms render identically in an `<img>`.
 * Sourced from `@monetizekit/brand`; swap to the package asset once its corrected build publishes.
 */
const MK_BADGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560" width="560" height="560" role="img" aria-label="MonetizeKit"><g transform="rotate(-12 280 280)"><rect x="72" y="72" width="440" height="440" fill="#1A1A1A"/><rect x="48" y="48" width="440" height="440" fill="#ED7445" stroke="#1A1A1A" stroke-width="18"/><g fill="#1A1A1A" transform="translate(139.897 321.571) scale(0.147)"><path d="M246.094 0L46.875 0L46.875-727.539L358.398-727.539L423.828-500Q432.129-470.703 442.871-422.363Q453.613-374.023 464.111-318.604Q474.609-263.184 483.398-212.158Q492.188-161.133 497.070-125.977L497.070-125.977L460.449-125.977Q465.332-161.133 473.877-212.158Q482.422-263.184 492.920-318.604Q503.418-374.023 513.916-422.363Q524.414-470.703 532.715-500L532.715-500L597.168-727.539L909.180-727.539L909.180 0L709.961 0L709.961-281.250Q709.961-306.152 711.182-347.412Q712.402-388.672 713.867-437.988Q715.332-487.305 716.553-537.109Q717.773-586.914 717.773-628.906L717.773-628.906L729.004-628.906Q720.215-582.520 708.984-532.471Q697.754-482.422 686.035-434.814Q674.316-387.207 663.574-347.412Q652.832-307.617 645.020-281.250L645.020-281.250L560.547 0L396.484 0L310.547-281.250Q302.734-307.617 291.748-347.412Q280.762-387.207 268.555-434.814Q256.348-482.422 244.873-532.471Q233.398-582.520 224.121-628.906L224.121-628.906L238.281-628.906Q238.281-586.914 239.502-537.109Q240.723-487.305 242.188-437.988Q243.652-388.672 244.873-347.412Q246.094-306.152 246.094-281.250L246.094-281.250L246.094 0ZM1356.445-360.840L1152.832-127.441L1152.832-294.434Q1172.852-340.332 1191.895-377.197Q1210.938-414.063 1236.572-452.148Q1262.207-490.234 1300.781-540.527L1300.781-540.527L1445.313-727.539L1679.199-727.539L1375-353.027L1356.445-360.840ZM1200.195 0L1002.930 0L1002.930-727.539L1200.195-727.539L1200.195-571.289L1196.289-361.816L1200.195-265.625L1200.195 0ZM1692.871 0L1460.449 0L1285.156-292.480L1410.156-437.012L1692.871 0Z"/></g></g></svg>`;
const MK_BADGE_URI = `data:image/svg+xml,${encodeURIComponent(MK_BADGE)}`;

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
    brandImage: MK_BADGE_URI,
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
