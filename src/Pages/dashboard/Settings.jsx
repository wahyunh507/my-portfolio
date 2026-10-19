import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import Swal from 'sweetalert2';
import { Settings as SettingsIcon, Plus, Trash2, Save, Upload, ImageIcon, FileText } from 'lucide-react';

const BUCKET = 'portfolio-assets';

const Card = ({ children, className = '' }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
      {children}
    </div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false, rows }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
      {label}
    </label>
    {rows ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-y min-h-[100px]"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
      />
    )}
  </div>
);

const emptySkill = () => ({ icon: '', language: '' });

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Deterministic paths + upsert keep storage clean (old files are overwritten)
const uploadToStorage = async (file, path) => {
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [form, setForm] = useState({
    hero_title: '',
    hero_subtitle: '',
    about_text: '',
    email: '',
    github_url: '',
    linkedin_url: '',
    profile_image_url: '',
    cv_url: '',
    skills: [emptySkill()],
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      Swal.fire({ icon: 'error', title: 'Load failed', text: error.message, confirmButtonColor: '#6366f1' });
    } else if (data) {
      setForm({
        hero_title: data.hero_title || '',
        hero_subtitle: data.hero_subtitle || '',
        about_text: data.about_text || '',
        email: data.email || '',
        github_url: data.github_url || '',
        linkedin_url: data.linkedin_url || '',
        profile_image_url: data.profile_image_url || '',
        cv_url: data.cv_url || '',
        skills: Array.isArray(data.skills_json) && data.skills_json.length
          ? data.skills_json
          : [emptySkill()],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSkill = (index, field, value) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const addSkill = () => setForm((f) => ({ ...f, skills: [...f.skills, emptySkill()] }));

  const removeSkill = (index) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.length > 1 ? f.skills.filter((_, i) => i !== index) : f.skills,
    }));

  const handleProfileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      Swal.fire({ icon: 'warning', title: 'Invalid file', text: 'Please select a JPEG, PNG, or WebP image.', confirmButtonColor: '#6366f1' });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      Swal.fire({ icon: 'warning', title: 'File too large', text: 'Profile photo must be under 2MB.', confirmButtonColor: '#6366f1' });
      return;
    }
    setUploadingProfile(true);
    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const publicUrl = await uploadToStorage(file, `profile/avatar.${ext}`);
      setForm((f) => ({ ...f, profile_image_url: publicUrl }));
      Swal.fire({ icon: 'success', title: 'Photo uploaded', text: 'Click Save Settings to publish.', confirmButtonColor: '#6366f1', timer: 2000, timerProgressBar: true });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload failed', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setUploadingProfile(false);
      e.target.value = '';
    }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      Swal.fire({ icon: 'warning', title: 'Invalid file', text: 'Please select a PDF file.', confirmButtonColor: '#6366f1' });
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      Swal.fire({ icon: 'warning', title: 'File too large', text: 'CV must be under 5MB.', confirmButtonColor: '#6366f1' });
      return;
    }
    setUploadingCv(true);
    try {
      const publicUrl = await uploadToStorage(file, 'cv/CV_Wahyu_Nur_Hidayat.pdf');
      setForm((f) => ({ ...f, cv_url: publicUrl }));
      Swal.fire({ icon: 'success', title: 'CV uploaded', text: 'Click Save Settings to publish.', confirmButtonColor: '#6366f1', timer: 2000, timerProgressBar: true });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload failed', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setUploadingCv(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const skills_json = form.skills.filter((s) => s.icon.trim() || s.language.trim());

    const { error } = await supabase
      .from('portfolio_settings')
      .update({
        hero_title: form.hero_title,
        hero_subtitle: form.hero_subtitle,
        about_text: form.about_text,
        email: form.email,
        github_url: form.github_url,
        linkedin_url: form.linkedin_url,
        profile_image_url: form.profile_image_url || null,
        cv_url: form.cv_url || null,
        skills_json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    setSaving(false);

    if (error) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: error.message, confirmButtonColor: '#6366f1' });
      return;
    }

    Swal.fire({
      title: 'Saved!',
      text: 'Portfolio settings updated successfully.',
      icon: 'success',
      confirmButtonColor: '#6366f1',
      timer: 2000,
      timerProgressBar: true,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-indigo-400" />
        <div>
          <h1 className="text-xl font-semibold text-white">General Settings</h1>
          <p className="text-sm text-gray-500">Manage hero, about, skills, contact, profile photo, and CV</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Hero Title (Name)" value={form.hero_title} onChange={set('hero_title')} placeholder="Wahyu Nur Hidayat" required />
            <InputField label="Hero Subtitle (Role)" value={form.hero_subtitle} onChange={set('hero_subtitle')} placeholder="Full-stack Developer & IoT Researcher" required />
          </div>
          <p className="text-xs text-gray-500 -mt-2">Use | to separate multiple typewriter phrases (e.g. Role A | Role B)</p>

          <InputField label="About Text" value={form.about_text} onChange={set('about_text')} placeholder="Your bio..." rows={5} required />

          {/* Profile Photo & CV Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/8">
            <div className="space-y-3">
              <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" /> Profile Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 shrink-0">
                  {form.profile_image_url ? (
                    <img src={form.profile_image_url} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfileUpload} className="hidden" disabled={uploadingProfile} />
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 text-sm text-gray-300 hover:border-indigo-500/40 hover:text-white transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploadingProfile ? 'Uploading...' : 'Upload Photo'}
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-1">JPEG / PNG / WebP · max 2MB</p>
                </label>
              </div>
              {form.profile_image_url && (
                <p className="text-xs text-gray-500 truncate">{form.profile_image_url}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> CV Document (PDF)
              </label>
              <label className="block cursor-pointer">
                <input type="file" accept="application/pdf,.pdf" onChange={handleCvUpload} className="hidden" disabled={uploadingCv} />
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 text-sm text-gray-300 hover:border-indigo-500/40 hover:text-white transition-colors">
                  <Upload className="w-4 h-4" />
                  {uploadingCv ? 'Uploading...' : form.cv_url ? 'Replace CV (PDF)' : 'Upload CV (PDF)'}
                </div>
                <p className="text-center text-xs text-gray-500 mt-1">PDF · max 5MB</p>
              </label>
              {form.cv_url ? (
                <a href={form.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 truncate block">
                  {form.cv_url}
                </a>
              ) : (
                <p className="text-xs text-gray-500">No CV uploaded yet. The public Download button will show a &quot;CV is being updated&quot; toast.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Contact Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            <InputField label="GitHub URL" value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/username" />
            <InputField label="LinkedIn URL" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/username" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">Skills (Tech Stack)</label>
              <button type="button" onClick={addSkill} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                <Plus className="w-3.5 h-3.5" /> Add skill
              </button>
            </div>
            <p className="text-xs text-gray-500">Icon filename must match a file in /public (e.g. reactjs.svg)</p>
            {form.skills.map((skill, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <InputField label="Icon file" value={skill.icon} onChange={(e) => updateSkill(index, 'icon', e.target.value)} placeholder="reactjs.svg" />
                </div>
                <div className="flex-1">
                  <InputField label="Language" value={skill.language} onChange={(e) => updateSkill(index, 'language', e.target.value)} placeholder="ReactJS" />
                </div>
                <button type="button" onClick={() => removeSkill(index)} className="p-2.5 mb-0.5 text-red-400 hover:text-red-300 border border-white/10 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving || uploadingProfile || uploadingCv}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-medium hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </Card>
    </div>
  );
}
