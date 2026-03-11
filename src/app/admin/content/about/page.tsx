'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Save, Loader2, CheckCircle2, Plus, Edit2, Trash2, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeamMember { initials: string; name: string; role: string; bio: string; }
interface AboutContent {
  team: TeamMember[];
  ourMission: string[];
  whatWeDo: string[];
  whoItsFor: string[];
}
const DEFAULTS: AboutContent = {
  team: [
    { initials: 'RM', name: 'Ricky Mark Okello', role: 'Co-Founder', bio: 'Domain industry veteran with 8+ years of experience in web hosting and domain registration.' },
    { initials: 'SM', name: 'Shadrack Mark Emadau', role: 'CTO', bio: 'Full-stack developer passionate about building tools that make domain management simpler.' },
    { initials: 'MN', name: 'Maria Nyaduse', role: 'Head of Support', bio: 'Customer experience expert dedicated to making sure every user gets the best help possible.' },
  ],
  ourMission: ['To make domain registration affordable for everyone in Africa', 'To provide transparent pricing with no hidden renewal fees', 'To empower businesses with the tools they need to succeed online'],
  whatWeDo: ['Compare domain prices across multiple registrars', 'Show real renewal prices upfront — no bait-and-switch', 'Provide tools to manage and transfer domains efficiently'],
  whoItsFor: ['Startups and small businesses looking for affordable domains', 'Developers who want straightforward domain management', 'Bloggers and creators building their online presence'],
};

const MEMBER_EMPTY: TeamMember = { initials: '', name: '', role: '', bio: '' };

export default function AboutPageEditor() {
  const [data, setData] = useState<AboutContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [memberModal, setMemberModal] = useState<{ open: boolean; idx: number | null; form: TeamMember }>({ open: false, idx: null, form: MEMBER_EMPTY });

  useEffect(() => {
    fetch('/api/admin/content?section=about').then(r => r.json())
      .then(d => setData({ team: d?.team ?? DEFAULTS.team, ourMission: d?.ourMission ?? DEFAULTS.ourMission, whatWeDo: d?.whatWeDo ?? DEFAULTS.whatWeDo, whoItsFor: d?.whoItsFor ?? DEFAULTS.whoItsFor }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'about', data }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  function openAddMember() { setMemberModal({ open: true, idx: null, form: MEMBER_EMPTY }); }
  function openEditMember(i: number) { setMemberModal({ open: true, idx: i, form: { ...data.team[i] } }); }
  function closeMemberModal() { setMemberModal({ open: false, idx: null, form: MEMBER_EMPTY }); }
  function saveMember() {
    if (!memberModal.form.name.trim()) return;
    if (memberModal.idx !== null) {
      setData(prev => ({ ...prev, team: prev.team.map((m, i) => i === memberModal.idx ? memberModal.form : m) }));
    } else {
      setData(prev => ({ ...prev, team: [...prev.team, memberModal.form] }));
    }
    closeMemberModal();
  }
  function deleteMember(i: number) { setData(prev => ({ ...prev, team: prev.team.filter((_, idx) => idx !== i) })); }

  function updateList(key: keyof AboutContent, idx: number, val: string) {
    setData(prev => ({ ...prev, [key]: (prev[key] as string[]).map((v, i) => i === idx ? val : v) }));
  }
  function addListItem(key: keyof AboutContent) { setData(prev => ({ ...prev, [key]: [...(prev[key] as string[]), ''] })); }
  function removeListItem(key: keyof AboutContent, idx: number) { setData(prev => ({ ...prev, [key]: (prev[key] as string[]).filter((_, i) => i !== idx) })); }

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

  const colorMap: Record<string, string> = { A: 'bg-blue-500', B: 'bg-green-500', C: 'bg-purple-500', D: 'bg-orange-500', E: 'bg-pink-500', F: 'bg-indigo-500', G: 'bg-teal-500', H: 'bg-red-500', R: 'bg-blue-500', S: 'bg-purple-500', M: 'bg-green-500' };
  const getColor = (initials: string) => colorMap[initials[0]] ?? 'bg-gray-500';

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center"><Users className="h-5 w-5 text-purple-600" /></div>
          <div><h1 className="text-lg font-bold text-gray-900">About Page</h1><p className="text-xs text-gray-500">Single type · Edit team members and about content</p></div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Team Members */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Team Members</span>
            <Button size="sm" variant="outline" onClick={openAddMember} className="h-6 gap-1 text-xs"><Plus className="h-3 w-3" />Add</Button>
          </div>
          <div className="divide-y divide-gray-100">
            {data.team.map((member, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3 group">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getColor(member.initials || member.name)}`}>
                  {member.initials || member.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                  <p className="text-xs text-blue-600">{member.role}</p>
                  <p className="text-xs text-gray-400 truncate">{member.bio}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => openEditMember(i)} className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMember(i)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* List editors for mission / what we do / who it's for */}
        {([['ourMission', 'Our Mission', 'What we stand for'], ['whatWeDo', 'What We Do', 'Our key features and services'], ['whoItsFor', "Who It's For", 'Target audience segments']] as const).map(([key, title, hint]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</span>
                <span className="text-xs text-gray-400 ml-2">{hint}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => addListItem(key)} className="h-6 gap-1 text-xs"><Plus className="h-3 w-3" />Add</Button>
            </div>
            <div className="px-5 py-3 space-y-2">
              {(data[key] as string[]).map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gray-300 text-xs font-mono w-5 text-right shrink-0">{i + 1}.</span>
                  <input type="text" value={val} onChange={e => updateList(key, i, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <Button variant="ghost" size="sm" onClick={() => removeListItem(key, i)} className="h-7 w-7 p-0 text-gray-300 hover:text-red-500 shrink-0"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              {(data[key] as string[]).length === 0 && <p className="text-sm text-gray-400 py-2">No items yet. Click add to get started.</p>}
            </div>
          </div>
        ))}

        <p className="flex items-center gap-1.5 text-xs text-gray-400"><Info className="h-3.5 w-3.5" />Changes are saved to the content store.</p>
      </div>

      {/* Member modal */}
      <AnimatePresence>
        {memberModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{memberModal.idx !== null ? 'Edit Member' : 'Add Team Member'}</h2>
                <Button variant="ghost" size="sm" onClick={closeMemberModal} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
              </div>
              <div className="px-6 py-5 space-y-3">
                {([['name', 'Full name', true], ['initials', 'Initials (2-3 chars)'], ['role', 'Role / Title'], ['bio', 'Bio']] as const).map(([field, label, req]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
                    {field === 'bio' ? (
                      <textarea rows={3} value={memberModal.form[field]} onChange={e => setMemberModal(prev => ({ ...prev, form: { ...prev.form, [field]: e.target.value } }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    ) : (
                      <input type="text" value={memberModal.form[field]} onChange={e => setMemberModal(prev => ({ ...prev, form: { ...prev.form, [field]: e.target.value } }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={closeMemberModal}>Cancel</Button>
                <Button size="sm" onClick={saveMember} disabled={!memberModal.form.name.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {memberModal.idx !== null ? 'Save changes' : 'Add member'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
