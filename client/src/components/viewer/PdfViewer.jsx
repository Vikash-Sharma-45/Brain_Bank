import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

// Import react-pdf base styles
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set standard CDN worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer({
  fileUrl,
  initialPage = 1,
  onPageChange,
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(initialPage || 1);
  const [scale, setScale] = useState(1.0);
  const [fitWidth, setFitWidth] = useState(true);
  const [containerWidth, setContainerWidth] = useState(600);
  const [pageInput, setPageInput] = useState(String(initialPage || 1));
  const [loadError, setLoadError] = useState(null);

  const containerRef = useRef(null);

  // ResizeObserver to calculate available width for fitWidth mode
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoadError(null);
    const startPage = Math.min(Math.max(1, initialPage || 1), numPages);
    setPageNumber(startPage);
    setPageInput(String(startPage));
  };

  const onDocumentLoadError = (err) => {
    console.error('Failed to load PDF document:', err);
    setLoadError(err.message || 'Unable to load PDF document');
  };

  const goToPage = useCallback(
    (page) => {
      if (!numPages) return;
      const target = Math.min(Math.max(1, page), numPages);
      setPageNumber(target);
      setPageInput(String(target));
      if (onPageChange) {
        onPageChange(target);
      }
    },
    [numPages, onPageChange]
  );

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed)) {
      goToPage(parsed);
    } else {
      setPageInput(String(pageNumber));
    }
  };

  // Keyboard navigation for page up/down and arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToPage(pageNumber + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPage(pageNumber - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, goToPage]);

  // Touch pinch-zoom gesture handling
  const touchStartRef = useRef({ distance: 0, scale: 1 });
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { distance: dist, scale };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartRef.current.distance > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartRef.current.distance;
      const newScale = Math.min(Math.max(0.6, touchStartRef.current.scale * ratio), 2.5);
      setScale(newScale);
      setFitWidth(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* PDF Floating Control Bar */}
      <div className="sticky top-20 z-20 flex items-center justify-between gap-2 p-2 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-floating text-xs w-full max-w-lg">
        {/* Page Nav */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => goToPage(pageNumber - 1)}
            aria-label="Previous page"
            className="p-2 rounded-xl text-foreground hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => setPageInput(String(pageNumber))}
              className="w-10 h-8 rounded-lg border border-border bg-background text-center text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
              aria-label="Current page number"
            />
            <span className="text-muted-foreground font-medium">/ {numPages || '–'}</span>
          </form>

          <button
            type="button"
            disabled={numPages === null || pageNumber >= numPages}
            onClick={() => goToPage(pageNumber + 1)}
            aria-label="Next page"
            className="p-2 rounded-xl text-foreground hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border-l border-border/60 pl-2">
          <button
            type="button"
            onClick={() => {
              setFitWidth(false);
              setScale((prev) => Math.max(0.6, Math.round((prev - 0.15) * 100) / 100));
            }}
            aria-label="Zoom out"
            title="Zoom out"
            className="p-2 rounded-xl text-foreground hover:bg-surface-hover min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="w-12 text-center font-mono text-[11px] text-muted-foreground hidden sm:inline-block">
            {fitWidth ? 'Fit' : `${Math.round(scale * 100)}%`}
          </span>

          <button
            type="button"
            onClick={() => {
              setFitWidth(false);
              setScale((prev) => Math.min(2.5, Math.round((prev + 0.15) * 100) / 100));
            }}
            aria-label="Zoom in"
            title="Zoom in"
            className="p-2 rounded-xl text-foreground hover:bg-surface-hover min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setFitWidth(!fitWidth);
              if (!fitWidth) setScale(1.0);
            }}
            aria-label={fitWidth ? 'Reset fit width' : 'Fit page to width'}
            title={fitWidth ? 'Actual size' : 'Fit to width'}
            className={cn(
              'p-2 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors',
              fitWidth
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-foreground hover:bg-surface-hover'
            )}
          >
            {fitWidth ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* PDF View Container */}
      <div className="w-full flex justify-center overflow-x-auto py-2">
        {loadError ? (
          <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center max-w-md">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-semibold text-sm text-red-800 dark:text-red-200">Unable to load PDF</h4>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">{loadError}</p>
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="py-24 flex flex-col items-center justify-center space-y-3">
                <Spinner size="lg" />
                <p className="text-xs text-muted-foreground animate-pulse">Loading PDF pages...</p>
              </div>
            }
            className="shadow-soft rounded-2xl overflow-hidden border border-border bg-white"
          >
            {numPages && (
              <Page
                pageNumber={pageNumber}
                scale={fitWidth ? undefined : scale}
                width={fitWidth ? Math.min(containerWidth - 32, 850) : undefined}
                renderAnnotationLayer={true}
                renderTextLayer={true}
                className="transition-all duration-150"
              />
            )}
          </Document>
        )}
      </div>

      {/* Mobile Bottom Quick Page Jumper */}
      {numPages && numPages > 1 && (
        <div className="w-full max-w-md flex items-center justify-between text-xs text-muted-foreground px-4 py-2 bg-muted/40 rounded-xl">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => goToPage(pageNumber - 1)}
            className="font-medium hover:text-foreground disabled:opacity-40"
          >
            &larr; Prev
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => goToPage(pageNumber + 1)}
            className="font-medium hover:text-foreground disabled:opacity-40"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

export default PdfViewer;
