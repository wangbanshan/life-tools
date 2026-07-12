import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { AssetManagementPage } from "../features/assets/AssetManagementPage";
import { HomePage } from "../features/home/HomePage";
import { SubscriptionCalendarPage } from "../features/subscriptions/SubscriptionCalendarPage";

const rootRoute = createRootRoute({
  component: Outlet,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets",
  component: AssetManagementPage,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subscriptions",
  component: SubscriptionCalendarPage,
});

const routeTree = rootRoute.addChildren([indexRoute, assetsRoute, subscriptionsRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
