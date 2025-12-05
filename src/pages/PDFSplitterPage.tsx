import { useState, useEffect } from 'react';
import { Upload02, File06, Download01, Plus, Trash01, X } from '@untitledui/icons';
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator';

// --- Script Loading Utility ---
const useScriptLoader = (scripts: string[]) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let loadCount = 0;

    scripts.forEach((src) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        loadCount++;
        if (loadCount === scripts.length) setLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        loadCount++;
        if (loadCount === scripts.length) setLoaded(true);
      };
      script.onerror = () => setError(src);
      document.body.appendChild(script);
    });
  }, [scripts]);

  return { loaded, error };
};

// --- Constants ---
const PDF_LIB_URL = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
const PDF_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

// Palette for different files - using app's color system
const FILE_PALETTE = [
  {
    id: 'brand',
    border: 'border-brand',
    bg: 'bg-brand-primary',
    text: 'text-brand-secondary',
    ring: 'ring-brand',
    btn: 'bg-brand-solid',
  },
  {
    id: 'success',
    border: 'border-success-600',
    bg: 'bg-success-primary',
    text: 'text-success-primary',
    ring: 'ring-success-600',
    btn: 'bg-success-solid',
  },
  {
    id: 'warning',
    border: 'border-warning-600',
    bg: 'bg-warning-primary',
    text: 'text-warning-primary',
    ring: 'ring-warning-600',
    btn: 'bg-warning-solid',
  },
  {
    id: 'error',
    border: 'border-error-600',
    bg: 'bg-error-primary',
    text: 'text-error-primary',
    ring: 'ring-error-600',
    btn: 'bg-error-solid',
  },
  {
    id: 'purple',
    border: 'border-purple-600',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    ring: 'ring-purple-600',
    btn: 'bg-purple-600',
  },
  {
    id: 'teal',
    border: 'border-teal-600',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    ring: 'ring-teal-600',
    btn: 'bg-teal-600',
  },
  {
    id: 'pink',
    border: 'border-pink-600',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    ring: 'ring-pink-600',
    btn: 'bg-pink-600',
  },
];

// Type declarations for external libraries
declare global {
  interface Window {
    PDFLib: {
      PDFDocument: {
        load: (data: ArrayBuffer) => Promise<PDFDocument>;
        create: () => Promise<PDFDocument>;
      };
    };
    pdfjsLib: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (data: ArrayBuffer) => { promise: Promise<PDFJSDocument> };
    };
    JSZip: new () => JSZip;
  }
}

interface PDFDocument {
  copyPages: (doc: PDFDocument, indices: number[]) => Promise<PDFPage[]>;
  addPage: (page: PDFPage) => void;
  save: () => Promise<Uint8Array>;
}

interface PDFPage {}

interface PDFJSDocument {
  numPages: number;
  getPage: (num: number) => Promise<PDFJSPage>;
}

interface PDFJSPage {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => {
    promise: Promise<void>;
  };
}

interface JSZip {
  file: (name: string, data: Uint8Array) => void;
  generateAsync: (options: { type: string }) => Promise<Blob>;
}

interface PageData {
  img: string;
  index: number;
}

interface FileGroup {
  id: string;
  name: string;
  colorIndex: number;
  pageIndices: Set<number>;
}

// --- Main Application Component ---
export default function PDFSplitterPage() {
  const { loaded, error } = useScriptLoader([PDF_LIB_URL, PDF_JS_URL, JSZIP_URL]);

  if (error)
    return (
      <div className="flex h-full items-center justify-center bg-primary p-8 text-error-primary">
        Error loading PDF libraries. Please check your internet connection.
      </div>
    );

  if (!loaded)
    return (
      <div className="flex h-full flex-col items-center justify-center bg-primary text-tertiary">
        <LoadingIndicator size="lg" label="Initializing PDF Engine..." />
      </div>
    );

  return <PDFSplitterTool />;
}

