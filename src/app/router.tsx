import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { AssetManagementPage } from "../features/assets/AssetManagementPage";
import { HomePage } from "../features/home/HomePage";

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

const routeTree = rootRoute.addChildren([indexRoute, assetsRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
