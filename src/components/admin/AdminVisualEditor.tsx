import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save, Check, Loader2, Monitor, Tablet, Smartphone,
  ChevronDown, ChevronUp, Eye, EyeOff, Undo2, Redo2,
  Image as ImageIcon, Type, Palette, AlignLeft,
  AlignCenter, AlignRight, Upload, Trash2,
  GripVertical, Settings, Globe, RefreshCw,
  ChevronRight, Layers, Sliders, Video, FileImage,
  CornerDownRight,
} from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';
import type { SiteSettings } from '../../context/SiteSettingsContext';
import { defaultSettings } from '../../context/SiteSettingsContext';
import { uploadSingle } from './AdminMedia';

// ─── Types ────────────────────────────────────────────────────────────────────

type Device = 'desktop' | 'tablet' | 'mobile';

interface Section {
  id: string;
  key: string;
  name: string;
  is_visible: boolean;
  sort_order: number;
  background_image_url?: string;
  background_video_url?: string;
}

interface HistoryEntry {
  draft: Partial<SiteSettings>;
  sections: Section[];
}

// ─── Panel component ──────────────────────────────────────────────────────────

function Panel({ title, children, icon: Icon, defaultOpen = true }: {
  title: string; children: React.ReactNode; icon?: React.ElementType; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#1f1f1f] last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={13} className="text-[#c9a227]" />}
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-300">{title}</span>
        </div>
        {open ? <ChevronDown size={13} className="text-gray-600" /> : <ChevronRight size={13} className="text-gray-600" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, multiline = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const cls = "w-full bg-[#111] border border-[#2a2a2a] text-gray-200 text-xs px-3 py-2 rounded focus:outline-none focus:border-[#c9a227]/50 transition-colors placeholder-gray-700";
  if (multiline) {
    return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={cls + " resize-none"} rows={3} />;
  }
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function RangeSlider({ label, value, onChange, min = 0, max = 100, unit = '' }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 accent-[#c9a227]" />
        <span className="text-xs text-[#c9a227] w-12 text-right font-mono">{value}{unit}</span>
      </div>
    </Field>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 flex-shrink-0 rounded border border-[#2a2a2a] overflow-hidden">
          <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
          <div className="w-full h-full rounded" style={{ background: value || '#000000' }} />
        </div>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="#000000"
          className="flex-1 bg-[#111] border border-[#2a2a2a] text-gray-200 text-xs px-3 py-2 rounded focus:outline-none focus:border-[#c9a227]/50 font-mono" />
      </div>
    </Field>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-[#111] border border-[#2a2a2a] text-gray-200 text-xs px-3 py-2 rounded focus:outline-none focus:border-[#c9a227]/50 appearance-none">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
      </div>
    </Field>
  );
}

function ImageUploadField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true); setProgress(0);
    try {
      const r = await uploadSingle(file, setProgress);
      onChange(r.public_url);
    } catch (e) {
      console.error('Upload failed', e);
    } finally { setUploading(false); }
  }

  return (
    <Field label={label}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {value ? (
        <div className="relative group rounded overflow-hidden border border-[#2a2a2a]" style={{ height: '72px' }}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="p-1.5 bg-[#c9a227] text-black rounded hover:bg-[#b8911e] transition-colors">
              <RefreshCw size={11} />
            </button>
            <button type="button" onClick={() => onChange('')}
              className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-[#2a2a2a] hover:border-[#c9a227]/50 rounded py-4 flex flex-col items-center gap-1.5 transition-colors group">
          {uploading ? (
            <>
              <Loader2 size={16} className="text-[#c9a227] animate-spin" />
              <div className="w-24 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-[#c9a227] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <Upload size={16} className="text-gray-600 group-hover:text-[#c9a227] transition-colors" />
              <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">Cliquer pour uploader</span>
            </>
          )}
        </button>
      )}
    </Field>
  );
}

function AlignButtons({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Alignement">
      <div className="flex gap-1">
        {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as [string, React.ElementType][]).map(([v, Icon]) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-1.5 flex items-center justify-center rounded transition-colors ${
              value === v ? 'bg-[#c9a227] text-black' : 'bg-[#111] border border-[#2a2a2a] text-gray-500 hover:text-gray-300'
            }`}>
            <Icon size={13} />
          </button>
        ))}
      </div>
    </Field>
  );
}

function ToggleField({ label, value, onChange, description }: {
  label: string; value: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-xs text-gray-300">{label}</span>
        {description && <p className="text-[10px] text-gray-600 mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#c9a227]' : 'bg-[#2a2a2a]'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

// ─── Section nav item ─────────────────────────────────────────────────────────

function SectionNavItem({
  section, selected, onSelect, onToggle, onMove, total,
}: {
  section: Section; selected: boolean; onSelect: () => void;
  onToggle: () => void; onMove: (dir: 'up' | 'down') => void; total: number;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors rounded-lg mx-2 mb-0.5 ${
        selected ? 'bg-[#c9a227]/10 border border-[#c9a227]/30' : 'hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      <GripVertical size={12} className="text-gray-700 flex-shrink-0" />
      <span className={`flex-1 text-xs truncate ${selected ? 'text-[#c9a227]' : 'text-gray-400'}`}>{section.name}</span>
      <button type="button" onClick={e => { e.stopPropagation(); onMove('up'); }} disabled={section.sort_order <= 1}
        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-0 transition-all">
        <ChevronUp size={11} />
      </button>
      <button type="button" onClick={e => { e.stopPropagation(); onMove('down'); }} disabled={section.sort_order >= total}
        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-0 transition-all">
        <ChevronDown size={11} />
      </button>
      <button type="button" onClick={e => { e.stopPropagation(); onToggle(); }}
        className="p-0.5 transition-colors">
        {section.is_visible
          ? <Eye size={12} className="text-gray-500 hover:text-[#c9a227]" />
          : <EyeOff size={12} className="text-gray-700 hover:text-gray-400" />}
      </button>
    </div>
  );
}

// ─── Preview canvas ───────────────────────────────────────────────────────────

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

function PreviewCanvas({ draft, sections, device }: {
  draft: Partial<SiteSettings>; sections: Section[]; device: Device;
}) {
  // Don't let empty-string DB values override meaningful defaults
  const s = { ...defaultSettings };
  for (const [k, v] of Object.entries(draft)) {
    if (v !== null && v !== undefined && v !== '') {
      (s as Record<string, unknown>)[k] = v;
    }
  }
  const visibleSections = [...sections].filter(sec => sec.is_visible).sort((a, b) => a.sort_order - b.sort_order);

  const sectionBgUrl = (key: string) => {
    const sec = sections.find(x => x.key === key);
    return sec?.background_image_url || undefined;
  };

  const primaryColor = s.color_primary || '#c9a227';

  return (
    <div className="w-full h-full overflow-y-auto bg-[#050505] flex flex-col items-center">
      <div
        className="transition-all duration-300 w-full"
        style={{ maxWidth: DEVICE_WIDTHS[device], background: s.color_background || '#0a0a0a' }}
      >
        {visibleSections.map(section => {
          const bgUrl = sectionBgUrl(section.key);

          switch (section.key) {
            case 'navigation':
              return (
                <div key={section.key} className="sticky top-0 z-10 border-b border-white/5 px-6 py-4 flex items-center justify-between"
                  style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(8px)' }}>
                  <img src={s.logo_url || '/Le_logo_1_-removebg-preview_(1).png'} alt=""
                    style={{ height: `${Math.min(s.logo_height || 48, 48)}px` }} className="object-contain" />
                  {device !== 'mobile' && (
                    <div className="flex gap-6">
                      {[s.nav_item_1, s.nav_item_2, s.nav_item_3, s.nav_item_4, s.nav_item_5].filter(Boolean).map((item, i) => (
                        <span key={i} className="text-xs text-gray-300 tracking-widest uppercase font-sans">{item}</span>
                      ))}
                    </div>
                  )}
                </div>
              );

            case 'hero': {
              const titleSize = { '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60, '7xl': 72, '8xl': 96 }[s.hero_title_size || '6xl'] || 60;
              const align = s.hero_text_align || 'center';
              return (
                <div key={section.key} className="relative overflow-hidden flex items-center justify-center"
                  style={{ minHeight: 480, paddingTop: s.hero_padding_top, paddingBottom: s.hero_padding_bottom, backgroundImage: bgUrl ? `url(${bgUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {s.hero_background_url && !bgUrl && (
                    <img src={s.hero_background_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(s.hero_overlay_opacity ?? 50) / 100})` }} />
                  <div className={`relative z-10 px-8 max-w-3xl w-full text-${align}`}>
                    <p className="text-xs tracking-widest uppercase mb-3 font-sans" style={{ color: primaryColor }}>{s.hero_location}</p>
                    <div className="font-serif text-white leading-tight mb-5"
                      style={{ fontSize: titleSize, fontWeight: { light: 300, normal: 400, semibold: 600, bold: 700 }[s.hero_title_weight || 'light'] || 300 }}>
                      <div>{s.hero_title_line1}</div>
                      <div style={{ color: primaryColor }}>{s.hero_title_line2}</div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-8 max-w-xl font-serif"
                      style={{ marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0 }}>
                      {s.hero_subtitle}
                    </p>
                    <div className={`flex gap-4 flex-wrap ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
                      {s.hero_cta1_text && (
                        <div className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black font-sans cursor-pointer"
                          style={{ background: primaryColor }}>
                          {s.hero_cta1_text}
                        </div>
                      )}
                      {s.hero_cta2_text && (
                        <div className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white border font-sans cursor-pointer"
                          style={{ borderColor: primaryColor }}>
                          {s.hero_cta2_text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            case 'vehicules':
              return (
                <div key={section.key} className="py-16 px-6 text-center"
                  style={{ background: bgUrl ? `url(${bgUrl}) center/cover` : (s.section_vehicles_bg || '#0a0a0a') }}>
                  <p className="text-xs tracking-widest uppercase mb-3 font-sans" style={{ color: primaryColor }}>{s.vehicles_section_subtitle}</p>
                  <h2 className="font-serif text-2xl text-white font-light mb-4">{s.vehicles_section_title}</h2>
                  <p className="text-sm text-gray-400 max-w-xl mx-auto font-serif">{s.vehicles_section_tagline}</p>
                  <div className={`grid gap-3 mt-8 opacity-30 ${device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/5 rounded border border-white/5" />)}
                  </div>
                </div>
              );

            case 'depot-vente':
              return (
                <div key={section.key} className="py-16 px-6"
                  style={{ background: bgUrl ? `url(${bgUrl}) center/cover` : (s.section_depot_bg || '#111111') }}>
                  <p className="text-xs tracking-widest uppercase mb-2 font-sans" style={{ color: primaryColor }}>{s.depot_subtitle}</p>
                  <h2 className="font-serif text-2xl text-white font-light mb-3">{s.depot_title}</h2>
                  <p className="text-sm text-gray-400 max-w-lg mb-5 font-serif">{s.depot_description}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 border mb-4"
                    style={{ borderColor: `${primaryColor}50`, background: `${primaryColor}0d` }}>
                    <span className="text-xs font-semibold uppercase tracking-widest font-sans" style={{ color: primaryColor }}>{s.depot_badge_text}</span>
                  </div>
                  <br />
                  <div className="inline-block px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-black mt-2 font-sans cursor-pointer"
                    style={{ background: primaryColor }}>
                    {s.depot_cta_text}
                  </div>
                </div>
              );

            case 'temoignages':
              return (
                <div key={section.key} className="py-16 px-6 text-center"
                  style={{ background: bgUrl ? `url(${bgUrl}) center/cover` : (s.section_reviews_bg || '#111111') }}>
                  <p className="text-xs tracking-widest uppercase mb-3 font-sans" style={{ color: primaryColor }}>{s.reviews_section_subtitle}</p>
                  <h2 className="font-serif text-2xl text-white font-light mb-8">{s.reviews_section_title}</h2>
                  <div className={`grid gap-4 opacity-30 ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white/5 rounded border border-white/5" />)}
                  </div>
                </div>
              );

            case 'recherche':
              return (
                <div key={section.key} className="py-16 px-6"
                  style={{ background: bgUrl ? `url(${bgUrl}) center/cover` : (s.section_search_bg || '#0a0a0a') }}>
                  <p className="text-xs tracking-widest uppercase mb-2 font-sans" style={{ color: primaryColor }}>{s.search_section_subtitle}</p>
                  <h2 className="font-serif text-2xl text-white font-light mb-3">{s.search_section_title}</h2>
                  <p className="text-sm text-gray-400 max-w-lg font-serif">{s.search_section_description}</p>
                  <div className="inline-block mt-5 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-black font-sans cursor-pointer"
                    style={{ background: primaryColor }}>
                    {s.search_cta_text}
                  </div>
                </div>
              );

            case 'contact':
              return (
                <div key={section.key} className="py-16 px-6"
                  style={{ background: bgUrl ? `url(${bgUrl}) center/cover` : (s.section_contact_bg || '#0a0a0a') }}>
                  <p className="text-xs tracking-widest uppercase mb-2 font-sans" style={{ color: primaryColor }}>{s.contact_section_subtitle}</p>
                  <h2 className="font-serif text-2xl text-white font-light mb-6">{s.contact_section_title}</h2>
                  <div className={`grid gap-6 ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300 font-serif">{s.company_phone}</p>
                      <p className="text-xs text-gray-500 font-sans">{s.company_email}</p>
                      <p className="text-xs text-gray-500 font-sans">{s.company_address}, {s.company_city}</p>
                      <p className="text-[10px] text-gray-600 font-sans mt-2">{s.contact_availability}</p>
                    </div>
                    <div className="h-32 bg-white/5 rounded border border-white/5 opacity-30" />
                  </div>
                </div>
              );

            case 'footer':
              return (
                <div key={section.key} className="py-12 px-6 border-t border-white/10"
                  style={{ background: s.section_footer_bg || '#050505' }}>
                  <img src={s.logo_url || '/Le_logo_1_-removebg-preview_(1).png'} alt=""
                    style={{ height: '36px' }} className="object-contain mb-4 opacity-80" />
                  <p className="text-xs text-gray-500 max-w-xs mb-4 font-serif">{s.footer_tagline}</p>
                  <p className="text-[10px] text-gray-700 font-sans">{s.copyright_text}</p>
                </div>
              );

            default:
              return (
                <div key={section.key} className="py-10 px-6 border-t border-white/5">
                  <p className="text-xs text-gray-700 text-center">{section.name}</p>
                </div>
              );
          }
        })}
      </div>
    </div>
  );
}

// ─── Section background sub-panel ─────────────────────────────────────────────

function SectionBgPanel({ sectionKey, section, onSectionChange }: {
  sectionKey: string; section?: Section; onSectionChange: (key: string, patch: Partial<Section>) => void;
}) {
  return (
    <Panel title="Fond de section" icon={FileImage} defaultOpen={false}>
      <ImageUploadField label="Image de fond" value={section?.background_image_url || ''}
        onChange={v => onSectionChange(sectionKey, { background_image_url: v })} />
      <ToggleField label="Section visible" value={section?.is_visible ?? true}
        onChange={v => onSectionChange(sectionKey, { is_visible: v })} />
    </Panel>
  );
}

// ─── Property panels per section ─────────────────────────────────────────────

function PropertiesPanel({ sectionKey, draft, sections, onChange, onSectionChange }: {
  sectionKey: string | null;
  draft: Partial<SiteSettings>;
  sections: Section[];
  onChange: (patch: Partial<SiteSettings>) => void;
  onSectionChange: (key: string, patch: Partial<Section>) => void;
}) {
  const s = { ...defaultSettings, ...draft };
  const section = sections.find(x => x.key === sectionKey);

  if (!sectionKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 gap-3">
        <Layers size={32} className="text-gray-700" />
        <p className="text-xs text-gray-600">Sélectionnez une section dans le panneau de gauche</p>
      </div>
    );
  }

  switch (sectionKey) {
    case 'navigation':
      return (
        <div>
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Navigation</h3>
          </div>
          <Panel title="Logo" icon={ImageUploadField as any}>
            <ImageUploadField label="Logo" value={s.logo_url} onChange={v => onChange({ logo_url: v })} />
            <RangeSlider label="Hauteur du logo" value={s.logo_height} onChange={v => onChange({ logo_height: v })} min={20} max={120} unit="px" />
          </Panel>
          <Panel title="Liens de navigation" icon={Type}>
            {[1, 2, 3, 4, 5].map(i => (
              <Field key={i} label={`Lien ${i}`}>
                <Input value={(s as Record<string, string>)[`nav_item_${i}`] || ''} onChange={v => onChange({ [`nav_item_${i}`]: v } as Partial<SiteSettings>)} />
              </Field>
            ))}
          </Panel>
          <SectionBgPanel sectionKey={sectionKey} section={section} onSectionChange={onSectionChange} />
        </div>
      );

    case 'hero':
      return (
        <div>
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Hero</h3>
          </div>
          <Panel title="Textes" icon={Type}>
            <Field label="Ligne de titre 1">
              <Input value={s.hero_title_line1} onChange={v => onChange({ hero_title_line1: v })} />
            </Field>
            <Field label="Ligne de titre 2 (couleur)">
              <Input value={s.hero_title_line2} onChange={v => onChange({ hero_title_line2: v })} />
            </Field>
            <Field label="Sous-titre">
              <Input value={s.hero_subtitle} onChange={v => onChange({ hero_subtitle: v })} multiline />
            </Field>
            <Field label="Localisation">
              <Input value={s.hero_location} onChange={v => onChange({ hero_location: v })} placeholder="Ville, Région" />
            </Field>
          </Panel>
          <Panel title="Boutons CTA" icon={CornerDownRight}>
            <Field label="Bouton principal — texte">
              <Input value={s.hero_cta1_text} onChange={v => onChange({ hero_cta1_text: v })} />
            </Field>
            <Field label="Bouton principal — lien">
              <Input value={s.hero_cta1_href} onChange={v => onChange({ hero_cta1_href: v })} placeholder="#vehicules" />
            </Field>
            <Field label="Bouton secondaire — texte">
              <Input value={s.hero_cta2_text} onChange={v => onChange({ hero_cta2_text: v })} />
            </Field>
            <Field label="Bouton secondaire — lien">
              <Input value={s.hero_cta2_href} onChange={v => onChange({ hero_cta2_href: v })} placeholder="#contact" />
            </Field>
          </Panel>
          <Panel title="Typographie" icon={Type} defaultOpen={false}>
            <SelectField label="Taille du titre" value={s.hero_title_size} onChange={v => onChange({ hero_title_size: v })}
              options={['3xl','4xl','5xl','6xl','7xl','8xl'].map(v => ({ value: v, label: v }))} />
            <SelectField label="Graisse" value={s.hero_title_weight} onChange={v => onChange({ hero_title_weight: v })}
              options={[{ value: 'light', label: 'Light' }, { value: 'normal', label: 'Normal' }, { value: 'semibold', label: 'Semibold' }, { value: 'bold', label: 'Bold' }]} />
            <AlignButtons value={s.hero_text_align} onChange={v => onChange({ hero_text_align: v })} />
          </Panel>
          <Panel title="Image de fond" icon={ImageUploadField as any} defaultOpen={false}>
            <ImageUploadField label="Image de fond" value={s.hero_background_url} onChange={v => onChange({ hero_background_url: v })} />
            <RangeSlider label="Opacité overlay" value={s.hero_overlay_opacity} onChange={v => onChange({ hero_overlay_opacity: v })} min={0} max={100} unit="%" />
          </Panel>
          <Panel title="Vidéo de fond" icon={Video} defaultOpen={false}>
            <ToggleField label="Utiliser une vidéo" value={s.hero_use_video} onChange={v => onChange({ hero_use_video: v })} />
            <Field label="URL vidéo MP4">
              <Input value={s.hero_video_url} onChange={v => onChange({ hero_video_url: v })} placeholder="https://..." />
            </Field>
            <ToggleField label="Lecture automatique" value={s.hero_video_autoplay} onChange={v => onChange({ hero_video_autoplay: v })} />
            <ToggleField label="Boucle" value={s.hero_video_loop} onChange={v => onChange({ hero_video_loop: v })} />
          </Panel>
          <Panel title="Espacement" icon={Sliders} defaultOpen={false}>
            <RangeSlider label="Padding haut" value={s.hero_padding_top} onChange={v => onChange({ hero_padding_top: v })} min={0} max={300} unit="px" />
            <RangeSlider label="Padding bas" value={s.hero_padding_bottom} onChange={v => onChange({ hero_padding_bottom: v })} min={0} max={300} unit="px" />
          </Panel>
          <SectionBgPanel sectionKey={sectionKey} section={section} onSectionChange={onSectionChange} />
        </div>
      );

    case 'vehicules':
      return (
        <div>
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Section Véhicules</h3>
          </div>
          <Panel title="Textes" icon={Type}>
            <Field label="Sous-titre (badge)">
              <Input value={s.vehicles_section_subtitle} onChange={v => onChange({ vehicles_section_subtitle: v })} />
            </Field>
            <Field label="Titre principal">
              <Input value={s.vehicles_section_title} onChange={v => onChange({ vehicles_section_title: v })} />
            </Field>
            <Field label="Accroche">
              <Input value={s.vehicles_section_tagline} onChange={v => onChange({ vehicles_section_tagline: v })} multiline />
            </Field>
            <Field label="Texte bouton contact">
              <Input value={s.vehicles_contact_btn} onChange={v => onChange({ vehicles_contact_btn: v })} />
            </Field>
          </Panel>
          <Panel title="Fond de section" icon={FileImage} defaultOpen={false}>
            <ColorPicker label="Couleur de fond" value={s.section_vehicles_bg} onChange={v => onChange({ section_vehicles_bg: v })} />
            <ImageUploadField label="Image de fond" value={section?.background_image_url || ''}
              onChange={v => onSectionChange(sectionKey, { background_image_url: v })} />
            <ToggleField label="Section visible" value={section?.is_visible ?? true}
              onChange={v => onSectionChange(sectionKey, { is_visible: v })} />
          </Panel>
        </div>
      );

    case 'depot-vente':
      return (
        <div>
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Dépôt-Vente</h3>
          </div>
          <Panel title="Textes" icon={Type}>
            <Field label="Sous-titre (badge)">
              <Input value={s.depot_subtitle} onChange={v => onChange({ depot_subtitle: v })} />
            </Field>
            <Field label="Titre principal">
              <Input value={s.depot_title} onChange={v => onChange({ depot_title: v })} />
            </Field>
            <Field label="Description">
              <Input value={s.depot_description} onChange={v => onChange({ depot_description: v })} multiline />
            </Field>
            <Field label="Badge">
              <Input value={s.depot_badge_text} onChange={v => onChange({ depot_badge_text: v })} />
            </Field>
            <Field label="Bouton CTA">
              <Input value={s.depot_cta_text} onChange={v => onChange({ depot_cta_text: v })} />
            </Field>
            <Field label="Citation">
              <Input value={s.depot_quote} onChange={v => onChange({ depot_quote: v })} multiline />
            </Field>
          </Panel>
          <Panel title="Image décorative" icon={ImageUploadField as any} defaultOpen={false}>
            <ImageUploadField label="Image de fond bande" value={s.depot_background_url} onChange={v => onChange({ depot_background_url: v })} />
          </Panel>
          <Panel title="Fond de section" icon={FileImage} defaultOpen={false}>
            <ColorPicker label="Couleur de fond" value={s.section_depot_bg} onChange={v => onChange({ section_depot_bg: v })} />
            <ImageUploadField label="Image de fond" value={section?.background_image_url || ''}
              onChange={v => onSectionChange(sectionKey, { background_image_url: v })} />
            <ToggleField label="Section visible" value={section?.is_visible ?? true}
              onChange={v => onSectionChange(sectionKey, { is_visible: v })} />
          </Panel>
        </div>
      );

    case 'temoignages':
      return (
        <div>
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Témoignages</h3>
          </div>
          <Panel title="Textes" icon={Type}>
            <Field label="Sous-titre (badge)">
              <Input value={s.reviews_section_subtitle} onChange={v => onChange({ reviews_section_subtitle: v })} />
            </Field>
            <Field label="Titre principal">
              <Input value={s.reviews_section_title} onChange={v => onChange({ reviews_section_title: v })} />
            </Field>
          </Panel>
          <Panel title="Fond de section" icon={FileImage} defaultOpen={false}>
            <ColorPicker label="Couleur de fond" value={s.section_reviews_bg} onChange={v => onChange({ section_reviews_bg: v })} />
            <ImageUploadField label="Image de fond" value={section?.background_image_url || ''}
              onChange={v => onSectionChange(sectionKey, { background_image_url: v })} />
            <ToggleField label="Section visible" value={section?.is_visible ?? true}
              onChange={v => onSectionChange(sectionKey, { is_visible: v })} />
          </Panel>
        </div>
      );

    case 'recherche':
      return (
        <div>
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Recherche sur-mesure</h3>
          </div>
          <Panel title="Textes" icon={Type}>
            <Field label="Sous-titre (badge)">
              <Input value={s.search_section_subtitle} onChange={v => onChange({ search_section_subtitle: v })} />
            </Field>
            <Field label="Titre principal">
              <Input value={s.search_section_title} onChange={v => onChange({ search_section_title: v })} />
            </Field>
            <Field label="Description">
              <Input value={s.search_section_description} onChange={v => onChange({ search_section_description: v })} multiline />
            </Field>
            <Field label="Bouton CTA">
              <Input value={s.search_cta_text} onChange={v => onChange({ search_cta_text: v })} />
            </Field>
          </Panel>
          <Panel title="Fond de section" icon={FileImage} defaultOpen={false}>
            <ColorPicker label="Couleur de fond" value={s.section_search_bg} onChange={v => onChange({ section_search_bg: v })} />
            <ImageUploadField label="Image de fond" value={section?.background_image_url || ''}
              onChange={v => onSectionChange(sectionKey, { background_image_url: v })} />
            <ToggleField label="Section visible" value={section?.is_visible ?? true}
              onChange={v => onSectionChange(sectionKey, { is_visible: v })} />
          </Panel>
        </div>
      );

    case 'contact':
      return (
        <div>
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Contact</h3>
          </div>
          <Panel title="En-tête" icon={Type}>
            <Field label="Sous-titre (badge)">
              <Input value={s.contact_section_subtitle} onChange={v => onChange({ contact_section_subtitle: v })} />
            </Field>
            <Field label="Titre principal">
              <Input value={s.contact_section_title} onChange={v => onChange({ contact_section_title: v })} />
            </Field>
            <Field label="Disponibilité">
              <Input value={s.contact_availability} onChange={v => onChange({ contact_availability: v })} />
            </Field>
            <Field label="Délai de réponse">
              <Input value={s.contact_response_time} onChange={v => onChange({ contact_response_time: v })} multiline />
            </Field>
          </Panel>
          <Panel title="Coordonnées" icon={Globe}>
            <Field label="Téléphone">
              <Input value={s.company_phone} onChange={v => onChange({ company_phone: v })} />
            </Field>
            <Field label="Email">
              <Input value={s.company_email} onChange={v => onChange({ company_email: v })} />
            </Field>
            <Field label="Adresse">
              <Input value={s.company_address} onChange={v => onChange({ company_address: v })} />
            </Field>
            <Field label="Code postal">
              <Input value={s.company_postal_code} onChange={v => onChange({ company_postal_code: v })} />
            </Field>
            <Field label="Ville">
              <Input value={s.company_city} onChange={v => onChange({ company_city: v })} />
            </Field>
            <Field label="Région">
              <Input value={s.company_zone} onChange={v => onChange({ company_zone: v })} />
            </Field>
            <Field label="Google Maps embed URL">
              <Input value={s.google_maps_embed_url} onChange={v => onChange({ google_maps_embed_url: v })} placeholder="https://www.google.com/maps/embed..." />
            </Field>
          </Panel>
          <Panel title="Réseaux sociaux" icon={Globe} defaultOpen={false}>
            <Field label="Instagram URL">
              <Input value={s.social_instagram} onChange={v => onChange({ social_instagram: v })} />
            </Field>
            <Field label="Facebook URL">
              <Input value={s.social_facebook} onChange={v => onChange({ social_facebook: v })} />
            </Field>
            <Field label="TikTok URL">
              <Input value={s.social_tiktok} onChange={v => onChange({ social_tiktok: v })} />
            </Field>
          </Panel>
          <Panel title="Fond de section" icon={FileImage} defaultOpen={false}>
            <ColorPicker label="Couleur de fond" value={s.section_contact_bg} onChange={v => onChange({ section_contact_bg: v })} />
            <ImageUploadField label="Image de fond" value={section?.background_image_url || ''}
              onChange={v => onSectionChange(sectionKey, { background_image_url: v })} />
            <ToggleField label="Section visible" value={section?.is_visible ?? true}
              onChange={v => onSectionChange(sectionKey, { is_visible: v })} />
          </Panel>
        </div>
      );

    case 'footer':
      return (
        <div>
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Footer</h3>
          </div>
          <Panel title="Textes" icon={Type}>
            <Field label="Accroche">
              <Input value={s.footer_tagline} onChange={v => onChange({ footer_tagline: v })} multiline />
            </Field>
            <Field label="Texte CTA">
              <Input value={s.footer_cta_text} onChange={v => onChange({ footer_cta_text: v })} multiline />
            </Field>
            <Field label="Copyright">
              <Input value={s.copyright_text} onChange={v => onChange({ copyright_text: v })} />
            </Field>
          </Panel>
          <Panel title="Fond de section" icon={FileImage} defaultOpen={false}>
            <ColorPicker label="Couleur de fond" value={s.section_footer_bg} onChange={v => onChange({ section_footer_bg: v })} />
            <ToggleField label="Section visible" value={section?.is_visible ?? true}
              onChange={v => onSectionChange(sectionKey, { is_visible: v })} />
          </Panel>
        </div>
      );

    case '_global':
      return (
        <div>
          <div className="px-4 py-3 border-b border-[#1f1f1f]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Style global</h3>
          </div>
          <Panel title="Couleurs" icon={Palette}>
            <ColorPicker label="Couleur primaire (or)" value={s.color_primary} onChange={v => onChange({ color_primary: v })} />
            <ColorPicker label="Couleur secondaire" value={s.color_secondary} onChange={v => onChange({ color_secondary: v })} />
            <ColorPicker label="Fond général" value={s.color_background} onChange={v => onChange({ color_background: v })} />
            <ColorPicker label="Texte général" value={s.color_text} onChange={v => onChange({ color_text: v })} />
          </Panel>
          <Panel title="Logo global" icon={ImageUploadField as any}>
            <ImageUploadField label="Logo" value={s.logo_url} onChange={v => onChange({ logo_url: v })} />
            <RangeSlider label="Hauteur" value={s.logo_height} onChange={v => onChange({ logo_height: v })} min={20} max={160} unit="px" />
          </Panel>
          <Panel title="Identité" icon={Globe} defaultOpen={false}>
            <Field label="Nom de la société">
              <Input value={s.company_name} onChange={v => onChange({ company_name: v })} />
            </Field>
            <Field label="Slogan">
              <Input value={s.company_slogan} onChange={v => onChange({ company_slogan: v })} />
            </Field>
          </Panel>
        </div>
      );

    default:
      return (
        <div className="px-4 py-8 text-center">
          <p className="text-xs text-gray-600">Sélectionnez une section</p>
        </div>
      );
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminVisualEditor() {
  const [draft, setDraft] = useState<Partial<SiteSettings>>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [device, setDevice] = useState<Device>('desktop');
  const [selectedSection, setSelectedSection] = useState<string | null>('hero');
  const [leftTab, setLeftTab] = useState<'sections' | 'global'>('sections');

  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIdxRef = useRef(-1);
  const draftRef = useRef(draft);
  const sectionsRef = useRef(sections);
  const historyDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotBefore = useRef<HistoryEntry | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  const pushHistory = useCallback(() => {
    const entry = snapshotBefore.current;
    if (!entry) return;
    snapshotBefore.current = null;
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(entry);
    if (historyRef.current.length > 40) historyRef.current.shift();
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);

  const scheduleHistory = useCallback(() => {
    if (!snapshotBefore.current) {
      snapshotBefore.current = { draft: { ...draftRef.current }, sections: sectionsRef.current.map(s => ({ ...s })) };
    }
    if (historyDebounce.current) clearTimeout(historyDebounce.current);
    historyDebounce.current = setTimeout(pushHistory, 600);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIdxRef.current < 0) return;
    const entry = historyRef.current[historyIdxRef.current];
    historyIdxRef.current--;
    setDraft(entry.draft);
    setSections(entry.sections);
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    const entry = historyRef.current[historyIdxRef.current];
    setDraft(entry.draft);
    setSections(entry.sections);
  }, []);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await Promise.all([
          fetch(`${ADMIN_API_URL}/settings`, { method: 'PUT', headers: apiHeaders, body: JSON.stringify(draftRef.current) }),
          fetch(`${ADMIN_API_URL}/sections`, { method: 'PUT', headers: apiHeaders, body: JSON.stringify(sectionsRef.current) }),
        ]);
      } catch {}
    }, 5000);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, secRes] = await Promise.all([
          fetch(`${ADMIN_API_URL}/settings`, { headers: apiHeaders }),
          fetch(`${ADMIN_API_URL}/sections`, { headers: apiHeaders }),
        ]);
        const sData = await sRes.json();
        const secRaw = await secRes.json();
        setDraft(sData || {});
        // DB uses section_key/section_name; map to key/name for internal use
        const secData: Section[] = Array.isArray(secRaw) ? secRaw.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          key: (s.key ?? s.section_key) as string,
          name: (s.name ?? s.section_name) as string,
          is_visible: s.is_visible as boolean,
          sort_order: s.sort_order as number,
          background_image_url: s.background_image_url as string | undefined,
          background_video_url: s.background_video_url as string | undefined,
        })) : [];
        setSections(secData);
      } catch (e) {
        console.error('Load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (mod && e.key === 's') { e.preventDefault(); handleSave(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleChange = useCallback((patch: Partial<SiteSettings>) => {
    scheduleHistory();
    setDraft(prev => ({ ...prev, ...patch }));
    scheduleAutoSave();
    setSaved(false);
  }, [scheduleHistory, scheduleAutoSave]);

  const handleSectionChange = useCallback((key: string, patch: Partial<Section>) => {
    scheduleHistory();
    setSections(prev => prev.map(s => s.key === key ? { ...s, ...patch } : s));
    scheduleAutoSave();
    setSaved(false);
  }, [scheduleHistory, scheduleAutoSave]);

  const moveSection = useCallback((key: string, dir: 'up' | 'down') => {
    setSections(prev => {
      const sorted = [...prev].sort((a, b) => a.sort_order - b.sort_order);
      const idx = sorted.findIndex(s => s.key === key);
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const orderA = sorted[idx].sort_order;
      const orderB = sorted[swapIdx].sort_order;
      return prev.map(s => {
        if (s.key === sorted[idx].key) return { ...s, sort_order: orderB };
        if (s.key === sorted[swapIdx].key) return { ...s, sort_order: orderA };
        return s;
      });
    });
    scheduleAutoSave();
    setSaved(false);
  }, [scheduleAutoSave]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch(`${ADMIN_API_URL}/settings`, { method: 'PUT', headers: apiHeaders, body: JSON.stringify(draftRef.current) }),
        fetch(`${ADMIN_API_URL}/sections`, { method: 'PUT', headers: apiHeaders, body: JSON.stringify(sectionsRef.current) }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Save error', e);
    } finally {
      setSaving(false);
    }
  }, []);

  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);
  const canUndo = historyIdxRef.current >= 0;
  const canRedo = historyIdxRef.current < historyRef.current.length - 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="text-[#c9a227] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0d0d0d] flex-shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={!canUndo} title="Annuler (Ctrl+Z)"
            className="p-2 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors">
            <Undo2 size={14} />
          </button>
          <button onClick={redo} disabled={!canRedo} title="Rétablir (Ctrl+Y)"
            className="p-2 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors">
            <Redo2 size={14} />
          </button>
          <div className="w-px h-4 bg-[#2a2a2a] mx-1" />
          {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as [Device, React.ElementType][]).map(([d, Icon]) => (
            <button key={d} onClick={() => setDevice(d)}
              className={`p-2 rounded transition-colors ${device === d ? 'text-[#c9a227] bg-[#c9a227]/10' : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}`}>
              <Icon size={14} />
            </button>
          ))}
        </div>

        <span className="text-[10px] text-gray-600 font-sans tracking-wider uppercase">
          {device === 'desktop' ? 'Bureau' : device === 'tablet' ? 'Tablette' : 'Mobile'} · Ctrl+S pour sauvegarder
        </span>

        <button onClick={handleSave} disabled={saving}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all ${
            saved ? 'bg-green-600 text-white' : 'bg-[#c9a227] text-black hover:bg-[#b8911e]'
          } disabled:opacity-60`}>
          {saving ? <Loader2 size={12} className="animate-spin" />
            : saved ? <Check size={12} />
            : <Save size={12} />}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-52 flex-shrink-0 border-r border-[#1a1a1a] bg-[#0d0d0d] flex flex-col overflow-hidden">
          <div className="flex border-b border-[#1a1a1a]">
            <button onClick={() => setLeftTab('sections')}
              className={`flex-1 py-2.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                leftTab === 'sections' ? 'text-[#c9a227] border-b border-[#c9a227]' : 'text-gray-600 hover:text-gray-400'
              }`}>
              Sections
            </button>
            <button onClick={() => { setLeftTab('global'); setSelectedSection('_global'); }}
              className={`flex-1 py-2.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                leftTab === 'global' ? 'text-[#c9a227] border-b border-[#c9a227]' : 'text-gray-600 hover:text-gray-400'
              }`}>
              Global
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {leftTab === 'sections' ? (
              sortedSections.map(section => (
                <SectionNavItem
                  key={section.key}
                  section={section}
                  selected={selectedSection === section.key}
                  total={sortedSections.length}
                  onSelect={() => setSelectedSection(section.key)}
                  onToggle={() => handleSectionChange(section.key, { is_visible: !section.is_visible })}
                  onMove={dir => moveSection(section.key, dir)}
                />
              ))
            ) : (
              <div className="px-3 py-2">
                <button onClick={() => setSelectedSection('_global')}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    selectedSection === '_global' ? 'bg-[#c9a227]/10 border border-[#c9a227]/30 text-[#c9a227]' : 'text-gray-400 hover:bg-white/[0.04] border border-transparent'
                  }`}>
                  <Palette size={13} />
                  <span className="text-xs">Couleurs & identité</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center canvas */}
        <div className="flex-1 bg-[#050505] overflow-hidden relative">
          <div className="absolute inset-0 overflow-auto flex justify-center">
            <PreviewCanvas draft={draft} sections={sections} device={device} />
          </div>
          {device !== 'desktop' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 text-gray-500 text-[10px] px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
              {device === 'tablet' ? <Tablet size={11} /> : <Smartphone size={11} />}
              <span>{DEVICE_WIDTHS[device]}</span>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-64 flex-shrink-0 border-l border-[#1a1a1a] bg-[#0d0d0d] overflow-y-auto">
          <PropertiesPanel
            sectionKey={selectedSection}
            draft={draft}
            sections={sections}
            onChange={handleChange}
            onSectionChange={handleSectionChange}
          />
        </div>
      </div>
    </div>
  );
}
