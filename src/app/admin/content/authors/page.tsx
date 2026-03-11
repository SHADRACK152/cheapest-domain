'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Author {
  id: string; name: string; role: string; bio: string;
  email: string; twitter?: string; avatar?: string; createdAt?: string;
}
const EMPTY: Omit<Author, 'id' | 'createdAt'> = { name: '', role: '', bio: '', email: '', twitter: '' };

function colorFromName(name: string) {
  const colors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-indigo-500'];
  return colors[name.charCodeAt(0) % colors.length];
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Author | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Omit<Author, 'id' | 'createdAt'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/collections/authors').then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAuthors(d); })
      .finally(() => setLoading(false));
  }, []);

  function openAdd() { setForm(EMPTY); setModal({ open: true, editing: null }); }
  function openEdit(a: Author) { setForm({ name: a.name, role: a.role, bio: a.bio, email: a.email, twitter: a.twitter ?? '' }); setModal({ open: true, editing: a }); }
  function closeModal() { setModal({ open: false, editing: null }); }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal.editing) {
        const res = await fetch(`/api/admin/collections/authors`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...modal.editing, ...form }) });
        const updated = await res.json();
        setAuthors(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        const res = await fetch(`/api/admin/collections/authors`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const created = await res.json();
        setAuthors(prev => [...prev, created]);
      }
      closeModal();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this author?')) return;
    await fetch(`/api/admin/collections/authors?id=${id}`, { method: 'DELETE' });
    setAuthors(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Author</h1>
            <p className="text-sm text-gray-500 mt-0.5">{authors.length} {authors.length === 1 ? 'entry' : 'entries'}</p>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" /> Add new
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No authors yet</p>
            <Button size="sm" onClick={openAdd} className="mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="h-3.5 w-3.5" />Add first author</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {authors.map(author => (
              <motion.div key={author.id} layout className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow group">
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0', colorFromName(author.name))}>
                    {author.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{author.name}</p>
                    <p className="text-xs text-blue-600">{author.role}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{author.bio}</p>
                    {author.email && <p className="text-xs text-gray-400 mt-1.5 truncate">{author.email}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(author)} className="gap-1 text-xs text-gray-500 hover:text-blue-600 h-7 px-2">
                    <Edit2 className="h-3 w-3" />Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(author.id)} className="gap-1 text-xs text-gray-500 hover:text-red-500 h-7 px-2">
                    <Trash2 className="h-3 w-3" />Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{modal.editing ? 'Edit Author' : 'New Author'}</h2>
                <Button variant="ghost" size="sm" onClick={closeModal} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
              </div>
              <div className="px-6 py-5 space-y-4">
                {[
                  { label: 'Name', key: 'name', placeholder: 'Full name', required: true },
                  { label: 'Role', key: 'role', placeholder: 'e.g. Co-Founder, Editor' },
                  { label: 'Email', key: 'email', placeholder: 'author@example.com' },
                  { label: 'Twitter', key: 'twitter', placeholder: '@handle' },
                ].map(({ label, key, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
                    <input type="text" placeholder={placeholder}
                      value={(form as Record<string, string>)[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bio</label>
                  <textarea rows={3} placeholder="Short bio…" value={form.bio}
                    onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !form.name.trim()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {modal.editing ? 'Save changes' : 'Create author'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
