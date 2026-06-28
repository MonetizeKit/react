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
    brandTitle: `MonetizeKit UI v${version}`,
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
