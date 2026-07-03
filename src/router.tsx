import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { App } from "./App";
import { AssetManagementPage } from "./features/assets/AssetManagementPage";

const rootRoute = createRootRoute({
  component: Outlet,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App,
});

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets",
  component: AssetManagementPage,
});

const routeTree = rootRoute.addChildren([indexRoute, assetsRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
