import {
  useState, useEffect, useCallback, useRef, DragEvent,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, X, Check,
  AlertTriangle, Loader2, GripVertical, Star,
  FileText, Image as ImageIcon, Eye, EyeOff,
  Upload, Film, Download, RefreshCw, Play,
} from 'lucide-react';
import type { Vehicle, Spec, VehicleDocument } from '../../types/vehicle';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';
import { uploadSingle } from './AdminMedia';

// ─── Types ─────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  category: string;
  year: string;
  km: string;
  fuel: string;
  price: string;
  description: string;
  gallery: string[];
  video_url: string;
  specs: Spec[];
  documents: VehicleDocument[];
  sort_order: number;
  is_active: boolean;
}

interface UploadSlot {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'error';
  previewUrl: string;
  errorMsg?: string;
}

const emptyForm: FormState = {
  name: '', category: '', year: '', km: '', fuel: '',
  price: 'Sur demande', description: '',
  gallery: [], video_url: '',
  specs: [{ label: '', value: '' }],
  documents: [], sort_order: 1, is_active: true,
};

const FUEL_OPTIONS = ['Essence', 'Diesel', 'Hybride', 'Électrique'];

// ─── Inline Photo Gallery ───────────────────────────────────────────────────

function PhotoGallery({
  photos, onChange,
}: { photos: string[]; onChange: (p: string[]) => void }) {
  const [dragReorderIdx, setDragReorderIdx] = useState<number | null>(null);
  const [dragReorderOver, setDragReorderOver] = useState<number | null>(null);
  const [slots, setSlots] = useState<UploadSlot[]>([]);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<UploadSlot[]>([]);
  const photosRef = useRef<string[]>(photos);

  useEffect(() => { slotsRef.current = slots; }, [slots]);
  useEffect(() => { photosRef.current = photos; }, [photos]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => { slotsRef.current.forEach(s => URL.revokeObjectURL(s.previewUrl)); };
  }, []);

  // ── Reorder drag ────────────────────────────────────────────────────────
  function handleReorderStart(e: DragEvent<HTMLDivElement>, idx: number) {
    setDragReorderIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  }
  function handleReorderOver(e: DragEvent<HTMLDivElement>, idx: number) {
    if (dragReorderIdx === null) return;
    e.preventDefault();
    setDragReorderOver(idx);
  }
  function handleReorderDrop(e: DragEvent<HTMLDivElement>, toIdx: number) {
    e.preventDefault();
    if (dragReorderIdx !== null && dragReorderIdx !== toIdx) {
      const arr = [...photos];
      const [item] = arr.splice(dragReorderIdx, 1);
      arr.splice(toIdx, 0, item);
      onChange(arr);
    }
    setDragReorderIdx(null);
    setDragReorderOver(null);
  }

  // ── File upload ─────────────────────────────────────────────────────────
  function addSlot(file: File): UploadSlot {
    const slot: UploadSlot = {
      id: Math.random().toString(36).slice(2),
      filename: file.name,
      progress: 0,
      status: 'uploading',
      previewUrl: URL.createObjectURL(file),
    };
    setSlots(prev => [...prev, slot]);
    return slot;
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const slot = addSlot(file);
    try {
      const result = await uploadSingle(file, (pct) => {
        setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, progress: pct } : s));
      });
      URL.revokeObjectURL(slot.previewUrl);
      setSlots(prev => prev.filter(s => s.id !== slot.id));
      photosRef.current = [...photosRef.current, result.public_url];
      onChange(photosRef.current);
    } catch (e) {
      setSlots(prev => prev.map(s =>
        s.id === slot.id ? { ...s, status: 'error', errorMsg: (e as Error).message } : s
      ));
    }
  }

  async function handleFiles(files: File[]) {
    const images = files.filter(f => f.type.startsWith('image/'));
    for (const img of images) {
      await uploadFile(img);
    }
  }

  // ── Container drag events (OS files) ────────────────────────────────────
  function onContainerDragEnter(e: DragEvent<HTMLDivElement>) {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsFileDragOver(true);
    }
  }
  function onContainerDragOver(e: DragEvent<HTMLDivElement>) {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }
  function onContainerDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsFileDragOver(false);
    }
  }
  function onContainerDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsFileDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }

  function setAsMain(idx: number) {
    const arr = [...photos];
    const [item] = arr.splice(idx, 1);
    onChange([item, ...arr]);
  }

  function removePhoto(idx: number) {
    onChange(photos.filter((_, i) => i !== idx));
  }

  function removeSlot(id: string) {
    setSlots(prev => {
      const slot = prev.find(s => s.id === id);
      if (slot) URL.revokeObjectURL(slot.previewUrl);
      return prev.filter(s => s.id !== id);
    });
  }

  const isEmpty = photos.length === 0 && slots.length === 0;

  return (
    <div
      ref={containerRef}
      onDragEnter={onContainerDragEnter}
      onDragOver={onContainerDragOver}
      onDragLeave={onContainerDragLeave}
      onDrop={onContainerDrop}
      className={`relative rounded-xl transition-all duration-200 ${
        isFileDragOver ? 'ring-2 ring-gold ring-offset-2 ring-offset-black-700 bg-gold/5' : ''
      }`}
    >
      {/* File drag overlay */}
      {isFileDragOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/70 pointer-events-none">
          <div className="text-center">
            <Upload size={32} className="text-gold mx-auto mb-2" />
            <p className="text-gold font-sans text-sm font-semibold">Déposer les images ici</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => e.target.files && handleFiles(Array.from(e.target.files))}
      />

      {isEmpty ? (
        /* Empty state */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-black-600 hover:border-gold rounded-xl p-12 text-center transition-colors group"
        >
          <ImageIcon size={40} className="mx-auto text-gray-700 group-hover:text-gold/50 mb-3 transition-colors" />
          <p className="text-gray-400 font-sans text-sm font-medium">Glisser des images ici</p>
          <p className="text-gray-600 font-sans text-xs mt-1">ou cliquer pour sélectionner · JPG, PNG, WebP</p>
        </button>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Confirmed photos */}
            {photos.map((url, idx) => (
              <div
                key={url + idx}
                draggable
                onDragStart={e => handleReorderStart(e, idx)}
                onDragOver={e => handleReorderOver(e, idx)}
                onDrop={e => handleReorderDrop(e, idx)}
                onDragEnd={() => { setDragReorderIdx(null); setDragReorderOver(null); }}
                style={{ aspectRatio: '16/10' }}
                className={`relative group cursor-grab rounded-lg overflow-hidden border-2 transition-all ${
                  dragReorderOver === idx && dragReorderIdx !== idx
                    ? 'border-gold scale-[1.03] shadow-xl shadow-gold/30'
                    : dragReorderIdx === idx
                    ? 'opacity-40 border-dashed border-gray-600'
                    : idx === 0
                    ? 'border-gold/70'
                    : 'border-black-600 hover:border-black-400'
                }`}
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
                {idx === 0 && (
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-gold text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    <Star size={7} fill="currentColor" /> Principale
                  </div>
                )}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-70 transition-opacity">
                  <GripVertical size={13} className="text-white drop-shadow" />
                </div>
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => setAsMain(idx)}
                      className="flex items-center gap-1 px-2 py-1 bg-gold text-black text-[10px] font-bold rounded shadow"
                    >
                      <Star size={9} fill="currentColor" /> Principale
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="p-1.5 bg-red-600 text-white rounded shadow hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}

            {/* In-progress upload slots */}
            {slots.map(slot => (
              <div
                key={slot.id}
                style={{ aspectRatio: '16/10' }}
                className="relative rounded-lg overflow-hidden border-2 border-black-600 bg-black-800"
              >
                {/* Preview background */}
                <img
                  src={slot.previewUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-40 pointer-events-none select-none"
                />
                {slot.status === 'error' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70">
                    <AlertTriangle size={18} className="text-red-400" />
                    <p className="text-xs text-red-400 text-center px-2 leading-tight">{slot.errorMsg || 'Erreur'}</p>
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.id)}
                      className="text-[10px] text-gray-400 hover:text-white underline"
                    >
                      Ignorer
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
                    <Loader2 size={20} className="text-gold animate-spin" />
                    <div className="w-3/4">
                      <div className="h-1 bg-black-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold transition-all duration-200 rounded-full"
                          style={{ width: `${slot.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 text-center mt-1">{slot.progress}%</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add slot */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ aspectRatio: '16/10' }}
              className="border-2 border-dashed border-black-600 hover:border-gold rounded-lg flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gold transition-colors"
            >
              <Upload size={18} />
              <span className="text-[10px] font-sans uppercase tracking-wider">Ajouter</span>
            </button>
          </div>

          <p className="text-xs text-gray-700 mt-2">
            Glisser pour réordonner · Survol pour actions · Photo n°1 = image principale
          </p>
        </>
      )}
    </div>
  );
}

// ─── Inline Video Upload ────────────────────────────────────────────────────

function VideoUpload({
  url, onChange,
}: { url: string; onChange: (u: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith('video/')) { setError('Fichier vidéo requis (MP4, WebM)'); return; }
    setUploading(true); setProgress(0); setError(null);
    try {
      const result = await uploadSingle(file, setProgress);
      onChange(result.public_url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (url && !uploading) {
    return (
      <div className="space-y-3">
        <div className="relative bg-black-900 rounded-lg overflow-hidden border border-black-600" style={{ aspectRatio: '16/9', maxHeight: '240px' }}>
          <video src={url} controls className="w-full h-full object-contain" preload="metadata" />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={13} /> Supprimer la vidéo
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold transition-colors"
          >
            <RefreshCw size={13} /> Remplacer
          </button>
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
      onClick={() => !uploading && fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
        isDragOver ? 'border-gold bg-gold/5' : uploading ? 'border-black-600 cursor-default' : 'border-black-600 hover:border-black-500'
      }`}
    >
      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {uploading ? (
        <div className="space-y-3">
          <Film size={36} className="mx-auto text-gold" />
          <p className="text-sm text-gray-300 font-sans">Téléversement en cours...</p>
          <div className="w-48 mx-auto">
            <div className="h-2 bg-black-600 rounded-full overflow-hidden">
              <div className="h-full bg-gold transition-all duration-200 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">{progress}%</p>
          </div>
        </div>
      ) : (
        <>
          <Film size={36} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-400 font-sans text-sm font-medium">
            {isDragOver ? 'Déposer la vidéo ici' : 'Glisser une vidéo MP4 / WebM'}
          </p>
          <p className="text-gray-600 text-xs mt-1">ou cliquer pour sélectionner</p>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </>
      )}
    </div>
  );
}

// ─── Inline Document Upload ─────────────────────────────────────────────────

function DocumentUpload({
  docs, onChange,
}: { docs: VehicleDocument[]; onChange: (d: VehicleDocument[]) => void }) {
  const [slots, setSlots] = useState<UploadSlot[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slotsRef = useRef<UploadSlot[]>([]);

  useEffect(() => { slotsRef.current = slots; }, [slots]);
  useEffect(() => { return () => slotsRef.current.forEach(s => URL.revokeObjectURL(s.previewUrl)); }, []);

  async function handleFile(file: File) {
    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExts = ['pdf', 'doc', 'docx'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      setError('Format non supporté. Utilisez PDF, DOC ou DOCX.');
      return;
    }
    setError(null);
    const slot: UploadSlot = {
      id: Math.random().toString(36).slice(2),
      filename: file.name,
      progress: 0,
      status: 'uploading',
      previewUrl: '',
    };
    setSlots(prev => [...prev, slot]);
    try {
      const result = await uploadSingle(file, (pct) => {
        setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, progress: pct } : s));
      });
      setSlots(prev => prev.filter(s => s.id !== slot.id));
      const newDoc: VehicleDocument = {
        name: file.name,
        url: result.public_url,
        size: file.size,
        type: ext || 'pdf',
      };
      onChange([...docs, newDoc]);
    } catch (e) {
      setSlots(prev => prev.map(s =>
        s.id === slot.id ? { ...s, status: 'error', errorMsg: (e as Error).message } : s
      ));
    }
  }

  function handleFiles(files: File[]) {
    files.forEach(handleFile);
  }

  function removeDoc(idx: number) {
    onChange(docs.filter((_, i) => i !== idx));
  }

  function formatSize(bytes?: number) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-2">
      {/* Uploaded docs */}
      {docs.map((doc, idx) => (
        <div key={doc.url + idx} className="flex items-center gap-3 p-3 bg-black-800 border border-black-700 rounded-lg group hover:border-black-600 transition-colors">
          <div className="w-8 h-8 bg-red-900/30 border border-red-800/40 rounded flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{doc.name}</p>
            <p className="text-xs text-gray-600 uppercase">{doc.type}{doc.size ? ` · ${formatSize(doc.size)}` : ''}</p>
          </div>
          <a href={doc.url} target="_blank" rel="noopener noreferrer"
            className="p-1.5 text-gray-500 hover:text-gold transition-colors" title="Voir">
            <Eye size={14} />
          </a>
          <a href={doc.url} download className="p-1.5 text-gray-500 hover:text-gold transition-colors" title="Télécharger">
            <Download size={14} />
          </a>
          <button type="button" onClick={() => removeDoc(idx)}
            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors" title="Supprimer">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {/* In-progress uploads */}
      {slots.map(slot => (
        <div key={slot.id} className="flex items-center gap-3 p-3 bg-black-800 border border-black-700 rounded-lg">
          <div className="w-8 h-8 bg-black-700 rounded flex items-center justify-center flex-shrink-0">
            {slot.status === 'error'
              ? <AlertTriangle size={14} className="text-red-400" />
              : <Loader2 size={14} className="text-gold animate-spin" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 truncate">{slot.filename}</p>
            {slot.status === 'error' ? (
              <p className="text-xs text-red-400">{slot.errorMsg}</p>
            ) : (
              <div className="mt-1 h-1 bg-black-600 rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all duration-200 rounded-full" style={{ width: `${slot.progress}%` }} />
              </div>
            )}
          </div>
          {slot.status === 'error' && (
            <button type="button" onClick={() => setSlots(p => p.filter(s => s.id !== slot.id))}
              className="p-1 text-gray-600 hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>
      ))}

      {/* Drop zone */}
      <div
        onDragEnter={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
          isDragOver ? 'border-gold bg-gold/5 text-gold' : 'border-black-600 hover:border-black-500 text-gray-600'
        }`}
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,application/pdf" multiple className="hidden"
          onChange={e => e.target.files && handleFiles(Array.from(e.target.files))} />
        <Upload size={16} className="flex-shrink-0" />
        <div>
          <p className="text-sm">
            {isDragOver ? 'Déposer ici' : 'Glisser des documents ou cliquer pour sélectionner'}
          </p>
          <p className="text-xs text-gray-700">PDF, DOC, DOCX</p>
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Main AdminVehicleForm ─────────────────────────────────────────────────

export default function AdminVehicleForm() {
  const { id } = useParams();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('admin_token');
  useEffect(() => { if (!token) navigate('/login'); }, [token, navigate]);

  const loadVehicle = useCallback(async () => {
    if (!isEdit || !id) return;
    try {
      const res = await fetch(`${ADMIN_API_URL}/vehicles`, { headers: apiHeaders });
      const data: Vehicle[] = await res.json();
      const v = data.find(x => x.id === id);
      if (!v) { setError('Véhicule introuvable'); return; }

      const allPhotos = [
        v.image,
        ...(v.gallery || []).filter(g => g && g !== v.image),
      ].filter(Boolean) as string[];

      setForm({
        name: v.name || '', category: v.category || '',
        year: v.year || '', km: v.km || '',
        fuel: v.fuel || '', price: v.price || 'Sur demande',
        description: v.description || '',
        gallery: allPhotos, video_url: v.video_url || '',
        specs: Array.isArray(v.specs) && v.specs.length ? v.specs : [{ label: '', value: '' }],
        documents: Array.isArray(v.documents) ? v.documents : [],
        sort_order: v.sort_order || 1, is_active: v.is_active !== false,
      });
    } catch { setError('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [isEdit, id]);

  useEffect(() => { loadVehicle(); }, [loadVehicle]);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateSpec(i: number, field: 'label' | 'value', val: string) {
    setForm(prev => {
      const specs = [...prev.specs];
      specs[i] = { ...specs[i], [field]: val };
      return { ...prev, specs };
    });
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.category.trim()) {
      setError('Le nom et la catégorie sont obligatoires');
      return;
    }
    setSaving(true);
    const validSpecs = form.specs.filter(s => s.label.trim() && s.value.trim());
    const payload = {
      ...form,
      image: form.gallery[0] || '',
      gallery: form.gallery,
      specs: validSpecs,
      updated_at: new Date().toISOString(),
    };
    try {
      const res = await fetch(
        isEdit ? `${ADMIN_API_URL}/vehicles/${id}` : `${ADMIN_API_URL}/vehicles`,
        { method: isEdit ? 'PUT' : 'POST', headers: apiHeaders, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error(isEdit ? 'Erreur de mise à jour' : 'Erreur de création');
      setSaved(true);
      setTimeout(() => { navigate('/admin/vehicles'); }, 1200);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-full py-32">
      <Loader2 size={28} className="text-gold animate-spin" />
    </div>
  );

  return (
    <div className="bg-black-900 min-h-full">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-black-900/97 backdrop-blur-sm border-b border-black-600">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => navigate('/admin/vehicles')}
              className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors flex-shrink-0">
              <ArrowLeft size={16} />
              <span className="font-sans text-xs tracking-widest uppercase">Retour</span>
            </button>
            <div className="w-px h-5 bg-black-400 flex-shrink-0" />
            <h1 className="font-serif text-xl font-light text-white truncate">
              {isEdit ? 'Modifier' : 'Nouveau'} <span className="text-gold">véhicule</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button type="button" onClick={() => set('is_active', !form.is_active)}
              className={`flex items-center gap-2 px-3 py-2 text-xs rounded border transition-colors ${
                form.is_active ? 'text-green-400 border-green-800 bg-green-900/20' : 'text-gray-500 border-black-600'
              }`}>
              {form.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
              {form.is_active ? 'Visible' : 'Masqué'}
            </button>
            <button onClick={handleSubmit} disabled={saving || saved}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
                saved ? 'bg-green-500 text-white' : 'bg-gold text-black hover:bg-gold-400 disabled:opacity-60'
              }`}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Save size={13} />}
              {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-8 space-y-5">

        {/* Informations générales */}
        <Panel title="Informations générales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FieldLabel>Nom du véhicule *</FieldLabel>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Ex: Ford Mustang GT500" required className="input-luxury" />
            </div>
            <div>
              <FieldLabel>Catégorie *</FieldLabel>
              <input value={form.category} onChange={e => set('category', e.target.value)}
                placeholder="Ex: Muscle Car" required className="input-luxury" />
            </div>
            <div>
              <FieldLabel>Prix</FieldLabel>
              <input value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="Ex: 45 000 € ou Sur demande" className="input-luxury" />
            </div>
            <div>
              <FieldLabel>Année</FieldLabel>
              <input value={form.year} onChange={e => set('year', e.target.value)}
                placeholder="Ex: 2021" className="input-luxury" />
            </div>
            <div>
              <FieldLabel>Kilométrage</FieldLabel>
              <input value={form.km} onChange={e => set('km', e.target.value)}
                placeholder="Ex: 42 000 km" className="input-luxury" />
            </div>
            <div>
              <FieldLabel>Carburant</FieldLabel>
              <div className="relative">
                <select value={form.fuel} onChange={e => set('fuel', e.target.value)} className="select-luxury">
                  <option value="">Sélectionner</option>
                  {FUEL_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none text-xs">▾</span>
              </div>
            </div>
            <div>
              <FieldLabel>Ordre d'affichage</FieldLabel>
              <input type="number" value={form.sort_order}
                onChange={e => set('sort_order', parseInt(e.target.value) || 1)}
                min={1} className="input-luxury" />
            </div>
          </div>
        </Panel>

        {/* Photos */}
        <Panel title="Photos">
          <PhotoGallery
            photos={form.gallery}
            onChange={photos => set('gallery', photos)}
          />
        </Panel>

        {/* Vidéo */}
        <Panel title="Vidéo de présentation" collapsible defaultOpen={!!form.video_url}>
          <VideoUpload url={form.video_url} onChange={url => set('video_url', url)} />
        </Panel>

        {/* Description */}
        <Panel title="Description">
          <textarea value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Décrivez le véhicule, son histoire, ses équipements..."
            rows={5} className="input-luxury resize-none" />
        </Panel>

        {/* Documents */}
        <Panel title="Documents" collapsible defaultOpen={form.documents.length > 0}>
          <DocumentUpload docs={form.documents} onChange={docs => set('documents', docs)} />
        </Panel>

        {/* Caractéristiques */}
        <Panel title="Caractéristiques techniques">
          <div className="space-y-2">
            {form.specs.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <input value={spec.label} onChange={e => updateSpec(i, 'label', e.target.value)}
                  placeholder="Label (ex: Motorisation)" className="input-luxury flex-1" />
                <input value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)}
                  placeholder="Valeur (ex: 5.0 V8)" className="input-luxury flex-1" />
                <button type="button" onClick={() =>
                  setForm(prev => ({
                    ...prev,
                    specs: prev.specs.length === 1 ? [{ label: '', value: '' }] : prev.specs.filter((_, j) => j !== i),
                  }))
                } className="w-10 border border-black-400 flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-400/40 transition-colors rounded flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setForm(prev => ({ ...prev, specs: [...prev.specs, { label: '', value: '' }] }))}
              className="flex items-center gap-2 text-xs text-gold hover:text-gold-400 transition-colors mt-1">
              <Plus size={13} /> Ajouter une caractéristique
            </button>
          </div>
        </Panel>

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-8">
          <button type="submit" disabled={saving || saved}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-gold text-black hover:bg-gold-400 disabled:opacity-60'
            }`}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Save size={13} />}
            {saving ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer le véhicule'}
          </button>
          <button type="button" onClick={() => navigate('/admin/vehicles')} className="btn-outline-gold">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Helper components ─────────────────────────────────────────────────────

function Panel({
  title, children, collapsible = false, defaultOpen = true,
}: { title: string; children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-black-700 border border-black-600 rounded-xl overflow-hidden">
      <button type="button" onClick={() => collapsible && setOpen(!open)}
        className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
          collapsible ? 'hover:bg-black-600/50 cursor-pointer' : 'cursor-default'
        }`}>
        <span className="font-sans text-xs text-gold tracking-widest uppercase font-semibold">{title}</span>
        {collapsible && <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>}
      </button>
      {open && <div className="px-6 pb-6 pt-1 border-t border-black-600">{children}</div>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-sans text-xs text-gray-400 tracking-wider uppercase mb-2">{children}</label>
  );
}
