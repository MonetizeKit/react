import { formatUnits } from "./format";
import type { Plan } from "../types";

const UNLIMITED_THRESHOLD = 9999;

export interface FeatureRow {
  key: string;
  label: string;
}

/**
 * Derive a clean "what's included" list from a plan's entitlements: include
 * boolean entitlements only when granted, render limits/values inline, and skip
 * features the plan does not have so cards never advertise absent capabilities.
 */
export function includedFeatures(plan: Plan, locale: string | undefined, max: number): FeatureRow[] {
  const rows: FeatureRow[] = [];
  for (const ent of plan.entitlements ?? []) {
    if (ent.type === "boolean") {
      if (ent.value === true) rows.push({ key: ent.featureKey, label: ent.featureDisplayName });
    } else if (ent.type === "limit") {
      const n = Number(ent.value);
      rows.push({
        key: ent.featureKey,
        label: `${ent.featureDisplayName}: ${n >= UNLIMITED_THRESHOLD ? "Unlimited" : formatUnits(n, locale)}`,
      });
    } else {
      rows.push({ key: ent.featureKey, label: `${ent.featureDisplayName}: ${String(ent.value)}` });
    }
    if (rows.length >= max) break;
  }
  return rows;
}
