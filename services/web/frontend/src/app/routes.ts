import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("../main.tsx"),
    route("dashboard", "./routes/DashboardPage.tsx"),
    route("dashboard/:serverId", "./routes/ServerPage.tsx"),
] satisfies RouteConfig;
