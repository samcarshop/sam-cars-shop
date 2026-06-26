import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, LogOut, ArrowLeft,
  ChevronUp, ChevronDown, AlertTriangle, Check,
  Settings, Image, FileText, Search, Users,
  Car, Layout, Globe, Mail, LayoutDashboard, Bell
} from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';
import AdminSettings from './AdminSettings';
import AdminMedia from './AdminMedia';
import AdminPages from './AdminPages';
import AdminSections from './AdminSections';
import AdminSEO from './AdminSEO';
import AdminReviews from './AdminReviews';
import AdminServices from './AdminServices';
import AdminMessages from './AdminMessages';
import AdminSearchRequests from './AdminSearchRequests';
import AdminVehicleForm from './AdminVehicleForm';
import AdminVisualEditor from './AdminVisualEditor';
import AdminNotifications from './AdminNotifications';

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/admin' },
  { label: 'Vehicules', icon: Car, path: '/admin/vehicles' },
  { label: 'Editeur Visuel', icon: Eye, path: '/admin/visual' },
  { label: 'Parametres site', icon: Settings, path: '/admin/site' },
  { label: 'Medias', icon: Image, path: '/admin/media' },
  { label: 'Pages', icon: FileText, path: '/admin/pages' },
  { label: 'Sections', icon: Layout, path: '/admin/sections' },
  { label: 'SEO', icon: Globe, path: '/admin/seo' },
  { label: 'Avis clients', icon: Users, path: '/admin/reviews' },
  { label: 'Services', icon: FileText, path: '/admin/services' },
  { label: 'Messages', icon: Mail, path: '/admin/messages' },
  { label: 'Recherches', icon: Search, path: '/admin/searches' },
  { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    if (path === '/admin/vehicles') return location.pathname.startsWith('/admin/vehicle');
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-black-800 border-r border-black-600 h-screen flex flex-col fixed left-0 top-0 overflow-hidden">
      <div className="p-6 border-b border-black-600">
        <img
          src="/Le_logo_1_-removebg-preview_(1).png"
          alt="Sam Cars Shop"
          className="h-10 w-auto mb-3"
        />
        <p className="font-sans text-xs text-gold tracking-widest uppercase">Administration</p>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-gold/10 text-gold border border-gold/30'
                      : 'text-gray-400 hover:text-white hover:bg-black-700'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-sans text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-black-600">
        <button
          onClick={() => window.open('/', '_blank')}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-black-700 mb-2"
        >
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Voir le site</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
        >
          <LogOut size={18} />
          <span className="font-sans text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${ADMIN_API_URL}/vehicles`, {
        headers: apiHeaders,
      });
      if (!response.ok) throw new Error('Erreur de chargement');
      const data = await response.json();
      setVehicles(data);
    } catch (e) {
      setError('Erreur de chargement des véhicules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${ADMIN_API_URL}/vehicles/${deleteId}`, {
        method: 'DELETE',
        headers: apiHeaders,
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      setVehicles(vehicles.filter(v => v.id !== deleteId));
      setSuccess('Véhicule supprimé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError('Erreur lors de la suppression');
    } finally {
      setDeleteId(null);
      setDeleteName('');
    }
  };

  const toggleActive = async (vehicle: Vehicle) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ is_active: !vehicle.is_active }),
      });
      if (!response.ok) throw new Error('Erreur');
      setVehicles(vehicles.map(v =>
        v.id === vehicle.id ? { ...v, is_active: !v.is_active } : v
      ));
      setSuccess(vehicle.is_active ? 'Véhicule masqué' : 'Véhicule activé');
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      setError('Erreur lors de la modification');
    }
  };

  const moveVehicle = async (vehicle: Vehicle, direction: 'up' | 'down') => {
    const idx = vehicles.findIndex(v => v.id === vehicle.id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === vehicles.length - 1)) return;

    const newVehicles = [...vehicles];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newVehicles[idx], newVehicles[swapIdx]] = [newVehicles[swapIdx], newVehicles[idx]];

    setVehicles(newVehicles);

    for (let i = 0; i < newVehicles.length; i++) {
      await fetch(`${ADMIN_API_URL}/vehicles/${newVehicles[i].id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ sort_order: i + 1 }),
      });
    }
    setSuccess('Ordre mis à jour');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-2xl text-white">Véhicules</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">
            {vehicles.length} véhicules ({vehicles.filter(v => v.is_active).length} actifs)
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/vehicle/new')}
          className="btn-gold flex items-center gap-2"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {success && (
        <div className="mb-6 bg-green-900/30 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <Check size={18} />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 bg-black-700 rounded-lg border border-black-600">
          <Car size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500 font-sans">Aucun véhicule</p>
          <button onClick={() => navigate('/admin/vehicle/new')} className="btn-outline-gold mt-4">
            Ajouter un véhicule
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {vehicles.map((vehicle, idx) => (
            <div
              key={vehicle.id}
              className={`flex items-center gap-4 p-4 border transition-all duration-300 ${
                vehicle.is_active
                  ? 'bg-black-700 border-black-400 hover:border-gold/30'
                  : 'bg-black-800 border-black-400/50 opacity-60'
              }`}
            >
              <img
                src={vehicle.image || '/Le_logo_1_-removebg-preview_(1).png'}
                alt={vehicle.name}
                className="w-16 h-12 object-cover rounded"
              />
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-serif text-base text-white font-light truncate">{vehicle.name}</h3>
                  {!vehicle.is_active && (
                    <span className="font-sans text-[10px] text-gray-500 bg-black-600 px-2 py-0.5 tracking-wider uppercase">
                      Masqué
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-gray-500">
                  {vehicle.category} • {vehicle.year} • {vehicle.price} • {vehicle.gallery?.length ?? 0} photos
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveVehicle(vehicle, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-gray-500 hover:text-gold disabled:text-gray-700"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveVehicle(vehicle, 'down')}
                    disabled={idx === vehicles.length - 1}
                    className="p-1 text-gray-500 hover:text-gold disabled:text-gray-700"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <button
                  onClick={() => toggleActive(vehicle)}
                  className="p-2 text-gray-400 hover:text-gold transition-colors"
                >
                  {vehicle.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => navigate(`/admin/vehicle/${vehicle.id}`)}
                  className="p-2 text-gray-400 hover:text-gold transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => { setDeleteId(vehicle.id); setDeleteName(vehicle.name); }}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-black-700 border border-black-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="font-serif text-xl text-white">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Voulez-vous vraiment supprimer <strong className="text-white">{deleteName}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setDeleteId(null); setDeleteName(''); }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardHome() {
  const [stats, setStats] = useState({ vehicles: 0, activeVehicles: 0, messages: 0, searches: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const [vehiclesRes, messagesRes, searchesRes] = await Promise.all([
          fetch(`${ADMIN_API_URL}/vehicles`, { headers: apiHeaders }),
          fetch(`${ADMIN_API_URL}/contact-messages`, { headers: apiHeaders }),
          fetch(`${ADMIN_API_URL}/search-requests`, { headers: apiHeaders }),
        ]);
        const vehicles = await vehiclesRes.json();
        const messages = await messagesRes.json();
        const searches = await searchesRes.json();
        setStats({
          vehicles: vehicles.length,
          activeVehicles: vehicles.filter((v: Vehicle) => v.is_active).length,
          messages: messages.length,
          searches: searches.length,
        });
      } catch (e) {
        console.error('Error loading stats');
      }
    }
    loadStats();
  }, []);

  const quickLinks = [
    { label: 'Ajouter un véhicule', icon: Plus, path: '/admin/vehicle/new', color: 'gold' },
    { label: 'Modifier le site', icon: Settings, path: '/admin/site', color: 'blue' },
    { label: 'Gérer les médias', icon: Image, path: '/admin/media', color: 'purple' },
    { label: 'Optimiser le SEO', icon: Globe, path: '/admin/seo', color: 'green' },
  ];

  return (
    <div className="p-8">
      <h2 className="font-serif text-2xl text-white mb-6">Tableau de bord</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-black-700 border border-black-600 rounded-lg p-6">
          <Car className="text-gold mb-2" size={24} />
          <p className="font-sans text-3xl text-white">{stats.vehicles}</p>
          <p className="font-sans text-xs text-gray-500 uppercase tracking-wider">Véhicules</p>
        </div>
        <div className="bg-black-700 border border-black-600 rounded-lg p-6">
          <Eye className="text-green-400 mb-2" size={24} />
          <p className="font-sans text-3xl text-white">{stats.activeVehicles}</p>
          <p className="font-sans text-xs text-gray-500 uppercase tracking-wider">Actifs</p>
        </div>
        <div className="bg-black-700 border border-black-600 rounded-lg p-6">
          <Mail className="text-blue-400 mb-2" size={24} />
          <p className="font-sans text-3xl text-white">{stats.messages}</p>
          <p className="font-sans text-xs text-gray-500 uppercase tracking-wider">Messages</p>
        </div>
        <div className="bg-black-700 border border-black-600 rounded-lg p-6">
          <Search className="text-purple-400 mb-2" size={24} />
          <p className="font-sans text-3xl text-white">{stats.searches}</p>
          <p className="font-sans text-xs text-gray-500 uppercase tracking-wider">Recherches</p>
        </div>
      </div>

      <h3 className="font-serif text-lg text-white mb-4">Actions rapides</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(link => {
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="bg-black-700 border border-black-600 rounded-lg p-6 flex items-center gap-4 hover:border-gold/30 transition-colors text-left"
            >
              <Icon size={20} className="text-gold" />
              <span className="font-sans text-sm text-white">{link.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const token = localStorage.getItem('admin_token');
  const navigate = useNavigate();
  const location = useLocation();
  const isVisualEditor = location.pathname === '/admin/visual';

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-black-900 flex">
      <Sidebar />
      <main
        className={`flex-1 ml-64 flex flex-col ${
          isVisualEditor ? 'h-screen overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicle/:id" element={<AdminVehicleForm />} />
          <Route path="visual" element={<AdminVisualEditor />} />
          <Route path="site" element={<AdminSettings />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="sections" element={<AdminSections />} />
          <Route path="seo" element={<AdminSEO />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="searches" element={<AdminSearchRequests />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Routes>
      </main>
    </div>
  );
}
