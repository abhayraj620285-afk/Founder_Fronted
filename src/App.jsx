import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar          from "./components/Navbar";
import ProtectedRoute  from "./components/ProtectedRoute";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import CreateStartup   from "./pages/CreateStartup";
import Dashboard       from "./pages/Dashboard";
import Benchmark       from "./pages/Benchmark";
import AdminPanel      from "./pages/AdminPanel";
import NotFound        from "./pages/NotFound";
import TokenDebug      from "./pages/TokenDebug";

/**
 * Decides where to send a logged-in user visiting "/" or a public page.
 * Uses the role stored in context (decoded from JWT on login).
 */
function RootRedirect() {
  const { token, role } = useAuth();
  if (!token)              return <Navigate to="/login"     replace />;
  if (role === "ADMIN")    return <Navigate to="/admin"     replace />;
  if (role === "FOUNDER")  return <Navigate to="/create"    replace />;
  return                          <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>

        {/* Public — redirect away if already logged in */}
        <Route path="/login"    element={token ? <RootRedirect /> : <Login />} />
        <Route path="/register" element={token ? <RootRedirect /> : <Register />} />

        {/* Any authenticated user */}
        <Route path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* FOUNDER only */}
        <Route path="/create"
          element={
            <ProtectedRoute roles={["FOUNDER"]} feature="canCreateStartup">
              <CreateStartup />
            </ProtectedRoute>
          }
        />

        {/* FOUNDER + ADMIN */}
        <Route path="/benchmark"
          element={
            <ProtectedRoute roles={["FOUNDER","ADMIN"]} feature="canViewBenchmark">
              <Benchmark />
            </ProtectedRoute>
          }
        />

        {/* ADMIN only */}
        <Route path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]} feature="canViewAdminPanel">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Dev tool — remove before production */}
        <Route path="/debug/token"
          element={<ProtectedRoute><TokenDebug /></ProtectedRoute>} />

        {/* Root + catch-all */}
        <Route path="/"  element={<RootRedirect />} />
        <Route path="*"  element={<NotFound />} />

      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}