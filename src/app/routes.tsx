import { createBrowserRouter } from "react-router";
import { MainPage } from "./pages/MainPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Announcements } from "./pages/Announcements";
import { Schedule } from "./pages/Schedule";
import { Tasks } from "./pages/Tasks";
import { FileStorage } from "./pages/FileStorage";
import { Chat } from "./pages/Chat";
import { Profile } from "./pages/Profile";
import { Evaluation } from "./pages/Evaluation";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainPage,
  },
  {
    path: "/team/:teamId",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "announcements", Component: Announcements },
      { path: "schedule", Component: Schedule },
      { path: "tasks", Component: Tasks },
      { path: "files", Component: FileStorage },
      { path: "chat", Component: Chat },
      { path: "evaluation", Component: Evaluation },
    ],
  },
  {
    path: "/profile",
    Component: Profile,
  },
]);
