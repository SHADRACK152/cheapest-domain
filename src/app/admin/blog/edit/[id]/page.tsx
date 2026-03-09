'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  Save,
  Eye,
  ArrowLeft,
  FileText,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

const WordPressEditor = dynamic(() => import('@/components/editor/wordpress-editor'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading editor...</span>
    </div>
  ),
});

const categories = ['Guide', 'Education', 'Security', 'Tutorial', 'SEO', 'News'];

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Guide');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [slug, setSlug] = useState('');
  const [readTime, setReadTime] = useState('5');
  const [scheduledDate, setScheduledDate] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(true);
  const [imageOpen, setImageOpen] = useState(true);

  // Fetch existing post
  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/blog/${id}`);
        const data = await res.json();
        if (data.success && data.post) {
          const p = data.post;
          setTitle(p.title || '');
          setExcerpt(p.excerpt || '');
          setContent(p.content || '');
          setCategory(p.category || 'Guide');
          setStatus(p.status || 'draft');
          setSlug(p.slug || '');
          setReadTime((p.readTime || '5 min').replace(' min', ''));
          setScheduledDate(p.scheduledDate || '');
          setFeaturedImage(p.featuredImage || '');
          setTags(p.tags || '');
          setMetaDescription(p.metaDescription || '');
        }
      } catch (e) {
        console.error('Error loading post:', e);
      } finally {
        setIsLoadingPost(false);
      }
    }
    load();
  }, [id]);

  if (authLoading || isLoadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'admin@truehost.co.ke') {
    router.push(`/login?redirect=/admin/blog/edit/${id}`);
    return null;
  }

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleSave = async (saveStatus: 'draft' | 'published' | 'scheduled') => {
    if (!title.trim()) { alert('Please enter a title'); return; }
    if (!excerpt.trim()) { alert('Please enter an excerpt'); return; }
    if (!content.trim()) { alert('Please enter content'); return; }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          category,
          status: saveStatus,
          featuredImage,
          readTime: `${readTime} min`,
          tags,
          metaDescription: metaDescription || excerpt.substring(0, 160),
          scheduledDate: saveStatus === 'scheduled' ? scheduledDate : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update post');

      alert(`Post ${saveStatus === 'published' ? 'published' : 'saved'} successfully!`);
      router.push('/admin/blog');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload/image', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      setFeaturedImage(data.url);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(msg);
      alert(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-12">
      <div className="container-wide max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/admin/blog">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog Posts
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Link href={`/blog/${slug}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave('published')}
                disabled={isSaving}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Publish'}
              </Button>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111111]">Edit Blog Post</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + Slug */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Post Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter an engaging title"
                className="w-full text-2xl font-bold border-0 focus:outline-none focus:ring-0 placeholder:text-gray-300"
              />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">yourdomain.com/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="url-slug"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Excerpt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt *</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description shown in blog listings"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-2">{excerpt.length} characters</p>
            </motion.div>

            {/* Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content *</label>
              <WordPressEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your blog post..."
              />
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <p>{content.replace(/<[^>]*>/g, '').split(' ').filter(Boolean).length} words</p>
                <p>
                  ~{Math.ceil(content.replace(/<[^>]*>/g, '').split(' ').filter(Boolean).length / 200)} min read
                </p>
              </div>
            </motion.div>

            {/* SEO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSeoOpen(!seoOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-[#111111]">SEO Settings</h3>
                {seoOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </button>
              {seoOpen && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Description for search engines (150-160 characters)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={2}
                    />
                    <p className="text-xs text-gray-400 mt-1">{metaDescription.length} / 160 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="domain, hosting, tips"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setPublishOpen(!publishOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-base font-bold text-[#111111]">Publish Settings</h3>
                {publishOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>
              {publishOpen && (
                <div className="px-6 pb-6 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'scheduled')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  {status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date</label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Read Time (min)</label>
                    <input
                      type="number"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setImageOpen(!imageOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-base font-bold text-[#111111]">Featured Image</h3>
                {imageOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>
              {imageOpen && (
                <div className="px-6 pb-6 border-t border-gray-100 space-y-4">
                  {featuredImage && (
                    <div className="relative rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-lg" />
                      <button
                        onClick={() => setFeaturedImage('')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Image</label>
                    <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {isUploading ? 'Uploading...' : 'Choose file'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Or enter URL</label>
                    <input
                      type="url"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Save buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 gap-2"
                onClick={() => handleSave('published')}
                disabled={isSaving}
              >
                <FileText className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Publish'}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleSave('draft')}
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
