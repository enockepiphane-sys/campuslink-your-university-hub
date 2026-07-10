import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, roleHomePath } from "./lib/auth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PlatformLayout from "./pages/platform/PlatformLayout";
import PlatformDashboard from "./pages/platform/Dashboard";
import PlatformEtabs from "./pages/platform/Etablissements";
import PlatformAdmins from "./pages/platform/Admins";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFilieres from "./pages/admin/Filieres";
import AdminNiveau from "./pages/admin/NiveauDetail";
import AdminEvents from "./pages/admin/Events";
import AppLayout from "./pages/app/AppLayout";
import AppHome from "./pages/app/Home";
import AppAnnonces from "./pages/app/Annonces";
import AppEmploi from "./pages/app/Emploi";
import AppGrades from "./pages/app/Grades";
import AppEvents from "./pages/app/Events";
import AppProfile from "./pages/app/Profile";

function Guard({ role, children }: { role: string; children: React.ReactNode }) {
  const auth = useAuth();
  if (auth.loading) return <div className="min-h-screen grid place-items-center text-sm text-gray-500">Chargement…</div>;
  if (!auth.user) return <Navigate to="/login" replace />;
  if (auth.role !== role) return <Navigate to={roleHomePath(auth.role)} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/platform" element={<Guard role="super_admin"><PlatformLayout /></Guard>}>
        <Route index element={<PlatformDashboard />} />
        <Route path="etabs" element={<PlatformEtabs />} />
        <Route path="admins" element={<PlatformAdmins />} />
      </Route>
      <Route path="/admin" element={<Guard role="admin_etablissement"><AdminLayout /></Guard>}>
        <Route index element={<AdminDashboard />} />
        <Route path="filieres" element={<AdminFilieres />} />
        <Route path="niveau/:niveauId" element={<AdminNiveau />} />
        <Route path="events" element={<AdminEvents />} />
      </Route>
      <Route path="/app" element={<Guard role="etudiant"><AppLayout /></Guard>}>
        <Route index element={<AppHome />} />
        <Route path="annonces" element={<AppAnnonces />} />
        <Route path="emploi" element={<AppEmploi />} />
        <Route path="grades" element={<AppGrades />} />
        <Route path="events" element={<AppEvents />} />
        <Route path="profile" element={<AppProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
