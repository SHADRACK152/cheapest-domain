'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Upload, Image, FileText, Film, Music, Search, Grid3X3, List, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: 'image' | 'document' | 'video' | 'audio';
  uploadedAt: string;
}

const TYPE_ICONS = {
  image:    { icon: Image,    color: 'text-blue-600 bg-blue-50'    },
  document: { icon: FileText, color: 'text-green-600 bg-green-50'  },
  video:    { icon: Film,     color: 'text-purple-600 bg-purple-50' },
  audio:    { icon: Music,    color: 'text-orange-600 bg-orange-50' },
};

export default function AdminMediaPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files;
    if (!picked?.length) return;
    setUploading(true);
    const form = new FormData();
    Array.from(picked).forEach(f => form.append('file', f));
    try {
      const res = await fetch('/api/upload/image', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) {
        const f = picked[0];
        const mime = f.type.split('/')[0] as MediaFile['type'];
        setFiles(prev => [{
          id: Date.now().toString(),
          name: f.name,
          url: data.url,
          size: f.size,
          type: ['image', 'video', 'audio'].includes(mime) ? mime : 'document',
          uploadedAt: new Date().toISOString(),
        }, ...prev]);
      }
    } catch { /* silent */ } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const counts = { image: 0, document: 0, video: 0, audio: 0, ...
    Object.fromEntries(
      Object.entries(
        files.reduce((acc, f) => { acc[f.type] = (acc[f.type] || 0) + 1; return acc; }, {} as Record<string, number>)
      )
    )
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
              <p className="text-sm text-gray-500 mt-0.5">Upload and manage images, documents and files</p>
            </div>
          </div>
          <div>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={handleUpload} />
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {(['image', 'document', 'video', 'audio'] as const).map(type => {
            const { icon: Icon, color } = TYPE_ICONS[type];
            return (
              <div key={type} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{counts[type]}</p>
                  <p className="text-xs text-gray-500 capitalize">{type}s</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={cn('p-1.5 rounded transition-colors', view === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600')}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-1.5 rounded transition-colors', view === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/20 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Upload className="h-7 w-7 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {files.length === 0 ? 'No media uploaded yet' : 'No results'}
            </h2>
            <p className="text-sm text-gray-500 max-w-xs mb-5">
              {files.length === 0 ? 'Click or drag files here to upload images, documents, videos and more.' : 'No files match your search.'}
            </p>
            {files.length === 0 && (
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="h-4 w-4" />
                Upload your first file
              </Button>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {filtered.map(file => {
              const { icon: Icon, color } = TYPE_ICONS[file.type];
              return (
                <div key={file.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                  <div className={cn('h-28 flex items-center justify-center', color.split(' ')[1])}>
                    {file.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon className={cn('h-10 w-10', color.split(' ')[0])} />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filtered.map((file, i) => {
              const { icon: Icon, color } = TYPE_ICONS[file.type];
              return (
                <div key={file.id} className={cn('flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors', i !== 0 && 'border-t border-gray-100')}>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB · {new Date(file.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
