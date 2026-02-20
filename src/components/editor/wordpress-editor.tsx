'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Image as ImageIcon,
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Undo, Redo, Type, Table, Video, MoreHorizontal, X, Check,
  ChevronDown, Maximize2, Minimize2, FileText, ChevronRight, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WordPressEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function WordPressEditor({ value, onChange, placeholder, className }: WordPressEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdating = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [currentFormat, setCurrentFormat] = useState('Paragraph');
  const [showToc, setShowToc] = useState(true);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    if (editorRef.current && !isUpdating.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      updateTableOfContents();
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdating.current = true;
      onChange(editorRef.current.innerHTML);
      updateTableOfContents();
      setTimeout(() => {
        isUpdating.current = false;
      }, 0);
    }
  };

  // Extract headings for Table of Contents
  const updateTableOfContents = () => {
    if (!editorRef.current) return;
    
    const headingElements = editorRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const extractedHeadings: { id: string; text: string; level: number }[] = [];
    
    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      const id = `heading-${index}`;
      
      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = id;
      }
      
      extractedHeadings.push({ id: heading.id, text, level });
    });
    
    setHeadings(extractedHeadings);
  };

  // Scroll to heading when clicked in TOC
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.backgroundColor = '#fef3c7';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 1000);
    }
  };

  // Insert collapsible accordion block
  const insertAccordion = () => {
    const accordion = `
      <details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1em; margin: 1em 0; background: #f9fafb;">
        <summary style="cursor: pointer; font-weight: 600; color: #111827; user-select: none; list-style: none; display: flex; align-items: center; gap: 0.5em;">
          <span style="font-size: 1.2em;">▶</span>
          <span>Click to expand</span>
        </summary>
        <div style="margin-top: 1em; padding-top: 1em; border-top: 1px solid #e5e7eb;">
          <p>Add your content here...</p>
        </div>
      </details>
    `;
    document.execCommand('insertHTML', false, accordion);
    handleInput();
  };

  // Insert FAQ block (multiple accordions)
  const insertFAQBlock = () => {
    const faq = `
      <div style="margin: 2em 0;">
        <h3 style="margin-bottom: 1em; font-size: 1.5em; font-weight: bold;">Frequently Asked Questions</h3>
        <details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1em; margin-bottom: 0.5em; background: #f9fafb;">
          <summary style="cursor: pointer; font-weight: 600; color: #111827; user-select: none;">Question 1?</summary>
          <p style="margin-top: 0.5em; color: #6b7280;">Answer to question 1...</p>
        </details>
        <details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1em; margin-bottom: 0.5em; background: #f9fafb;">
          <summary style="cursor: pointer; font-weight: 600; color: #111827; user-select: none;">Question 2?</summary>
          <p style="margin-top: 0.5em; color: #6b7280;">Answer to question 2...</p>
        </details>
        <details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1em; background: #f9fafb;">
          <summary style="cursor: pointer; font-weight: 600; color: #111827; user-select: none;">Question 3?</summary>
          <p style="margin-top: 0.5em; color: #6b7280;">Answer to question 3...</p>
        </details>
      </div>
    `;
    document.execCommand('insertHTML', false, faq);
    handleInput();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    
    if (html) {
      document.execCommand('insertHTML', false, html);
    } else if (text) {
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

  const handleFormat = (tag: string, displayName: string) => {
    execCommand('formatBlock', `<${tag}>`);
    setCurrentFormat(displayName);
    setShowFormatDropdown(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      const img = `<img src="${data.url}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 1em 0; border-radius: 8px;" />`;
      document.execCommand('insertHTML', false, img);
      handleInput();
    } catch (error) {
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const insertLink = () => {
    if (!linkUrl) return;
    const text = linkText || linkUrl;
    const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${text}</a>`;
    document.execCommand('insertHTML', false, link);
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
    handleInput();
  };

  const insertTable = () => {
    const table = `
      <table style="border-collapse: collapse; width: 100%; margin: 1em 0;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td>
        </tr>
      </table>
    `;
    document.execCommand('insertHTML', false, table);
    handleInput();
  };

  const insertDivider = () => {
    const hr = '<hr style="border: 0; border-top: 2px solid #e5e7eb; margin: 2em 0;" />';
    document.execCommand('insertHTML', false, hr);
    handleInput();
  };

  const insertBlockquote = () => {
    const quote = '<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 1em; margin: 1em 0; color: #6b7280; font-style: italic;">Quote text here</blockquote>';
    document.execCommand('insertHTML', false, quote);
    handleInput();
  };

  const insertCodeBlock = () => {
    const code = '<pre style="background: #f3f4f6; padding: 1em; border-radius: 6px; overflow-x: auto; margin: 1em 0;"><code>// Your code here</code></pre>';
    document.execCommand('insertHTML', false, code);
    handleInput();
  };

  const ToolbarButton = ({ onClick, title, children, active = false }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 hover:bg-gray-100 rounded transition-colors",
        active && "bg-blue-50 text-blue-600"
      )}
      title={title}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

  return (
    <div className={cn(
      'border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm',
      isFullscreen && 'fixed inset-4 z-50',
      className
    )}>
      {/* WordPress-Style Toolbar */}
      <div className="bg-white border-b border-gray-200">
        {/* Primary Toolbar */}
        <div className="p-2 flex flex-wrap gap-1 items-center">
          {/* Format Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFormatDropdown(!showFormatDropdown)}
              className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-2 min-w-[120px] justify-between"
            >
              <span>{currentFormat}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showFormatDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[150px]">
                <button onClick={() => handleFormat('p', 'Paragraph')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-base">Paragraph</button>
                <button onClick={() => handleFormat('h1', 'Heading 1')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-3xl font-bold">Heading 1</button>
                <button onClick={() => handleFormat('h2', 'Heading 2')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-2xl font-bold">Heading 2</button>
                <button onClick={() => handleFormat('h3', 'Heading 3')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xl font-bold">Heading 3</button>
                <button onClick={() => handleFormat('h4', 'Heading 4')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-lg font-bold">Heading 4</button>
                <button onClick={() => handleFormat('h5', 'Heading 5')} className="w-full text-left px-4 py-2 hover:bg-gray-50 font-bold">Heading 5</button>
                <button onClick={() => handleFormat('h6', 'Heading 6')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-bold">Heading 6</button>
                <div className="border-t border-gray-200 my-1" />
                <button onClick={() => { insertCodeBlock(); setShowFormatDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 font-mono text-sm">Code Block</button>
              </div>
            )}
          </div>

          <Divider />

          {/* Text Formatting */}
          <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Alignment */}
          <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyFull')} title="Justify">
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Lists */}
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Link */}
          <ToolbarButton onClick={() => setShowLinkDialog(true)} title="Insert Link">
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>

          {/* Image */}
          <label className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Add Media">
            <ImageIcon className="h-4 w-4" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploadingImage}
            />
          </label>

          <Divider />

          {/* Blockquote */}
          <ToolbarButton onClick={insertBlockquote} title="Blockquote">
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          {/* Table */}
          <ToolbarButton onClick={insertTable} title="Insert Table">
            <Table className="h-4 w-4" />
          </ToolbarButton>

          {/* Accordion/Collapsible */}
          <ToolbarButton onClick={insertAccordion} title="Insert Collapsible Section">
            <ChevronDown className="h-4 w-4" />
          </ToolbarButton>

          {/* FAQ Block */}
          <ToolbarButton onClick={insertFAQBlock} title="Insert FAQ Block">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">?</text>
            </svg>
          </ToolbarButton>

          {/* Divider */}
          <ToolbarButton onClick={insertDivider} title="Horizontal Line">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
            </svg>
          </ToolbarButton>

          <Divider />

          {/* Color Pickers */}
          <label className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer flex items-center gap-1" title="Text Color">
            <Type className="h-4 w-4" />
            <input
              type="color"
              onChange={(e) => execCommand('foreColor', e.target.value)}
              className="w-6 h-6 cursor-pointer border-0"
            />
          </label>

          <label className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer flex items-center gap-1" title="Highlight">
            <div className="h-4 w-4 bg-yellow-200 rounded" />
            <input
              type="color"
              defaultValue="#ffff00"
              onChange={(e) => execCommand('backColor', e.target.value)}
              className="w-6 h-6 cursor-pointer border-0"
            />
          </label>

          <Divider />

          {/* Undo/Redo */}
          <ToolbarButton onClick={() => execCommand('undo')} title="Undo (Ctrl+Z)">
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('redo')} title="Redo (Ctrl+Y)">
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Clear Formatting */}
          <ToolbarButton onClick={() => execCommand('removeFormat')} title="Clear Formatting">
            <X className="h-4 w-4 text-red-600" />
          </ToolbarButton>

          {/* Fullscreen Toggle */}
          <div className="ml-auto flex items-center gap-1">
            <ToolbarButton 
              onClick={() => setShowToc(!showToc)} 
              title="Toggle Table of Contents"
              active={showToc}
            >
              <FileText className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link Text (optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setLinkText('');
                }}>
                  Cancel
                </Button>
                <Button onClick={insertLink}>Insert Link</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Area with TOC - WordPress Style */}
      <div className={cn(
        "bg-white overflow-hidden flex",
        isFullscreen ? "h-[calc(100vh-140px)]" : "h-[500px]"
      )}>
        {/* Main Editor */}
        <div className={cn(
          "overflow-y-auto transition-all",
          showToc ? "flex-1" : "w-full"
        )}>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onPaste={handlePaste}
            className="p-8 min-h-full focus:outline-none prose prose-lg max-w-none"
            data-placeholder={placeholder || "Start writing..."}
            suppressContentEditableWarning
          />
        </div>

        {/* Table of Contents Sidebar */}
        {showToc && (
          <div className="w-64 border-l border-gray-200 bg-gray-50 overflow-y-auto p-4">
            <div className="sticky top-0 bg-gray-50 pb-3 mb-3 border-b border-gray-200">
              <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document Outline
              </h4>
            </div>
            
            {headings.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Add headings to see your document outline
              </p>
            ) : (
              <nav className="space-y-1">
                {headings.map((heading, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-sm hover:bg-blue-50 hover:text-blue-700 rounded transition-colors",
                      "flex items-start gap-2"
                    )}
                    style={{ paddingLeft: `${(heading.level - 1) * 0.75 + 0.5}rem` }}
                  >
                    <ChevronRight className="h-3 w-3 mt-1 flex-shrink-0" />
                    <span className="truncate">{heading.text || '(Empty heading)'}</span>
                  </button>
                ))}
              </nav>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick Insert:</p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={insertAccordion}
                  className="w-full text-left px-2 py-1.5 text-xs bg-white hover:bg-blue-50 border border-gray-200 rounded flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Collapsible Section
                </button>
                <button
                  type="button"
                  onClick={insertFAQBlock}
                  className="w-full text-left px-2 py-1.5 text-xs bg-white hover:bg-blue-50 border border-gray-200 rounded flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" />
                  FAQ Block
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Character Count */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between">
        <span>WordPress-Style Editor</span>
        <span>{editorRef.current?.innerText.length || 0} characters</span>
      </div>

      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] {
          line-height: 1.8;
          color: #1f2937;
        }
        
        [contenteditable] h1 { font-size: 2.5em; font-weight: 700; margin: 0.67em 0; line-height: 1.2; }
        [contenteditable] h2 { font-size: 2em; font-weight: 700; margin: 0.75em 0; line-height: 1.3; }
        [contenteditable] h3 { font-size: 1.5em; font-weight: 700; margin: 0.83em 0; line-height: 1.4; }
        [contenteditable] h4 { font-size: 1.25em; font-weight: 600; margin: 0.83em 0; }
        [contenteditable] h5 { font-size: 1.1em; font-weight: 600; margin: 0.83em 0; }
        [contenteditable] h6 { font-size: 1em; font-weight: 600; margin: 0.83em 0; }
        [contenteditable] p { margin: 1.2em 0; }
        [contenteditable] strong, [contenteditable] b { font-weight: 700; }
        [contenteditable] em, [contenteditable] i { font-style: italic; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 2em; margin: 1.2em 0; }
        [contenteditable] li { margin: 0.5em 0; }
        [contenteditable] a { color: #2563eb; text-decoration: underline; }
        [contenteditable] a:hover { color: #1d4ed8; }
        [contenteditable] blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; margin: 1.5em 0; color: #6b7280; font-style: italic; }
        [contenteditable] code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
        [contenteditable] pre { background: #f3f4f6; padding: 1.5em; border-radius: 8px; overflow-x: auto; margin: 1.5em 0; }
        [contenteditable] table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
        [contenteditable] table td, [contenteditable] table th { border: 1px solid #e5e7eb; padding: 0.75em; }
        [contenteditable] table th { background: #f9fafb; font-weight: 600; }
        [contenteditable] hr { border: 0; border-top: 2px solid #e5e7eb; margin: 2em 0; }
        [contenteditable] img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5em 0; }
        [contenteditable] details { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1em; margin: 1em 0; background: #f9fafb; }
        [contenteditable] details summary { cursor: pointer; font-weight: 600; user-select: none; display: flex; align-items: center; gap: 0.5em; }
        [contenteditable] details summary:hover { color: #2563eb; }
        [contenteditable] details[open] summary { margin-bottom: 0.75em; padding-bottom: 0.75em; border-bottom: 1px solid #e5e7eb; }
        [contenteditable] details summary::marker { display: none; }
        [contenteditable] details summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  );
}
