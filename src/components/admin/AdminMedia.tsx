import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, Trash2, Check, Loader2, Copy, Image as ImageIcon,
  Video, FileText, X, Search, Grid, List, Eye, Pencil,
  AlertCircle,
} from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';

export interface Media {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  public_url: string;
  alt_text: string;
  title: string;
  created_at: string;
}

interface UploadItem {
  filename: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

interface MediaSelectorProps {
  onSelect: (url: string, media?: Media) => void;
  currentUrl?: string;
  accept?: 'image' | 'video' | 'all';
}

// Upload a single file via edge function with progress tracking
export function uploadSingle(file: File, onProgress: (pct: number) => void): Promise<Media> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${ADMIN_API_URL}/upload`);
    // Note: do NOT set Content-Type for FormData — browser sets the multipart boundary
    const token = localStorage.getItem('admin_token') || 'admin-token-samcars-2025';
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Réponse invalide du serveur'));
        }
      } else {
        let msg = `Erreur serveur (${xhr.status})`;
        try {
          const err = JSON.parse(xhr.responseText);
          if (err.error) msg = err.error;
        } catch { /* ignore */ }
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('Erreur réseau'));
    xhr.send(formData);
  });
}

export function MediaSelector({ onSelect, currentUrl, accept = 'all' }: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) loadMedia();
  }, [isOpen]);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API_URL}/media`, { headers: apiHeaders });
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (!arr.length) return;

    setUploads(arr.map(f => ({ filename: f.name, progress: 0, status: 'uploading' })));

    for (let i = 0; i < arr.length; i++) {
      try {
        await uploadSingle(arr[i], (pct) => {
          setUploads(prev => prev.map((u, idx) => idx === i ? { ...u, progress: pct } : u));
        });
        setUploads(prev => prev.map((u, idx) => idx === i ? { ...u, progress: 100, status: 'done' } : u));
      } catch (e) {
        setUploads(prev => prev.map((u, idx) =>
          idx === i ? { ...u, status: 'error', error: (e as Error).message } : u
        ));
      }
    }

    await loadMedia();
    setTimeout(() => setUploads([]), 2500);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, []);

  const filteredMedia = media.filter(m => {
    if (accept === 'image') return m.mime_type.startsWith('image/');
    if (accept === 'video') return m.mime_type.startsWith('video/');
    return true;
  });

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-black-600 hover:bg-black-500 text-white rounded transition-colors text-xs"
        >
          <ImageIcon size={14} />
          {currentUrl ? 'Changer' : 'Sélectionner'}
        </button>

        {currentUrl && (
          <div className="relative inline-block">
            {currentUrl.match(/\.(mp4|webm)$/i) ? (
              <video src={currentUrl} className="h-14 rounded object-cover" muted />
            ) : (
              <img src={currentUrl} alt="" className="h-14 rounded object-cover" />
            )}
            <button
              type="button"
              onClick={() => onSelect('')}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
            >
              <X size={10} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-black-700 border border-black-600 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-white">Médiathèque</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            {/* Drop zone */}
            <div
              ref={dropZoneRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mb-4 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                isDragging ? 'border-gold bg-gold/10' : 'border-black-500 hover:border-black-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/mp4,video/webm'}
                onChange={e => e.target.files && handleFiles(e.target.files)}
                className="hidden"
                multiple
              />
              <Upload size={24} className={`mx-auto mb-1 ${isDragging ? 'text-gold' : 'text-gray-500'}`} />
              <p className="text-xs text-gray-400">
                {isDragging ? 'Déposer ici' : 'Glisser des fichiers ou cliquer pour téléverser'}
              </p>
            </div>

            {/* Upload progress */}
            {uploads.length > 0 && (
              <div className="mb-4 space-y-2">
                {uploads.map((u, i) => (
                  <div key={i} className="bg-black-800 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 truncate max-w-48">{u.filename}</span>
                      <span className="text-xs text-gray-500">
                        {u.status === 'error' ? <span className="text-red-400">{u.error}</span> :
                         u.status === 'done' ? <Check size={12} className="text-green-400" /> :
                         `${u.progress}%`}
                      </span>
                    </div>
                    <div className="h-1 bg-black-600 rounded overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          u.status === 'error' ? 'bg-red-500' :
                          u.status === 'done' ? 'bg-green-500' : 'bg-gold'
                        }`}
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Media grid */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-gold" size={24} />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <ImageIcon size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Aucun média — téléversez un fichier ci-dessus</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { onSelect(item.public_url, item); setIsOpen(false); }}
                      className="cursor-pointer group relative bg-black-800 border border-black-600 rounded overflow-hidden hover:border-gold transition-colors"
                    >
                      <div className="aspect-video flex items-center justify-center overflow-hidden bg-black-900">
                        {item.mime_type.startsWith('image/') ? (
                          <img src={item.public_url} alt="" className="w-full h-full object-cover" />
                        ) : item.mime_type.startsWith('video/') ? (
                          <div className="flex flex-col items-center gap-1 text-gray-500">
                            <Video size={24} />
                            <span className="text-xs">Vidéo</span>
                          </div>
                        ) : (
                          <FileText size={24} className="text-gray-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate p-1.5">{item.original_filename}</p>
                      <div className="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye size={20} className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main AdminMedia page ──────────────────────────────────────────────────

export default function AdminMedia() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'images' | 'videos' | 'documents'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadMedia(); }, []);

  // Global window drag-over for dropping files anywhere on the page
  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) setIsDragging(true);
    };
    const onDragLeave = (e: DragEvent) => {
      if (!e.relatedTarget) setIsDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer?.files.length) handleFiles(e.dataTransfer.files);
    };
    const onDragOver = (e: DragEvent) => e.preventDefault();

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    window.addEventListener('dragover', onDragOver);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('dragover', onDragOver);
    };
  }, []);

  async function loadMedia() {
    try {
      const res = await fetch(`${ADMIN_API_URL}/media`, { headers: apiHeaders });
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (!arr.length) return;

    setUploads(arr.map(f => ({ filename: f.name, progress: 0, status: 'uploading' })));

    for (let i = 0; i < arr.length; i++) {
      try {
        await uploadSingle(arr[i], (pct) => {
          setUploads(prev => prev.map((u, idx) => idx === i ? { ...u, progress: pct } : u));
        });
        setUploads(prev => prev.map((u, idx) => idx === i ? { ...u, progress: 100, status: 'done' } : u));
      } catch (e) {
        setUploads(prev => prev.map((u, idx) =>
          idx === i ? { ...u, status: 'error', error: (e as Error).message } : u
        ));
      }
    }

    await loadMedia();
    setTimeout(() => setUploads([]), 3000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce fichier définitivement ?')) return;
    try {
      await fetch(`${ADMIN_API_URL}/media/${id}`, { method: 'DELETE', headers: apiHeaders });
      setMedia(prev => prev.filter(m => m.id !== id));
    } catch { /* ignore */ }
  }

  async function updateMedia(m: Media) {
    try {
      await fetch(`${ADMIN_API_URL}/media/${m.id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ alt_text: m.alt_text, title: m.title }),
      });
      setEditingMedia(null);
      setMedia(prev => prev.map(item => item.id === m.id ? { ...item, ...m } : item));
    } catch { /* ignore */ }
  }

  function copyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatSize(bytes: number) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  const filteredMedia = media
    .filter(m => {
      if (filter === 'images') return m.mime_type.startsWith('image/');
      if (filter === 'videos') return m.mime_type.startsWith('video/');
      if (filter === 'documents') return !m.mime_type.startsWith('image/') && !m.mime_type.startsWith('video/');
      return true;
    })
    .filter(m =>
      m.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.alt_text || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="p-8 relative">
      {/* Global drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-none">
          <div className="border-2 border-dashed border-gold rounded-2xl p-16 text-center">
            <Upload size={64} className="text-gold mx-auto mb-4" />
            <p className="text-white font-serif text-2xl">Déposer pour téléverser</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl text-white">Médiathèque</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">
            {media.length} fichiers — {formatSize(media.reduce((s, m) => s + (m.size_bytes || 0), 0))} utilisés
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,application/pdf"
            onChange={e => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-gold flex items-center gap-2"
          >
            <Upload size={16} />
            Téléverser
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className="mb-6 border-2 border-dashed border-black-600 hover:border-black-500 rounded-xl p-8 text-center cursor-pointer transition-colors group"
      >
        <Upload size={32} className="mx-auto mb-2 text-gray-600 group-hover:text-gray-500 transition-colors" />
        <p className="text-sm text-gray-500 group-hover:text-gray-400">Glisser des fichiers ici ou <span className="text-gold">cliquer pour sélectionner</span></p>
        <p className="text-xs text-gray-600 mt-1">Images (JPG, PNG, WebP, GIF), Vidéos (MP4, WebM), PDF — max 50 MB</p>
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="mb-6 space-y-2">
          {uploads.map((u, i) => (
            <div key={i} className="bg-black-700 border border-black-600 rounded-lg p-3 flex items-center gap-3">
              {u.status === 'error' ? (
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              ) : u.status === 'done' ? (
                <Check size={16} className="text-green-400 flex-shrink-0" />
              ) : (
                <Loader2 size={16} className="animate-spin text-gold flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white truncate">{u.filename}</span>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {u.status === 'error' ? <span className="text-red-400">{u.error}</span> :
                     u.status === 'done' ? 'Terminé' : `${u.progress}%`}
                  </span>
                </div>
                <div className="h-1.5 bg-black-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      u.status === 'error' ? 'bg-red-500' :
                      u.status === 'done' ? 'bg-green-500' : 'bg-gold'
                    }`}
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + search */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-black-700 border border-black-600 rounded px-3 py-2 flex-1 max-w-sm">
          <Search size={15} className="text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none flex-1"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'images', 'videos', 'documents'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${filter === f ? 'bg-gold/20 text-gold' : 'text-gray-500 hover:text-white'}`}
            >
              {f === 'all' ? 'Tous' : f === 'images' ? 'Images' : f === 'videos' ? 'Vidéos' : 'Docs'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'text-gold bg-gold/10' : 'text-gray-500 hover:text-white'}`}>
            <Grid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'text-gold bg-gold/10' : 'text-gray-500 hover:text-white'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Media items */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-gold" size={28} />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-16 bg-black-700 border border-black-600 rounded-xl">
          <ImageIcon size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500">Aucun média trouvé</p>
          <button onClick={() => fileInputRef.current?.click()} className="btn-outline-gold mt-4 text-sm">
            Téléverser un fichier
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map(item => (
            <div key={item.id} className="bg-black-700 border border-black-600 rounded-lg overflow-hidden group hover:border-gold/40 transition-colors">
              <div
                className="aspect-video bg-black-900 flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => setPreviewMedia(item)}
              >
                {item.mime_type.startsWith('image/') ? (
                  <img src={item.public_url} alt={item.alt_text || ''} className="w-full h-full object-cover" />
                ) : item.mime_type.startsWith('video/') ? (
                  <div className="flex flex-col items-center gap-1 text-gray-500">
                    <Video size={28} />
                    <span className="text-xs">MP4</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-500">
                    <FileText size={28} />
                    <span className="text-xs">PDF</span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs text-white truncate">{item.original_filename}</p>
                <p className="text-xs text-gray-600 mt-0.5">{formatSize(item.size_bytes)}</p>
              </div>
              <div className="flex border-t border-black-600">
                <button
                  onClick={() => copyUrl(item.public_url, item.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 hover:text-gold transition-colors"
                  title="Copier l'URL"
                >
                  {copied === item.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                </button>
                <button
                  onClick={() => setEditingMedia({ ...item })}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 hover:text-gold transition-colors"
                  title="Modifier"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black-700 border border-black-600 rounded-lg overflow-hidden">
          {filteredMedia.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-3 border-b border-black-600 last:border-b-0 hover:bg-black-600/30 transition-colors">
              <div className="w-14 h-10 flex-shrink-0 bg-black-800 rounded overflow-hidden flex items-center justify-center">
                {item.mime_type.startsWith('image/') ? (
                  <img src={item.public_url} alt="" className="w-full h-full object-cover" />
                ) : item.mime_type.startsWith('video/') ? (
                  <Video size={18} className="text-gray-500" />
                ) : (
                  <FileText size={18} className="text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.original_filename}</p>
                <p className="text-xs text-gray-500">{formatSize(item.size_bytes)} · {item.mime_type}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyUrl(item.public_url, item.id)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gold transition-colors flex items-center gap-1"
                >
                  {copied === item.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copied === item.id ? 'Copié' : 'URL'}
                </button>
                <button onClick={() => setPreviewMedia(item)} className="p-1.5 text-gray-500 hover:text-gold transition-colors">
                  <Eye size={15} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setPreviewMedia(null)}>
          <div className="max-w-4xl max-h-[90vh] p-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black-700 rounded-full flex items-center justify-center text-white hover:bg-black-600"
            >
              <X size={18} />
            </button>
            {previewMedia.mime_type.startsWith('image/') ? (
              <img src={previewMedia.public_url} alt={previewMedia.alt_text || ''} className="max-w-full max-h-[80vh] object-contain rounded" />
            ) : previewMedia.mime_type.startsWith('video/') ? (
              <video src={previewMedia.public_url} controls autoPlay className="max-w-full max-h-[80vh] rounded" />
            ) : (
              <div className="bg-black-700 p-12 rounded text-center">
                <FileText size={64} className="mx-auto text-gray-500 mb-4" />
                <p className="text-white">{previewMedia.original_filename}</p>
                <a href={previewMedia.public_url} target="_blank" rel="noopener noreferrer" className="btn-gold mt-4 inline-block">
                  Télécharger
                </a>
              </div>
            )}
            <div className="mt-3 text-center">
              <p className="text-white text-sm">{previewMedia.original_filename}</p>
              <p className="text-gray-500 text-xs mt-0.5">{formatSize(previewMedia.size_bytes)}</p>
              <button
                onClick={() => copyUrl(previewMedia.public_url, previewMedia.id)}
                className="mt-2 text-xs text-gold hover:text-gold-400 flex items-center gap-1 mx-auto"
              >
                <Copy size={11} />
                {copied === previewMedia.id ? 'Copié !' : 'Copier URL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-black-700 border border-black-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-serif text-xl text-white mb-4">Modifier le média</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-1.5">Titre</label>
                <input
                  type="text"
                  value={editingMedia.title || ''}
                  onChange={e => setEditingMedia({ ...editingMedia, title: e.target.value })}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-1.5">Texte alternatif</label>
                <input
                  type="text"
                  value={editingMedia.alt_text || ''}
                  onChange={e => setEditingMedia({ ...editingMedia, alt_text: e.target.value })}
                  className="input-admin"
                  placeholder="Description de l'image pour l'accessibilité"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditingMedia(null)} className="px-4 py-2 text-gray-400 hover:text-white">Annuler</button>
              <button onClick={() => updateMedia(editingMedia)} className="btn-gold">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
