"use client";

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

export default function BlogEditor() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('# New Post\n\nStart writing in Markdown...');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);

  async function handleUploadImage(file: File) {
    const buf = await file.arrayBuffer();
    const b64 = Buffer.from(buf).toString('base64');
    const payload = { filename: `${Date.now()}-${file.name}`, data: `data:${file.type};base64,${b64}` };
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data?.url) setFeaturedImage(data.url);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const post = {
        id: `post-${Date.now()}`,
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt,
        content,
        category: 'Guide',
        status,
        featuredImage,
        author: 'Admin',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min`,
        tags,
        metaDescription: excerpt,
      };

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      await res.json();
      alert('Saved');
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex gap-4">
          <input className="flex-1 p-3 rounded-lg border" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="w-64 p-3 rounded-lg border" placeholder="Slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>

        <input className="w-full p-3 rounded-lg border" placeholder="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm">Content (Markdown)</label>
              <span className="text-xs text-slate-500"> — Monaco editor</span>
            </div>
            <div className="border rounded-lg overflow-hidden h-[480px]">
              <Suspense fallback={<div className="p-4">Loading editor...</div>}>
                <MonacoEditor height="480" defaultLanguage="markdown" value={content} onChange={(value) => setContent(value || '')} />
              </Suspense>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm">Live Preview</label>
              <div className="flex items-center gap-2">
                <input className="p-2 rounded border" placeholder="tags (comma)" value={tags} onChange={(e) => setTags(e.target.value)} />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 rounded border">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="border rounded-lg p-4 h-[420px] overflow-auto bg-white">
              <Suspense fallback={<div>Rendering preview...</div>}>
                {/* @ts-ignore */}
                <ReactMarkdown>{content}</ReactMarkdown>
              </Suspense>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input type="file" accept="image/*" onChange={(e) => e.target.files && handleUploadImage(e.target.files[0])} />
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Post'}</Button>
            </div>

            {featuredImage && (
              <div className="mt-4">
                <img src={featuredImage} alt="featured" className="w-full rounded" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
