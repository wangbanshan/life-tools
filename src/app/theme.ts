import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "sage",
  colors: {
    sage: [
      "#f2f6ee",
      "#e6ecd9",
      "#d2ddbf",
      "#bdcea4",
      "#a7be88",
      "#91aa73",
      "#7f995f",
      "#6c824f",
      "#596d42",
      "#485936",
    ],
    apricot: [
      "#fff6ee",
      "#fdebdc",
      "#f8d7bd",
      "#efbd97",
      "#df9a63",
      "#cf8039",
      "#b76d2d",
      "#985824",
      "#7a471f",
      "#633a1c",
    ],
  },
  fontFamily:
    '"Inter", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
  headings: {
    fontFamily:
      '"Inter", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    fontWeight: "800",
  },
  defaultRadius: "lg",
});
