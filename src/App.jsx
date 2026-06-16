import "./App.css";
import UserPage from "./pages/UserPage";
import AdminGate from "./pages/AdminGate";

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "");

  if (path.startsWith("/admin")) {
    return <AdminGate />;
  }

  return <UserPage />;
}