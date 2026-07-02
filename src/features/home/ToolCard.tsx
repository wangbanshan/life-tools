import { IconArrowRight } from "@tabler/icons-react";
import type { ToolItem } from "./tools";

type ToolCardProps = {
  tool: ToolItem;
  onClick: (tool: ToolItem) => void;
};

export function ToolCard({ tool, onClick }: ToolCardProps) {
  return (
    <button
      className={`tool-card tool-card-${tool.accent}`}
      type="button"
      onClick={() => onClick(tool)}
    >
      <span className="tool-card-topline" aria-hidden="true" />
      <span className="tool-card-head">
        <span className="tool-icon-box">
          <tool.Icon size={58} stroke={1.55} />
        </span>
      </span>
      <span className="tool-copy">
        <span className="tool-title">{tool.title}</span>
        <span className="tool-description">{tool.description}</span>
      </span>
      <span className="tool-arrow-wrap" aria-hidden="true">
        <IconArrowRight className="tool-arrow" size={24} stroke={1.8} />
      </span>
    </button>
  );
}
