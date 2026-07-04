import type { AssetType } from "../asset-data";

export function TypeIcon({ type, size = "md" }: { type: AssetType; size?: "md" | "lg" }) {
  const iconSize = size === "lg" ? 30 : 24;

  return (
    <span className={`asset-type-icon asset-type-icon-${size}`} style={{ backgroundColor: type.color }}>
      <type.Icon size={iconSize} stroke={1.9} />
    </span>
  );
}
