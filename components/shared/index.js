/**
 * @file components/shared/index.js
 * Master barrel export for ALL shared components.
 *
 * Usage:
 *   import { EmptyState, StatusBadge, DataTable, KPICard } from "@/components/shared";
 *   import { FormInput, FormSelect } from "@/components/shared/form";
 *   import { KPICard, OfferCard } from "@/components/shared/cards";
 *   import { DataTable, StatusBadge } from "@/components/shared/data";
 *   import { EmptyState, LoadingSpinner } from "@/components/shared/feedback";
 *   import { ConfirmationModal } from "@/components/shared/modals";
 */

// ─── Cards ────────────────────────────────────────────────────────────────────
export * from "./cards";

// ─── Data Display ─────────────────────────────────────────────────────────────
export * from "./data";
export { default as EmblaCarouselControls } from "./EmblaCarouselControls";
// ─── Utilities / Misc ─────────────────────────────────────────────────────────
export { default as FormField } from "./FormField";
// ─── Feedback / State ─────────────────────────────────────────────────────────
export * from "./feedback";
// ─── Form Components (also importable from "@/components/shared/form") ────────
export * from "./form";
// ─── Modals / Overlays ────────────────────────────────────────────────────────
export * from "./modals";
export { default as ProfileStatusGate } from "./ProfileStatusGate";
export { default as QueryProvider } from "./QueryProvider";
export { default as SectionHeader } from "./SectionHeader";
export { default as TrafficSourcesDonutChart } from "./TrafficSourcesDonutChart";