// --- Logic Component ---
function PDFSplitterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);

  // files: Array of buckets { id, name, colorIndex, pageIndices: Set }
  const [files, setFiles] = useState<FileGroup[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize Worker
  useEffect(() => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
    }
  }, []);

  // --- Actions ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || selectedFile.type !== 'application/pdf') return;

    setProcessing(true);
    setProgress(0);
    setFile(selectedFile);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfLibDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      setPdfDoc(pdfLibDoc);

      const loadingTask = window.pdfjsLib.getDocument(arrayBuffer);
      const pdfJsDoc = await loadingTask.promise;

      const numPages = pdfJsDoc.numPages;
      const loadedPages: PageData[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfJsDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        loadedPages.push({
          img: canvas.toDataURL(),
          index: i - 1,
        });

        setProgress(Math.round((i / numPages) * 100));
      }
      setPages(loadedPages);

      // Initialize with one file
      const initialFileId = crypto.randomUUID();
      setFiles([
        {
          id: initialFileId,
          name: 'File 1',
          colorIndex: 0,
          pageIndices: new Set(),
        },
      ]);
      setActiveFileId(initialFileId);
    } catch (err) {
      console.error(err);
      alert('Error reading PDF.');
    } finally {
      setProcessing(false);
    }
  };

  const createNewFile = () => {
    const newId = crypto.randomUUID();
    const nextColorIndex = files.length % FILE_PALETTE.length;
    setFiles((prev) => [
      ...prev,
      {
        id: newId,
        name: `File ${prev.length + 1}`,
        colorIndex: nextColorIndex,
        pageIndices: new Set(),
      },
    ]);
    setActiveFileId(newId);
  };

  const removeFileGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) return;

    const newFiles = files.filter((f) => f.id !== id);
    setFiles(newFiles);

    if (activeFileId === id) {
      setActiveFileId(newFiles[newFiles.length - 1].id);
    }
  };

  const togglePageAssignment = (pageIndex: number) => {
    if (!activeFileId) return;

    setFiles((prevFiles) => {
      return prevFiles.map((f) => {
        const newPageIndices = new Set(f.pageIndices);

        if (f.id === activeFileId) {
          if (newPageIndices.has(pageIndex)) {
            newPageIndices.delete(pageIndex);
          } else {
            newPageIndices.add(pageIndex);
          }
        } else {
          if (newPageIndices.has(pageIndex)) {
            newPageIndices.delete(pageIndex);
          }
        }

        return { ...f, pageIndices: newPageIndices };
      });
    });
  };

  const getFileForPage = (pageIndex: number) => {
    return files.find((f) => f.pageIndices.has(pageIndex));
  };

  const handleDownload = async () => {
    if (!pdfDoc || !window.JSZip) return;
    setProcessing(true);

    try {
      const zip = new window.JSZip();
      const baseName = file?.name.replace('.pdf', '') || 'document';
      let fileCount = 0;

      for (const fileGroup of files) {
        if (fileGroup.pageIndices.size === 0) continue;

        const indices = Array.from(fileGroup.pageIndices).sort((a, b) => a - b);

        const newPdf = await window.PDFLib.PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, indices);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();

        const safeName = fileGroup.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        zip.file(`${baseName}_${safeName}.pdf`, pdfBytes);
        fileCount++;
      }

      if (fileCount === 0) {
        alert('No pages selected in any file.');
        setProcessing(false);
        return;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${baseName}_split.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to generate files.');
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setPdfDoc(null);
    setFiles([]);
  };

  // --- Render ---
  if (!file) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-primary p-6">
        <div className="w-full max-w-xl space-y-8 text-center">
          <div className="space-y-2">
            <div className="mx-auto flex size-20 items-center justify-center rounded-md bg-brand-solid shadow-lg">
              <File06 className="size-10 text-white" />
            </div>
            <h1 className="text-display-xs font-semibold tracking-tight text-primary">PDF Splitter</h1>
            <p className="text-lg text-tertiary">
              Group pages freely. Create multiple files. Download in one click.
            </p>
          </div>

          <label className="group relative block cursor-pointer rounded-md border-2 border-dashed border-secondary bg-primary p-12 transition-all duration-200 ease-in-out hover:border-brand hover:bg-secondary hover:shadow-lg">
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={handleFileUpload}
            />
            <div className="pointer-events-none space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-primary text-brand-secondary">
                <Upload02 className="size-8" />
              </div>
              <div>
                <p className="text-xl font-semibold text-secondary">Click to upload PDF</p>
                <p className="mt-1 text-sm text-quaternary">or drag and drop file here</p>
              </div>
            </div>
          </label>

          {processing && (
            <div className="flex items-center justify-center">
              <LoadingIndicator size="md" label={`Processing PDF... ${progress}%`} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-secondary">
      {/* --- Sidebar: File Manager --- */}
      <aside className="z-20 flex w-80 flex-shrink-0 flex-col border-r border-secondary bg-primary shadow-lg">
        <div className="border-b border-secondary p-6">
          <h2 className="flex items-center text-lg font-semibold text-primary">
            <File06 className="mr-2 size-5 text-tertiary" />
            Output Files
          </h2>
          <p className="mt-1 text-xs text-quaternary">
            Create files below, then click pages on the right to add them.
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {files.map((f) => {
            const isActive = f.id === activeFileId;
            const theme = FILE_PALETTE[f.colorIndex];

            return (
              <div
                key={f.id}
                onClick={() => setActiveFileId(f.id)}
                className={`group relative cursor-pointer rounded-md border-2 p-4 transition-all duration-200 ${
                  isActive
                    ? `${theme.border} ${theme.bg} scale-[1.02] shadow-md`
                    : 'border-tertiary bg-secondary hover:border-primary hover:bg-primary'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`size-3 rounded-full ${theme.btn}`} />
                    <span className={`font-semibold ${isActive ? theme.text : 'text-secondary'}`}>{f.name}</span>
                  </div>
                  {files.length > 1 && (
                    <button
                      onClick={(e) => removeFileGroup(f.id, e)}
                      className="rounded-md p-1 text-quaternary transition-colors hover:bg-error-primary hover:text-error-primary"
                    >
                      <Trash01 className="size-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={isActive ? theme.text : 'text-quaternary'}>{f.pageIndices.size} pages selected</span>
                  {isActive && <span className="animate-pulse font-semibold text-brand-secondary">Active</span>}
                </div>
              </div>
            );
          })}

          <button
            onClick={createNewFile}
            className="flex w-full items-center justify-center space-x-2 rounded-md border-2 border-dashed border-secondary py-3 font-medium text-tertiary transition-all hover:border-brand hover:bg-brand-primary hover:text-brand-secondary"
          >
            <Plus className="size-4" />
            <span>Add New File</span>
          </button>
        </div>

        <div className="border-t border-secondary bg-secondary p-4">
          <button
            onClick={handleDownload}
            disabled={processing}
            className={`flex w-full items-center justify-center space-x-2 rounded-md px-6 py-3 font-semibold text-white shadow-md transition-all ${
              processing
                ? 'cursor-not-allowed bg-disabled'
                : 'bg-brand-solid hover:translate-y-[-2px] hover:bg-brand-solid_hover hover:shadow-lg'
            }`}
          >
            {processing ? <LoadingIndicator size="sm" /> : <Download01 className="size-5" />}
            <span>Download Zip</span>
          </button>
        </div>
      </aside>

      {/* --- Main Area: Page Grid --- */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-secondary bg-primary px-6 py-4">
          <div className="flex items-center space-x-2 font-medium text-secondary">
            <File06 className="size-5 text-quaternary" />
            <span className="truncate">{file.name}</span>
            <span className="mx-2 text-quaternary">|</span>
            <span className="text-sm text-tertiary">{pages.length} Pages Total</span>
          </div>

          <button onClick={reset} className="flex items-center space-x-1 text-sm text-quaternary hover:text-error-primary">
            <X className="size-4" />
            <span>Close File</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-secondary/50 p-8">
          {processing && pages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-quaternary">
              <LoadingIndicator size="lg" label="Processing Pages..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 pb-20 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {pages.map((page, idx) => {
                const assignedFile = getFileForPage(idx);
                const isAssigned = !!assignedFile;
                const theme = isAssigned ? FILE_PALETTE[assignedFile.colorIndex] : null;

                return (
                  <div
                    key={idx}
                    onClick={() => togglePageAssignment(idx)}
                    className={`group relative cursor-pointer overflow-hidden rounded-md bg-primary transition-all duration-200 ${
                      isAssigned
                        ? `scale-[1.02] shadow-lg ring-4 ${theme?.ring} ring-offset-2`
                        : 'border border-secondary opacity-80 hover:border-primary hover:opacity-100 hover:shadow-md'
                    }`}
                  >
                    {/* Page Number / Label */}
                    <div
                      className={`absolute left-2 top-2 z-10 rounded-sm px-2 py-1 text-[10px] font-semibold shadow-sm backdrop-blur-sm ${
                        isAssigned ? `${theme?.bg} ${theme?.text}` : 'bg-tertiary text-secondary'
                      }`}
                    >
                      PAGE {idx + 1}
                    </div>

                    {/* Assigned File Label */}
                    {isAssigned && (
                      <div
                        className={`absolute right-2 top-2 z-10 rounded-full px-2 py-1 text-[9px] font-semibold text-white shadow-sm ${theme?.btn}`}
                      >
                        {assignedFile.name}
                      </div>
                    )}

                    {/* Active Hover Effect */}
                    {!isAssigned && (
                      <div className="absolute inset-0 z-0 bg-brand-solid/0 transition-colors group-hover:bg-brand-solid/10" />
                    )}

                    <div className="aspect-[1/1.4] w-full p-2">
                      <img
                        src={page.img}
                        alt={`Page ${idx + 1}`}
                        className="h-full w-full border border-tertiary bg-primary object-contain shadow-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

