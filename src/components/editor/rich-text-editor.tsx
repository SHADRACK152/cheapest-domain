'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Minus, Image as ImageIcon,
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Undo, Redo, Type, Palette, Table, Video, MoreHorizontal
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdating = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (editorRef.current && !isUpdating.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdating.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdating.current = false;
      }, 0);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Get HTML content from clipboard
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    
    // Prefer HTML if available to preserve formatting
    if (html) {
      document.execCommand('insertHTML', false, html);
    } else if (text) {
      // Fallback to plain text, preserving line breaks
      const formattedText = text.replace(/\n/g, '<br>');
      document.execCommand('insertHTML', false, formattedText);
    }
    
    handleInput();
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Editor image upload starting:', file.name, file.type, file.size);
    
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading to /api/upload/image');
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);
      
      const data = await response.json();
      console.log('Upload response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Insert image into editor
      const img = `<img src="${data.url}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 1em 0;" />`;
      document.execCommand('insertHTML', false, img);
      handleInput();
      
      console.log('Image inserted successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload image';
      alert(`Failed to upload image: ${errorMsg}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={cn('border border-gray-300 rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1.5 text-sm font-semibold hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1.5 text-sm italic hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-3 py-1.5 text-sm underline hover:bg-gray-200 rounded transition-colors"
          title="Underline"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => execCommand('strikeThrough')}
          className="px-3 py-1.5 text-sm line-through hover:bg-gray-200 rounded transition-colors"
          title="Strikethrough"
        >
          S
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h1>')}
          className="px-3 py-1.5 text-sm font-bold hover:bg-gray-200 rounded transition-colors"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="px-3 py-1.5 text-sm font-bold hover:bg-gray-200 rounded transition-colors"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="px-3 py-1.5 text-sm font-bold hover:bg-gray-200 rounded transition-colors"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="px-3 py-1.5 text-sm hover:bg-gray-200 rounded transition-colors"
          title="Paragraph"
        >
          P
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1.5 text-sm hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1.5 text-sm hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
        >
          1. List
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter link URL:');
            if (url) execCommand('createLink', url);
          }}
          className="px-3 py-1.5 text-sm hover:bg-gray-200 rounded transition-colors text-blue-600"
          title="Insert Link"
        >
          Link
        </button>
        
        <label className="px-3 py-1.5 text-sm hover:bg-gray-200 rounded transition-colors cursor-pointer text-green-600 flex items-center gap-1" title="Insert Image">
          <ImageIcon className="h-4 w-4" />
          Image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploadingImage}
          />
        </label>
        
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-3 py-1.5 text-sm hover:bg-gray-200 rounded transition-colors text-red-600"
          title="Clear Formatting"
        >
          Clear
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <div className="flex items-center gap-2">
          <label className="px-2 py-1.5 text-xs hover:bg-gray-200 rounded transition-colors cursor-pointer flex items-center gap-1" title="Text Color">
            <span>A</span>
            <input
              type="color"
              onChange={(e) => execCommand('foreColor', e.target.value)}
              className="w-5 h-5 cursor-pointer"
            />
          </label>
          <label className="px-2 py-1.5 text-xs hover:bg-gray-200 rounded transition-colors cursor-pointer flex items-center gap-1" title="Highlight Color">
            <span className="bg-yellow-200 px-1">H</span>
            <input
              type="color"
              defaultValue="#ffff00"
              onChange={(e) => execCommand('backColor', e.target.value)}
              className="w-5 h-5 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto focus:outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder}
        style={{
          whiteSpace: 'pre-wrap',
        }}
        suppressContentEditableWarning
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        
        [contenteditable] {
          line-height: 1.6;
        }
        
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          line-height: 1.2;
        }
        
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
          line-height: 1.3;
        }
        
        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
          line-height: 1.4;
        }
        
        [contenteditable] p {
          margin: 1em 0;
        }
        
        [contenteditable] strong, [contenteditable] b {
          font-weight: bold;
        }
        
        [contenteditable] em, [contenteditable] i {
          font-style: italic;
        }
        
        [contenteditable] u {
          text-decoration: underline;
        }
        
        [contenteditable] strike, [contenteditable] s {
          text-decoration: line-through;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 2em;
          margin: 1em 0;
        }
        
        [contenteditable] li {
          margin: 0.25em 0;
        }
        
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
