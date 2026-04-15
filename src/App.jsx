import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateStartup from "./pages/CreateStartup";
import Dashboard from "./pages/Dashboard";
import Benchmark from "./pages/Benchmark";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { token } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login"     element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register"  element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/create"    element={<ProtectedRoute><CreateStartup /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/benchmark" element={<ProtectedRoute><Benchmark /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
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