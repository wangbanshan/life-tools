export type SubscriptionCategory = "ai" | "video" | "music" | "storage" | "productivity" | "other";

export type BillingUnit = "day" | "month" | "year";

export type SubscriptionStatus = "active" | "archived";

export type Subscription = {
  id: string;
  providerKey: string | null;
  name: string;
  category: SubscriptionCategory;
  planName: string;
  note: string;
  amount: number;
  currency: string;
  billingIntervalCount: number;
  billingIntervalUnit: BillingUnit;
  trackingStartedOn: string;
  renewalAnchorOn: string;
  reminderOffsets: number[];
  status: SubscriptionStatus;
  archivedOn: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionPreset = {
  key: string;
  name: string;
  category: SubscriptionCategory;
  initials: string;
  color: string;
};

export const subscriptionCategories: Array<{ value: SubscriptionCategory; label: string }> = [
  { value: "ai", label: "AI 工具" },
  { value: "video", label: "视频" },
  { value: "music", label: "音乐" },
  { value: "storage", label: "云存储" },
  { value: "productivity", label: "效率工具" },
  { value: "other", label: "其他" },
];

export const subscriptionPresets: SubscriptionPreset[] = [
  { key: "chatgpt", name: "ChatGPT", category: "ai", initials: "GPT", color: "#397b68" },
  { key: "claude", name: "Claude", category: "ai", initials: "CL", color: "#b66f47" },
  { key: "gemini", name: "Gemini", category: "ai", initials: "GE", color: "#5578c7" },
  { key: "google-one", name: "Google One", category: "storage", initials: "G1", color: "#4285f4" },
  { key: "icloud", name: "iCloud+", category: "storage", initials: "IC", color: "#5598d5" },
  { key: "onedrive", name: "OneDrive", category: "storage", initials: "OD", color: "#2878b8" },
  { key: "dropbox", name: "Dropbox", category: "storage", initials: "DB", color: "#176bea" },
  { key: "tencent-video", name: "腾讯视频", category: "video", initials: "腾", color: "#ff8a22" },
  { key: "iqiyi", name: "爱奇艺", category: "video", initials: "爱", color: "#38a936" },
  { key: "youku", name: "优酷", category: "video", initials: "优", color: "#366ee8" },
  { key: "bilibili", name: "哔哩哔哩", category: "video", initials: "B", color: "#e86f98" },
  { key: "netflix", name: "Netflix", category: "video", initials: "N", color: "#c72d31" },
  { key: "youtube-premium", name: "YouTube Premium", category: "video", initials: "YT", color: "#e33d32" },
  { key: "netease-music", name: "网易云音乐", category: "music", initials: "云", color: "#d7443e" },
  { key: "qq-music", name: "QQ 音乐", category: "music", initials: "Q", color: "#31a96f" },
  { key: "apple-music", name: "Apple Music", category: "music", initials: "AM", color: "#dd536c" },
  { key: "spotify", name: "Spotify", category: "music", initials: "SP", color: "#2e9c56" },
  { key: "microsoft-365", name: "Microsoft 365", category: "productivity", initials: "M", color: "#cf5f38" },
  { key: "notion", name: "Notion", category: "productivity", initials: "NO", color: "#4a4642" },
];

export const subscriptionPresetsByKey = subscriptionPresets.reduce<Record<string, SubscriptionPreset>>(
  (catalog, preset) => {
    catalog[preset.key] = preset;
    return catalog;
  },
  {},
);

export const supportedCurrencies = ["CNY", "USD", "HKD", "EUR", "JPY", "GBP", "SGD", "KRW"] as const;

export function getSubscriptionMark(subscription: Pick<Subscription, "providerKey" | "name">) {
  const preset = subscription.providerKey ? subscriptionPresetsByKey[subscription.providerKey] : null;
  const fallbackInitials = subscription.name.trim().slice(0, 2).toUpperCase() || "订";
  return {
    initials: preset?.initials ?? fallbackInitials,
    color: preset?.color ?? "#8b765f",
  };
}
