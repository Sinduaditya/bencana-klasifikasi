import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminModels from "./pages/admin/Models";
import AdminDataset from "./pages/admin/Dataset";
import AdminMessages from "./pages/admin/Messages";
import AdminActivities from "./pages/admin/Activities";
import UserLayout from "./components/user/UserLayout";
import UserDashboard from "./pages/user/Dashboard";
import UserRiwayat from "./pages/user/Riwayat";
import UserDetail from "./pages/user/Detail";
import UserKontak from "./pages/user/Kontak";
import UserProfile from "./pages/user/Profile";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "white",
        }}
      >
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "ADMIN" ? "/admin" : "/dashboard"} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dataset" element={<AdminDataset />} />
        <Route path="models" element={<AdminModels />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="activities" element={<AdminActivities />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>

      {/* User */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="USER">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="riwayat" element={<UserRiwayat />} />
        <Route path="detail/:id" element={<UserDetail />} />
        <Route path="kontak" element={<UserKontak />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
}