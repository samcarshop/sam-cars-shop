import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Vehicles from './components/Vehicles';
import DepotVente from './components/DepotVente';
import PersonalizedSearch from './components/PersonalizedSearch';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminVehicleForm from './components/admin/AdminVehicleForm';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

function PublicSite() {
  return (
    <div className="min-h-screen bg-black-900">
      <Navigation />
      <Hero />
      <Vehicles />
      <DepotVente />
      <PersonalizedSearch />
      <Reviews />
      <Contact />
      <Footer />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <SiteSettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicSite />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SiteSettingsProvider>
  );
}
