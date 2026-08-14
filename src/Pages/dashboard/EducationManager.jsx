import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { GraduationCap, Plus, Trash2, Pencil, X } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">{children}</div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, required = false, rows }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">{label}</label>
    {rows ? (
      <textarea value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows}
        className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 resize-y min-h-[80px]" />
    ) : (
      <input type="text" value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60" />
    )}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 w-full max-w-lg flex flex-col" style={{ maxHeight: 'calc(100vh - 24px)' }}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-20 pointer-events-none" />
      <div className="relative bg-[#0a0a1a] border border-white/12 rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  </div>
);

const emptyForm = () => ({ degree: '', institution: '', start_date: '', end_date: 'Now', description: '', order_index: 0 });

const EducationForm = ({ initial, onSubmit, onCancel, submitLabel, saving }) => {
  const [form, setForm] = useState(initial || emptyForm());
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-5 space-y-4">
      <InputField label="Degree / Program" value={form.degree} onChange={set('degree')} placeholder="Master's Degree in ..." required />
      <InputField label="Institution" value={form.institution} onChange={set('institution')} placeholder="Politeknik Elektronika Negeri Surabaya" required />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Start Date" value={form.start_date} onChange={set('start_date')} placeholder="July 2025" required />
        <InputField label="End Date" value={form.end_date} onChange={set('end_date')} placeholder="Now or May 2025" required />
      </div>
      <InputField label="Order Index" value={String(form.order_index ?? 0)} onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value, 10) || 0 }))} placeholder="0" />
      <InputField label="Description (optional)" value={form.description || ''} onChange={set('description')} placeholder="Brief description..." rows={3} />
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 border border-white/10 text-gray-400 rounded-xl text-sm hover:text-white">Cancel</button>
      </div>
    </form>
  );
};

export default function EducationManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('portfolio_education').select('*').order('order_index', { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    await supabase.from('portfolio_education').insert({
      degree: form.degree,
      institution: form.institution,
      start_date: form.start_date,
      end_date: form.end_date,
      description: form.description || null,
      order_index: Number(form.order_index) || 0,
    });
    setSaving(false);
    setShowCreate(false);
    fetchItems();
  };

  const handleEdit = async (form) => {
    setSaving(true);
    await supabase.from('portfolio_education').update({
      degree: form.degree,
      institution: form.institution,
      start_date: form.start_date,
      end_date: form.end_date,
      description: form.description || null,
      order_index: Number(form.order_index) || 0,
    }).eq('id', editItem.id);
    setSaving(false);
    setEditItem(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this education entry?')) return;
    await supabase.from('portfolio_education').delete().eq('id', id);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
            <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Education</h1>
            <p className="text-gray-500 text-xs">{loading ? 'Loading...' : `${items.length} entries`}</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)}</div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white text-sm leading-snug">{item.degree}</h3>
                  <p className="text-indigo-300/80 text-sm">{item.institution}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.start_date} — {item.end_date}</p>
                  {item.description && <p className="text-gray-400 text-xs mt-2 line-clamp-2">{item.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditItem(item)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-500/25 text-indigo-400 text-xs hover:bg-indigo-500/10">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Add Education" onClose={() => setShowCreate(false)}>
          <EducationForm initial={emptyForm()} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} submitLabel="Create" saving={saving} />
        </Modal>
      )}
      {editItem && (
        <Modal title="Edit Education" onClose={() => setEditItem(null)}>
          <EducationForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} submitLabel="Save Changes" saving={saving} />
        </Modal>
      )}
    </div>
  );
}
