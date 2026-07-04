const amountFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAmount(value: number, visible: boolean) {
  return visible ? amountFormatter.format(value) : "••••••";
}
