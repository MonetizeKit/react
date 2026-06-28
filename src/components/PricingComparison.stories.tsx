import type { Meta, StoryObj } from "@storybook/react";
import { MonetizeKitProvider } from "../provider";
import { usePlans } from "../hooks";
import { PricingComparison, type ComparisonFeatureGroup } from "./PricingComparison";

const storybookEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env ?? {};

const storybookBaseUrl =
  storybookEnv.STORYBOOK_MONETIZEKIT_BASE_URL || "https://app.monetizekit.app";
const storybookPublishableKey =
  storybookEnv.STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY || "pk_demo";

// Theme / locale / currency come from the toolbar globals + provider decorator.
const meta: Meta<typeof PricingComparison> = {
  title: "Components/PricingComparison",
  component: PricingComparison,
  args: { highlightPlan: "Growth" },
};
export default meta;

type Story = StoryObj<typeof PricingComparison>;

/** Empty plans → illustrative sample comparison behind a disclaimer. */
export const Default: Story = { args: { plans: [] } };

function LiveTemplateComparison({ templateKey }: { templateKey: string }) {
  const { plans, groups, loading, error, locale } = usePlans({ template: templateKey });
  if (loading) return <p aria-busy="true">Loading template comparison...</p>;
  if (error) return <p role="alert">Unable to load template comparison.</p>;

  const comparisonGroups: ComparisonFeatureGroup[] | undefined = groups?.map((group) => ({
    title: group.label,
    features: group.features.map((feature) => ({
      key: feature.featureKey,
      label: feature.label ?? feature.featureKey,
    })),
  }));

  return (
    <PricingComparison
      plans={plans}
      groups={comparisonGroups}
      locale={locale}
      sampleWhenEmpty={false}
    />
  );
}

export const LiveTemplate: StoryObj<{
  publishableKey?: string;
  baseUrl?: string;
  templateKey?: string;
}> = {
  args: { publishableKey: "", baseUrl: "", templateKey: "homepage" },
  render: (args, context) => {
    const publishableKey =
      args.publishableKey ||
      (context.globals.publishableKey as string | undefined) ||
      storybookPublishableKey;
    const baseUrl = args.baseUrl || storybookBaseUrl;
    const templateKey = args.templateKey || "homepage";
    const hasLiveKey = Boolean(publishableKey && publishableKey !== "pk_demo");

    return hasLiveKey ? (
      <MonetizeKitProvider
        publishableKey={publishableKey}
        baseUrl={baseUrl}
        locale={(context.globals.locale as string | undefined) ?? "en-US"}
      >
        <LiveTemplateComparison templateKey={templateKey} />
      </MonetizeKitProvider>
    ) : (
      <p data-testid="comparison-template-needs-args">
        Provide a publishable key via the toolbar, story args, or
        STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY to render a live template comparison.
      </p>
    );
  },
};
