import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { AuthProvider } from "../features/auth/auth-context";
import { router } from "./router";
import { theme } from "./theme";

const queryClient = new QueryClient();
const datesSettings = {
  locale: "zh-cn",
  firstDayOfWeek: 1 as const,
  weekendDays: [0, 6] as [0, 6],
  consistentWeeks: true,
};

export function App() {
  return (
    <MantineProvider theme={theme}>
      <DatesProvider settings={datesSettings}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </DatesProvider>
    </MantineProvider>
  );
}
