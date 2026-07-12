import {
  IconBrandApple,
  IconBrandBilibili,
  IconBrandDropbox,
  IconBrandGoogle,
  IconBrandNetflix,
  IconBrandNotion,
  IconBrandOpenai,
  IconBrandSpotify,
  IconBrandWindows,
  IconBrandYoutube,
  IconCloud,
  IconMusic,
  IconSparkles,
  IconVideo,
  type Icon,
} from "@tabler/icons-react";
import type { Subscription, SubscriptionCategory } from "../subscription-data";
import { getSubscriptionMark, subscriptionPresetsByKey } from "../subscription-data";

const providerIcons: Record<string, Icon> = {
  chatgpt: IconBrandOpenai,
  gemini: IconBrandGoogle,
  "google-one": IconBrandGoogle,
  icloud: IconBrandApple,
  onedrive: IconBrandWindows,
  dropbox: IconBrandDropbox,
  bilibili: IconBrandBilibili,
  netflix: IconBrandNetflix,
  "youtube-premium": IconBrandYoutube,
  "apple-music": IconBrandApple,
  spotify: IconBrandSpotify,
  "microsoft-365": IconBrandWindows,
  notion: IconBrandNotion,
};

const categoryIcons: Partial<Record<SubscriptionCategory, Icon>> = {
  ai: IconSparkles,
  video: IconVideo,
  music: IconMusic,
  storage: IconCloud,
};

export function SubscriptionMark({
  subscription,
  size = "md",
}: {
  subscription: Pick<Subscription, "providerKey" | "name"> & Partial<Pick<Subscription, "category">>;
  size?: "sm" | "md" | "lg";
}) {
  const mark = getSubscriptionMark(subscription);
  const category = subscription.category ??
    (subscription.providerKey ? subscriptionPresetsByKey[subscription.providerKey]?.category : undefined);
  const MarkIcon = subscription.providerKey
    ? providerIcons[subscription.providerKey] ?? (category ? categoryIcons[category] : undefined)
    : undefined;
  return (
    <span
      className={`subscription-mark subscription-mark-${size}`}
      style={{ backgroundColor: mark.color }}
      aria-hidden="true"
    >
      {MarkIcon ? <MarkIcon className="subscription-mark-icon" /> : mark.initials}
    </span>
  );
}
