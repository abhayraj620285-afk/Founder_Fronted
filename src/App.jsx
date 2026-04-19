import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar          from "./components/Navbar";
import ProtectedRoute  from "./components/ProtectedRoute";
import UpgradeBanner   from "./components/UpgradeBanner";

import Login           from "./pages/Login";
import Register        from "./pages/Register";
import CreateStartup   from "./pages/CreateStartup";
import Dashboard       from "./pages/Dashboard";
import Benchmark       from "./pages/Benchmark";
import AdminPanel      from "./pages/AdminPanel";
import UserExplorePage from "./pages/UserExplorePage";
import DemoDashboard   from "./pages/DemoDashboard";
import UpgradePage     from "./pages/UpgradePage";
import NotFound        from "./pages/NotFound";
import TokenDebug      from "./pages/TokenDebug";

function RootRedirect() {
  const { token, role, hasStartups, startupsLoaded } = useAuth();
  if (!token)             return <Navigate to="/login"   replace />;
  if (role === "ADMIN")   return <Navigate to="/admin"   replace />;
  if (role === "USER")    return <Navigate to="/explore"  replace />;
  if (role === "FOUNDER") {
    if (!startupsLoaded)  return null;
    return <Navigate to={hasStartups ? "/dashboard" : "/create"} replace />;
  }
  return <Navigate to="/explore" replace />;
}

function AppRoutes() {
  const { token } = useAuth();
  return (
    <>
      <Navbar />
      <UpgradeBanner />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={token ? <RootRedirect /> : <Login />} />
        <Route path="/register" element={token ? <RootRedirect /> : <Register />} />

        {/* USER */}
        <Route path="/explore"        element={<ProtectedRoute><UserExplorePage /></ProtectedRoute>} />
        <Route path="/demo-dashboard" element={<ProtectedRoute><DemoDashboard /></ProtectedRoute>} />
        <Route path="/upgrade"        element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />

        {/* FOUNDER */}
        <Route path="/create"    element={<ProtectedRoute roles={["FOUNDER"]}><CreateStartup /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute roles={["FOUNDER","ADMIN"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/benchmark" element={<ProtectedRoute roles={["FOUNDER","ADMIN"]}><Benchmark /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminPanel /></ProtectedRoute>} />

        {/* Dev */}
        <Route path="/debug/token" element={<ProtectedRoute><TokenDebug /></ProtectedRoute>} />

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