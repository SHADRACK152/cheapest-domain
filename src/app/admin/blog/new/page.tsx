'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  Save,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  Tag,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Upload,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Lazy load the WordPress-style editor component
const WordPressEditor = dynamic(() => import('@/components/editor/wordpress-editor'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center"><span className="text-gray-400">Loading editor...</span></div>,
});

const categories = ['Guide', 'Education', 'Security', 'Tutorial', 'SEO', 'News'];

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
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
  const [isKayaAutomated, setIsKayaAutomated] = useState(false);
  
  // Collapsible section states
  const [seoOpen, setSeoOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(true);
  const [imageOpen, setImageOpen] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(true);

  // Check for Kaya automation data on mount
  useEffect(() => {
    if (isAuthenticated && user?.email === 'admin@truehost.co.ke') {
      const automationData = localStorage.getItem('kaya_blog_automation');
      if (automationData) {
        try {
          const data = JSON.parse(automationData);
          
          // Auto-fill all fields
          setTitle(data.title || '');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
          setCategory(data.category || 'Guide');
          setTags(data.tags || '');
          setReadTime(data.readTime || '5');
          setFeaturedImage(data.featuredImage || '');
          setSlug(data.slug || '');
          setMetaDescription(data.excerpt || '');
          setIsKayaAutomated(true);
          
          // Clear the automation data
          localStorage.removeItem('kaya_blog_automation');
          
          // Show success notification
          setTimeout(() => {
            alert('🤖 Kaya filled in all the fields! Review and click Publish when ready. 🚀');
          }, 500);
        } catch (e) {
          console.error('Failed to parse automation data:', e);
        }
      }
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'admin@truehost.co.ke') {
    router.push('/login?redirect=/admin/blog/new');
    return null;
  }

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleSave = async (saveStatus: 'draft' | 'published' | 'scheduled') => {
    setStatus(saveStatus);
    
    // Validation
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!excerpt.trim()) {
      alert('Please enter an excerpt');
      return;
    }
    
    if (!content.trim()) {
      alert('Please enter content');
      return;
    }
    
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save post');
      }

      alert(`Blog post ${saveStatus === 'published' ? 'published' : 'saved'} successfully!`);
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      alert(error instanceof Error ? error.message : 'Failed to save post');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Starting upload for:', file.name, file.type, file.size);
    
    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending request to /api/upload/image');
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFeaturedImage(data.url);
      console.log('Upload successful:', data.url);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadError(errorMsg);
      alert(`Upload failed: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-12">
      <div className="container-wide max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Link href="/admin/blog">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog Posts
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSave('draft')}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button 
                size="sm"
                onClick={() => handleSave('published')}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4" />
                Publish
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-[#111111]">
              Create New Blog Post
            </h1>
            {isKayaAutomated && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                🤖 Kaya
              </Badge>
            )}
          </div>
          {isKayaAutomated && (
            <p className="text-sm text-purple-600 mt-2">
              ✨ Content generated and filled by Kaya AI. Review and publish when ready!
            </p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Post Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter an engaging title for your blog post"
                className="w-full text-2xl font-bold border-0 focus:outline-none focus:ring-0 placeholder:text-gray-300"
                required
              />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Slug
                </label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Excerpt *
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description that appears in blog listings (150-200 characters recommended)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={3}
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                {excerpt.length} characters
              </p>
            </motion.div>

            {/* Content Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content *
              </label>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  ✨ <strong>WordPress-Style Editor:</strong> Full-featured editor with all WordPress capabilities. 
                  Format text, add images, tables, links, and more. Click the fullscreen icon for distraction-free writing!
                </p>
              </div>
              <WordPressEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your amazing blog post..."
              />
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <p>{content.replace(/<[^>]*>/g, '').split(' ').filter(Boolean).length} words</p>
                <p>Estimated read time: {Math.ceil(content.replace(/<[^>]*>/g, '').split(' ').filter(Boolean).length / 200)} min</p>
              </div>
            </motion.div>

            {/* SEO Settings */}
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
                {seoOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {seoOpen && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Description for search engines (150-160 characters recommended)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={2}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {metaDescription.length} / 160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="domain, registration, tips, seo"
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
                <h3 className="text-lg font-bold text-[#111111]">Publish Settings</h3>
                {publishOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {publishOpen && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  {status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Publish Date
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Read Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      min="1"
                      max="60"
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
                <h3 className="text-lg font-bold text-[#111111]">Featured Image</h3>
                {imageOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {imageOpen && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {!featuredImage ? (
                    <>
                      <label className="block border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <>
                            <Upload className="h-12 w-12 text-primary-600 mx-auto mb-3 animate-bounce" />
                            <p className="text-sm text-primary-600 mb-2">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 mb-2">Click to upload image</p>
                            <p className="text-xs text-gray-400">PNG, JPG, WEBP, GIF up to 5MB</p>
                          </>
                        )}
                      </label>

                      {uploadError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600">{uploadError}</p>
                        </div>
                      )}

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-white text-gray-400">OR</span>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        placeholder="Paste image URL"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative group rounded-lg overflow-hidden">
                        <img
                          src={featuredImage}
                          alt="Featured"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{featuredImage}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Publishing Checklist */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 rounded-2xl border border-blue-100 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setChecklistOpen(!checklistOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-blue-100/50 transition-colors"
              >
                <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Publishing Checklist
                </h3>
                {checklistOpen ? (
                  <ChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-600" />
                )}
              </button>
              
              {checklistOpen && (
                <div className="px-6 pb-6 space-y-2 text-sm border-t border-blue-100">
                  {[
                    { label: 'Title added', done: !!title },
                    { label: 'Excerpt added', done: !!excerpt },
                    { label: 'Content added', done: !!content },
                    { label: 'Category selected', done: !!category },
                    { label: 'SEO meta description', done: !!metaDescription },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={cn(
                        'h-4 w-4 rounded-full flex items-center justify-center',
                        item.done ? 'bg-green-500' : 'bg-gray-300'
                      )}>
                        {item.done && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className={item.done ? 'text-gray-700' : 'text-gray-400'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
