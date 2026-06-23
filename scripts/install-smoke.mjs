/**
 * Published-package install smoke test.
 *
 * Packs the built package exactly as it would be published, installs the
 * tarball into a clean throwaway project with npm (no workspace/pnpm linking),
 * then asserts an external consumer can:
 *   1. type-check real usage of the public API against the shipped .d.ts, and
 *   2. server-render <PricingTable/> (inside <MonetizeKitProvider/>) at runtime.
 *
 * Run after `pnpm build`. Mirrors what a customer gets from `npm install
 * @monetizekit/react`, catching packaging regressions (missing dist files,
 * broken types, bad exports) that unit tests can't.
 */
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, cwd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

const CONSUME_TSX = `import {
  MonetizeKitProvider,
  PricingTable,
  Paywall,
  UsageBanner,
  CustomerPortal,
  EntitlementGate,
  useEntitlement,
  useUsage,
  useCredits,
  THEME_PRESETS,
  resolveTokens,
  tokensToStyle,
  MonetizeKitClient,
  type Plan,
} from "@monetizekit/react";

const plans: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    description: "Scale up",
    entitlements: [
      { featureKey: "advanced_analytics", featureDisplayName: "Advanced analytics", type: "boolean", value: true },
    ],
    pricing: [{ type: "flat", amount: 49900, currency: "USD", interval: "monthly" }],
  },
];

export function Demo() {
  return (
    <MonetizeKitProvider
      publishableKey="pk_test"
      baseUrl="https://app.monetizekit.app"
      customerId="cust_1"
      appearance="memphis"
    >
      <PricingTable plans={plans} highlightPlan="Pro" locale="en-US" />
      <Paywall feature="advanced_analytics">
        <div>secret</div>
      </Paywall>
      <UsageBanner meterId="api_calls" warnAt={0.8} />
      <CustomerPortal planName="Pro" meterIds={["api_calls"]} />
      <EntitlementGate feature="advanced_analytics" fallback={<div>locked</div>}>
        <div>ok</div>
      </EntitlementGate>
    </MonetizeKitProvider>
  );
}

// Reference the remaining public API so unused-symbol checks exercise it.
void resolveTokens("dashboard");
void tokensToStyle(THEME_PRESETS.memphis);
void [useEntitlement, useUsage, useCredits, MonetizeKitClient];
`;

const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      jsx: "react-jsx",
      module: "esnext",
      moduleResolution: "bundler",
      target: "es2020",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
    },
    include: ["consume.tsx"],
  },
  null,
  2,
);

const RENDER_MJS = `import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MonetizeKitProvider, PricingTable } from "@monetizekit/react";

const plans = [
  { id: "pro", name: "Pro", description: "Scale up", pricing: [{ type: "flat", amount: 49900, currency: "USD", interval: "monthly" }], entitlements: [] },
];

const html = renderToStaticMarkup(
  React.createElement(
    MonetizeKitProvider,
    { publishableKey: "pk_test", baseUrl: "https://app.monetizekit.app", appearance: "memphis" },
    React.createElement(PricingTable, { plans, highlightPlan: "Pro" }),
  ),
);

if (!html.includes("Pro")) {
  console.error("render check failed: plan name 'Pro' not found in output");
  console.error(html);
  process.exit(1);
}
if (!html.includes('data-mk-component="pricing-table"')) {
  console.error("render check failed: pricing-table marker missing");
  process.exit(1);
}
console.log("runtime render check passed");
`;

const packDir = mkdtempSync(join(tmpdir(), "mk-pack-"));
const projDir = mkdtempSync(join(tmpdir(), "mk-smoke-"));

try {
  run(`npm pack --pack-destination "${packDir}"`, root);
  const tarball = readdirSync(packDir).find((f) => f.endsWith(".tgz"));
  if (!tarball) throw new Error("npm pack produced no tarball");
  const tarballPath = join(packDir, tarball);

  writeFileSync(
    join(projDir, "package.json"),
    JSON.stringify({ name: "mk-install-smoke", private: true, version: "0.0.0", type: "module" }, null, 2),
  );

  run(
    `npm install --no-audit --no-fund "${tarballPath}" react@19 react-dom@19 typescript@5 @types/react@19 @types/react-dom@19`,
    projDir,
  );

  writeFileSync(join(projDir, "consume.tsx"), CONSUME_TSX);
  writeFileSync(join(projDir, "tsconfig.json"), TSCONFIG);
  run(`npx --no-install tsc --noEmit`, projDir);

  writeFileSync(join(projDir, "render.mjs"), RENDER_MJS);
  run(`node render.mjs`, projDir);

  console.log("\n✅ install smoke passed: package installs, types check, PricingTable renders.");
} finally {
  rmSync(packDir, { recursive: true, force: true });
  rmSync(projDir, { recursive: true, force: true });
}
