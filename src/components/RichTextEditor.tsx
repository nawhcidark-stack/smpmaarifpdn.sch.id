import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Unlink, 
  Palette, 
  Smile, 
  Undo, 
  Redo, 
  Code, 
  Eye, 
  Minus, 
  Eraser, 
  Heading1, 
  Heading2, 
  Heading3, 
  ChevronDown,
  Info
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Mulai tulis artikel atau paste dari sumber lain..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState<'text' | 'bg' | null>(null);
  const [activeFont, setActiveFont] = useState('Default (Inter)');
  const [activeSize, setActiveSize] = useState('Normal');

  // Prevent cursor jump by syncing only if content changes from outside
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '<p><br></p>';
      }
    }
  }, [value, isHtmlMode]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, arg: string = '') => {
    if (isHtmlMode) return;
    document.execCommand(command, false, arg);
    handleInput();
    // Refocus
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Ketik atau tempel (paste) URL link:', 'https://');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const colors = [
    '#000000', '#4b5563', '#9ca3af', '#f3f4f6', 
    '#dc2626', '#ea580c', '#eab308', '#16a34a', 
    '#2563eb', '#4f46e5', '#9333ea', '#db2777',
    '#059669', '#0d9488', '#0284c7', '#ffffff'
  ];

  const fonts = [
    { name: 'Default (Inter)', value: 'Inter, system-ui, sans-serif' },
    { name: 'Serif (Georgia)', value: 'Georgia, Cambria, serif' },
    { name: 'Monospace (JetBrains)', value: '"JetBrains Mono", Courier, monospace' },
    { name: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif' },
    { name: 'Impact / Bold', value: 'Impact, Charcoal, sans-serif' },
    { name: 'Playfair Display', value: '"Playfair Display", serif' },
  ];

  const sizes = [
    { name: 'Sangat Kecil', value: '1' },
    { name: 'Kecil', value: '2' },
    { name: 'Normal', value: '3' },
    { name: 'Besar', value: '5' },
    { name: 'Sangat Besar', value: '7' },
  ];

  return (
    <div className="border border-neutral-200 rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col w-full">
      {/* WordPress-like Header Toolbar */}
      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex flex-wrap items-center gap-1.5 sticky top-0 z-10 select-none">
        {/* Toggle Mode */}
        <button
          type="button"
          onClick={() => setIsHtmlMode(!isHtmlMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            isHtmlMode 
              ? 'bg-neutral-800 text-white shadow-sm' 
              : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
          }`}
          title={isHtmlMode ? 'Ubah ke Visual' : 'Ubah ke Kode HTML'}
        >
          {isHtmlMode ? <Eye size={14} /> : <Code size={14} />}
          {isHtmlMode ? 'Visual' : 'HTML'}
        </button>

        <div className="w-[1px] h-6 bg-neutral-200 mx-1"></div>

        {!isHtmlMode && (
          <>
            {/* Paragraph Formats / Headings */}
            <div className="relative group inline-block">
              <button
                type="button"
                className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 rounded-lg text-xs font-bold text-neutral-700 border border-neutral-200 flex items-center gap-1 cursor-pointer"
              >
                Format <ChevronDown size={12} />
              </button>
              <div className="absolute left-0 mt-1 hidden group-hover:block bg-white border border-neutral-200 rounded-xl shadow-xl p-1 w-40 z-20">
                <button
                  type="button"
                  onClick={() => execCmd('formatBlock', '<p>')}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 rounded-lg text-xs font-bold text-neutral-800"
                >
                  Paragraf biasa
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('formatBlock', '<h1>')}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 rounded-lg text-base font-black text-neutral-900"
                >
                  Judul Utama (H1)
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('formatBlock', '<h2>')}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 rounded-lg text-sm font-extrabold text-neutral-800"
                >
                  Subjudul (H2)
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('formatBlock', '<h3>')}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 rounded-lg text-xs font-black text-neutral-700"
                >
                  Sub-subjudul (H3)
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('formatBlock', '<blockquote>')}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 rounded-lg text-xs font-medium text-emerald-600 border-l-2 border-emerald-500 italic pl-2.5"
                >
                  Kutipan (Quote)
                </button>
              </div>
            </div>

            {/* Font Family Dropdown */}
            <div className="relative group inline-block">
              <button
                type="button"
                className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 rounded-lg text-xs font-bold text-neutral-700 border border-neutral-200 flex items-center gap-1 cursor-pointer max-w-[120px] truncate"
              >
                {activeFont} <ChevronDown size={12} />
              </button>
              <div className="absolute left-0 mt-1 hidden group-hover:block bg-white border border-neutral-200 rounded-xl shadow-xl p-1 w-44 z-20">
                {fonts.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => {
                      execCmd('fontName', f.value);
                      setActiveFont(f.name);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 rounded-lg text-xs text-neutral-800"
                    style={{ fontFamily: f.value }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Dropdown */}
            <div className="relative group inline-block">
              <button
                type="button"
                className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 rounded-lg text-xs font-bold text-neutral-700 border border-neutral-200 flex items-center gap-1 cursor-pointer"
              >
                Ukuran: {activeSize} <ChevronDown size={12} />
              </button>
              <div className="absolute left-0 mt-1 hidden group-hover:block bg-white border border-neutral-200 rounded-xl shadow-xl p-1 w-36 z-20">
                {sizes.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => {
                      execCmd('fontSize', s.value);
                      setActiveSize(s.name);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 rounded-lg text-xs text-neutral-800"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-[1px] h-6 bg-neutral-200 mx-1"></div>

            {/* Character Styling */}
            <div className="flex bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <button
                type="button"
                onClick={() => execCmd('bold')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 transition-colors flex items-center justify-center cursor-pointer"
                title="Bebalkan (Ctrl+B)"
              >
                <Bold size={14} className="font-extrabold" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('italic')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 border-l border-neutral-200 transition-colors flex items-center justify-center cursor-pointer"
                title="Miringkan (Ctrl+I)"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('underline')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 border-l border-neutral-200 transition-colors flex items-center justify-center cursor-pointer"
                title="Garis Bawah (Ctrl+U)"
              >
                <Underline size={14} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('strikeThrough')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 border-l border-neutral-200 transition-colors flex items-center justify-center cursor-pointer"
                title="Coret Kata"
              >
                <Strikethrough size={14} />
              </button>
            </div>

            {/* Alignments */}
            <div className="flex bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <button
                type="button"
                onClick={() => execCmd('justifyLeft')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 transition-colors flex items-center justify-center cursor-pointer"
                title="Rata Kiri"
              >
                <AlignLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyCenter')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 border-l border-neutral-200 transition-colors flex items-center justify-center cursor-pointer"
                title="Rata Tengah"
              >
                <AlignCenter size={14} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyRight')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 border-l border-neutral-200 transition-colors flex items-center justify-center cursor-pointer"
                title="Rata Kanan"
              >
                <AlignRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyFull')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 border-l border-neutral-200 transition-colors flex items-center justify-center cursor-pointer"
                title="Rata Kanan Kiri"
              >
                <AlignJustify size={14} />
              </button>
            </div>

            {/* Lists */}
            <div className="flex bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <button
                type="button"
                onClick={() => execCmd('insertUnorderedList')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 transition-colors flex items-center justify-center cursor-pointer"
                title="List Bullets"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('insertOrderedList')}
                className="p-1.5 hover:bg-neutral-100 text-neutral-700 border-l border-neutral-200 transition-colors flex items-center justify-center cursor-pointer"
                title="List Angka"
              >
                <ListOrdered size={14} />
              </button>
            </div>

            {/* Color controls */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowColorMenu(showColorMenu === 'text' ? null : 'text')}
                className="px-2 py-1.5 bg-white hover:bg-neutral-100 rounded-lg text-xs font-bold text-neutral-700 border border-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Warna Tulisan"
              >
                <Palette size={14} className="text-emerald-600" /> Warna
              </button>
              {showColorMenu === 'text' && (
                <div className="absolute left-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 z-30 w-44">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Pilih Warna Text</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          execCmd('foreColor', c);
                          setShowColorMenu(null);
                        }}
                        className="w-6 h-6 rounded-md border border-neutral-200 cursor-pointer shadow-sm active:scale-90 transition-transform"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Background Color controls */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowColorMenu(showColorMenu === 'bg' ? null : 'bg')}
                className="px-2 py-1.5 bg-white hover:bg-neutral-100 rounded-lg text-xs font-bold text-neutral-700 border border-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Latar Belakang Tulisan (Stabilo)"
              >
                <div className="w-3.5 h-3.5 rounded bg-yellow-300 border border-neutral-300"></div> Stabilo
              </button>
              {showColorMenu === 'bg' && (
                <div className="absolute left-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 z-30 w-44">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Pilih Warna Stabilo</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          execCmd('hiliteColor', c);
                          setShowColorMenu(null);
                        }}
                        className="w-6 h-6 rounded-md border border-neutral-200 cursor-pointer shadow-sm active:scale-90 transition-transform"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-[1px] h-6 bg-neutral-200 mx-1"></div>

            {/* Actions Links / HR */}
            <button
              type="button"
              onClick={insertLink}
              className="p-1.5 bg-white hover:bg-neutral-150 border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
              title="Masukkan Link"
            >
              <LinkIcon size={14} />
            </button>

            <button
              type="button"
              onClick={() => execCmd('unlink')}
              className="p-1.5 bg-white hover:bg-neutral-150 border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
              title="Hapus Link"
            >
              <Unlink size={14} />
            </button>

            <button
              type="button"
              onClick={() => execCmd('insertHorizontalRule')}
              className="p-1.5 bg-white hover:bg-neutral-150 border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
              title="Garis Pemisah (Horizontal Rule)"
            >
              <Minus size={14} />
            </button>

            {/* Eraser / Clear format */}
            <button
              type="button"
              onClick={() => execCmd('removeFormat')}
              className="p-1.5 bg-white hover:bg-red-50 hover:text-rose-600 border border-neutral-200 rounded-lg text-neutral-500 cursor-pointer"
              title="Hapus Semua Format (Seleksi dahulu)"
            >
              <Eraser size={14} />
            </button>

            <div className="w-[1px] h-6 bg-neutral-200 mx-1"></div>

            {/* History */}
            <button
              type="button"
              onClick={() => execCmd('undo')}
              className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600 cursor-pointer"
              title="Batalkan (Undo Ctrl+Z)"
            >
              <Undo size={14} />
            </button>

            <button
              type="button"
              onClick={() => execCmd('redo')}
              className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600 cursor-pointer"
              title="Ulangi (Redo Ctrl+Y)"
            >
              <Redo size={14} />
            </button>
          </>
        )}
      </div>

      {/* Editor Main Content Area */}
      {isHtmlMode ? (
        <textarea
          className="w-full min-h-[350px] p-6 bg-neutral-900 text-neutral-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-0 border-none resize-y"
          placeholder="Tulis kode HTML langsung disini..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="relative min-h-[350px] bg-white flex flex-col">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="flex-grow p-6 md:p-8 outline-none prose prose-emerald prose-neutral max-w-none scroll-smooth min-h-[350px] overflow-y-auto break-words bg-white rich-editor-content"
            style={{ minHeight: '350px' }}
          />
          {!value && (
            <div className="absolute top-6 left-6 md:top-8 md:left-8 text-neutral-400 pointer-events-none text-sm font-medium">
              {placeholder}
            </div>
          )}
        </div>
      )}

      {/* Footer Info bar with word and character count */}
      <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-200 flex items-center justify-between text-[10px] font-bold text-neutral-400 select-none uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Info size={11} className="text-emerald-600" />
          💡 Tips: Anda bisa langsung copy-paste artikel beserta gambar/tabel dari website lain atau Word!
        </span>
        <div className="flex gap-4">
          <span>Karakter: {value ? value.replace(/<[^>]*>/g, '').length : 0}</span>
          <span>Kata: {value ? value.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length : 0}</span>
        </div>
      </div>
    </div>
  );
}
