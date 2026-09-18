
import React, { useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, Palette, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Strikethrough, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
}

const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
];

const SIZES = [
  { label: 'Size', value: '' },
  { label: 'Small (12px)', value: '12px' },
  { label: 'Normal (14px)', value: '14px' },
  { label: 'Medium (16px)', value: '16px' },
  { label: 'Large (20px)', value: '20px' },
  { label: 'X-Large (24px)', value: '24px' },
  { label: 'Heading (30px)', value: '30px' },
];

const HEADINGS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '150px', label }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync value from props only on initial load or external change
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        if (document.activeElement !== editorRef.current) {
          editorRef.current.innerHTML = value || '';
        }
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleChange();
  }, []);

  const handleLink = () => {
    const url = prompt('Enter the URL:', 'https://');
    if (url) exec('createLink', url);
  };

  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec('foreColor', e.target.value);
  };

  const handleFont = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) exec('fontName', e.target.value);
  };

  const handleSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      // Use inline style for proper pixel sizes
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = e.target.value;
        try {
          range.surroundContents(span);
          handleChange();
        } catch {
          exec('fontSize', '3'); // fallback
        }
      } else {
        exec('fontSize', '3'); // no selection fallback
      }
    }
  };

  const handleHeading = (e: React.ChangeEvent<HTMLSelectElement>) => {
    exec('formatBlock', e.target.value);
    (e.target as HTMLSelectElement).value = 'p'; // reset
  };

  const handleChange = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const ToolButton = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="p-1.5 hover:bg-gray-200 active:bg-gray-300 rounded transition-colors text-gray-700"
    >
      {children}
    </button>
  );

  return (
    <div className="border border-[#CCCCCC] rounded-md overflow-hidden bg-white flex flex-col focus-within:border-[#008060] transition-colors">
      {/* Toolbar */}
      <div className="bg-[#F4F3EF] border-b border-[#CCCCCC] px-2 py-1.5 flex flex-wrap items-center gap-1">
        {/* Heading format */}
        <select
          onChange={handleHeading}
          defaultValue="p"
          className="text-xs border border-gray-300 rounded px-1 py-1 bg-white text-gray-700 cursor-pointer min-w-[80px]"
        >
          {HEADINGS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
        </select>

        {/* Font family */}
        <select
          onChange={handleFont}
          defaultValue=""
          className="text-xs border border-gray-300 rounded px-1 py-1 bg-white text-gray-700 cursor-pointer min-w-[90px]"
        >
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* Font size */}
        <select
          onChange={handleSize}
          defaultValue=""
          className="text-xs border border-gray-300 rounded px-1 py-1 bg-white text-gray-700 cursor-pointer min-w-[100px]"
        >
          {SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Text style buttons */}
        <ToolButton onClick={() => exec('bold')} title="Bold (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton onClick={() => exec('italic')} title="Italic (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton onClick={() => exec('underline')} title="Underline (Ctrl+U)"><Underline className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton onClick={() => exec('strikeThrough')} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolButton>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Alignment */}
        <ToolButton onClick={() => exec('justifyLeft')} title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton onClick={() => exec('justifyCenter')} title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton onClick={() => exec('justifyRight')} title="Align Right"><AlignRight className="w-3.5 h-3.5" /></ToolButton>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Lists */}
        <ToolButton onClick={() => exec('insertUnorderedList')} title="Bullet List"><List className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton onClick={() => exec('insertOrderedList')} title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></ToolButton>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Link & Color */}
        <ToolButton onClick={handleLink} title="Add Link"><LinkIcon className="w-3.5 h-3.5" /></ToolButton>

        <div className="relative flex items-center p-1.5 hover:bg-gray-200 rounded cursor-pointer transition-colors" title="Text Color">
          <Palette className="w-3.5 h-3.5 text-gray-700" />
          <input
            type="color"
            onChange={handleColor}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <span className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Undo/Redo */}
        <ToolButton onClick={() => exec('undo')} title="Undo (Ctrl+Z)"><Undo className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton onClick={() => exec('redo')} title="Redo (Ctrl+Y)"><Redo className="w-3.5 h-3.5" /></ToolButton>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onBlur={handleChange}
        className="w-full px-3 py-3 text-sm focus:outline-none font-sans overflow-y-auto prose prose-sm max-w-none"
        style={{ minHeight }}
        data-placeholder={placeholder}
        // Show placeholder via CSS
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        [contenteditable] ul { list-style-type: disc; margin-left: 1.5em; }
        [contenteditable] ol { list-style-type: decimal; margin-left: 1.5em; }
        [contenteditable] h1 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] h2 { font-size: 1.3em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] h3 { font-size: 1.1em; font-weight: bold; margin: 0.4em 0; }
        [contenteditable] h4 { font-size: 1em; font-weight: bold; margin: 0.3em 0; }
        [contenteditable] p { margin: 0.3em 0; }
        [contenteditable] a { color: #008060; text-decoration: underline; }
      `}</style>
    </div>
  );
}
