import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  Bookmark,
  CheckCircle2,
  Download,
  Share2,
  Maximize,
  Minimize,
  Type,
  List,
  Sparkles,
  FileText,
  Clock,
  ArrowUp,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import MarkdownRenderer from '../components/viewer/MarkdownRenderer';
import DocxRenderer from '../components/viewer/DocxRenderer';
import PdfViewer from '../components/viewer/PdfViewer';
import TableOfContents from '../components/viewer/TableOfContents';
import { cn } from '../lib/utils';

export function NoteViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, refetchUser } = useAuth();
  const queryClient = useQueryClient();

  // Viewer Preferences
  const [fontSize, setFontSize] = useState('base'); // 'sm' | 'base' | 'lg' | 'xl'
  const [fontFamily, setFontFamily] = useState('sans'); // 'sans' | 'serif'
  const [focusMode, setFocusMode] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollRef = useRef(null);
  const isInitialScrollRestored = useRef(false);

  // Fetch Note Details
  const { data: noteData, isLoading, error } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const res = await api.get(`/api/notes/${id}`);
      return res.data?.note;
    },
  });

  const note = noteData;

  // Determine user bookmarks and status for this note
  const isBookmarked = Boolean(user?.bookmarks?.includes(id));
  const currentStatusObj = user?.noteStatus?.find((s) => s.note === id);
  const currentStatus = currentStatusObj?.status || 'not_started';
  const isRevised = currentStatus === 'revised';

  // Find saved position from user.recentlyViewed
  const savedPosition = user?.recentlyViewed?.find((r) => r.note === id)?.position || 0;

  // Mutation: Toggle Bookmark
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await api.delete(`/api/users/bookmarks/${id}`);
      } else {
        await api.post(`/api/users/bookmarks/${id}`);
      }
    },
    onSuccess: () => {
      refetchUser();
      showToast({
        title: isBookmarked ? 'Bookmark removed' : 'Note bookmarked',
        description: isBookmarked ? 'Removed from saved notes' : 'Saved to your bookmarks collection',
        variant: 'default',
      });
    },
  });

  // Mutation: Update Status
  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      await api.patch(`/api/users/notes/${id}/status`, { status: newStatus });
    },
    onSuccess: (_, newStatus) => {
      refetchUser();
      showToast({
        title: newStatus === 'revised' ? 'Marked as Revised' : 'Status updated',
        description: newStatus === 'revised' ? 'Great job! Revision tracked in your stats.' : 'Study progress saved',
        variant: newStatus === 'revised' ? 'success' : 'default',
      });
    },
  });

  // Mutation: Save Reading Position
  const positionMutation = useMutation({
    mutationFn: async (position) => {
      await api.put(`/api/users/notes/${id}/position`, { position });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentNotes'] });
    },
  });

  // Debounced position saver
  const savePositionDebounced = useRef(null);
  const savePosition = useCallback(
    (pos) => {
      if (savePositionDebounced.current) clearTimeout(savePositionDebounced.current);
      savePositionDebounced.current = setTimeout(() => {
        positionMutation.mutate(pos);
      }, 1000);
    },
    [positionMutation]
  );

  // Restore scroll position for Markdown/DOCX on load
  useEffect(() => {
    if (!note || note.type === 'pdf' || isInitialScrollRestored.current) return;

    if (savedPosition > 0) {
      setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight > 0) {
          const targetY = (savedPosition / 100) * scrollHeight;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
        isInitialScrollRestored.current = true;
      }, 400);
    } else {
      isInitialScrollRestored.current = true;
    }
  }, [note, savedPosition]);

  // Track window scroll for Markdown/DOCX position & TOC spy
  useEffect(() => {
    if (!note || note.type === 'pdf') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.round((scrollY / docHeight) * 100) : 0;

      setShowScrollTop(scrollY > 400);

      // Save scroll % position
      if (percent > 0) {
        savePosition(percent);
      }

      // TOC active heading spy
      if (headings.length > 0) {
        let currentActive = headings[0].id;
        for (const h of headings) {
          const el = document.getElementById(h.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 140) {
              currentActive = h.id;
            } else {
              break;
            }
          }
        }
        setActiveHeadingId(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [note, headings, savePosition]);

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast({
      title: 'Link copied!',
      description: 'Note link copied to clipboard.',
      variant: 'default',
    });
  };

  // Scroll to TOC heading
  const scrollToHeading = (headingId) => {
    const el = document.getElementById(headingId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Toggle Focus Mode (Fullscreen immersion)
  useEffect(() => {
    const root = document.documentElement;
    if (focusMode) {
      root.classList.add('focus-reading-mode');
    } else {
      root.classList.remove('focus-reading-mode');
    }
    return () => root.classList.remove('focus-reading-mode');
  }, [focusMode]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-xs text-muted-foreground mt-3 animate-pulse">Loading study note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Note Not Found</h2>
        <p className="text-xs text-muted-foreground">
          {error?.message || 'This study note may have been removed.'}
        </p>
        <Link to="/subjects">
          <Button variant="outline" size="sm">
            Back to subjects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen pb-16 animate-in fade-in duration-300', focusMode && 'pt-4')}>
      {/* Top Header / Actions Bar */}
      <div
        className={cn(
          'sticky top-16 z-30 bg-surface/95 backdrop-blur-md border-b border-border transition-all py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6',
          focusMode && 'top-2 rounded-2xl mx-auto max-w-4xl border shadow-floating'
        )}
      >
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Back & Title info */}
          <div className="flex items-center space-x-2 min-w-0">
            <button
              onClick={() => {
                if (focusMode) {
                  setFocusMode(false);
                } else if (note.subject?._id) {
                  navigate(`/subjects/${note.subject._id}`);
                } else {
                  navigate('/subjects');
                }
              }}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover min-h-tap min-w-tap flex items-center justify-center transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
                  {note.title}
                </h1>
                <Badge
                  variant={note.type === 'pdf' ? 'default' : 'secondary'}
                  className="uppercase text-[10px] hidden sm:inline-flex"
                >
                  {note.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{note.subject?.name}</span>
                {note.chapter && (
                  <>
                    <span>&bull;</span>
                    <span className="truncate">{note.chapter}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Table of contents toggle for markdown/docx */}
            {headings.length > 0 && (
              <button
                onClick={() => setTocOpen(!tocOpen)}
                aria-label="Table of contents"
                title="Table of Contents"
                className={cn(
                  'p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover min-h-tap min-w-tap flex items-center justify-center transition-colors',
                  tocOpen && 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            )}

            {/* Typography / Reading controls (for text notes) */}
            {note.type !== 'pdf' && (
              <div className="hidden sm:flex items-center border border-border rounded-xl p-0.5 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setFontFamily(fontFamily === 'sans' ? 'serif' : 'sans')}
                  title={`Current font: ${fontFamily}. Click to toggle.`}
                  className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-surface transition-colors"
                >
                  {fontFamily === 'serif' ? 'Serif' : 'Sans'}
                </button>
                <div className="h-3 w-px bg-border mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    const sizes = ['sm', 'base', 'lg', 'xl'];
                    const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
                    setFontSize(next);
                  }}
                  title="Cycle font size"
                  className="px-2 py-1 text-xs font-mono uppercase rounded-lg hover:bg-surface transition-colors"
                >
                  {fontSize}
                </button>
              </div>
            )}

            {/* Bookmark button */}
            <button
              onClick={() => bookmarkMutation.mutate()}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark note'}
              title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
              className={cn(
                'p-2 rounded-xl min-h-tap min-w-tap flex items-center justify-center transition-colors',
                isBookmarked
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
              )}
            >
              <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
            </button>

            {/* Mark as Revised button */}
            <button
              onClick={() => statusMutation.mutate(isRevised ? 'reading' : 'revised')}
              aria-label={isRevised ? 'Marked as revised' : 'Mark as revised'}
              title={isRevised ? 'Revised! Click to unmark' : 'Mark as revised'}
              className={cn(
                'p-2 rounded-xl min-h-tap min-w-tap flex items-center justify-center transition-colors',
                isRevised
                  ? 'text-emerald-600 bg-emerald-500/10 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
              )}
            >
              <CheckCircle2 className={cn('h-4 w-4', isRevised && 'fill-emerald-500/20')} />
            </button>

            {/* Download Original if file exists */}
            {note.signedUrl && (
              <a
                href={note.signedUrl}
                download={note.originalFilename || `${note.title}.${note.type}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Download original file"
                title="Download original file"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover min-h-tap min-w-tap flex items-center justify-center transition-colors"
              >
                <Download className="h-4 w-4" />
              </a>
            )}

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              aria-label="Copy note link"
              title="Copy link"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover min-h-tap min-w-tap flex items-center justify-center transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* Focus Mode Toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
              title={focusMode ? 'Exit focus mode' : 'Focus Mode (Zen reading)'}
              className={cn(
                'p-2 rounded-xl min-h-tap min-w-tap flex items-center justify-center transition-colors',
                focusMode
                  ? 'bg-brand-600 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
              )}
            >
              {focusMode ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout with optional TOC */}
      <div className="flex items-start justify-center gap-8 max-w-7xl mx-auto">
        <main
          className={cn(
            'w-full transition-all duration-300',
            note.type === 'pdf' ? 'max-w-4xl' : 'max-w-3xl'
          )}
        >
          {/* Note Metadata Banner */}
          <div className="mb-6 pb-6 border-b border-border/50">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={isRevised ? 'revised' : 'reading'}>
                {isRevised ? 'Revised' : 'Reading'}
              </Badge>
              {note.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {note.title}
            </h1>
          </div>

          {/* Content Rendering based on type */}
          <div className="py-2">
            {note.type === 'markdown' && (
              <MarkdownRenderer
                content={note.content}
                fontSize={fontSize}
                fontFamily={fontFamily}
                onHeadingsExtracted={setHeadings}
              />
            )}

            {note.type === 'docx' && (
              <DocxRenderer
                htmlContent={note.content}
                fontSize={fontSize}
                fontFamily={fontFamily}
                onHeadingsExtracted={setHeadings}
              />
            )}

            {note.type === 'pdf' && (
              <PdfViewer
                fileUrl={note.signedUrl}
                initialPage={savedPosition || 1}
                onPageChange={(page) => savePosition(page)}
              />
            )}
          </div>

          {/* Completed / Footer Action */}
          <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {isRevised
                  ? 'Completed and marked revised'
                  : 'Reading in progress &bull; auto-saving position'}
              </span>
            </div>

            <Button
              onClick={() => statusMutation.mutate(isRevised ? 'reading' : 'revised')}
              variant={isRevised ? 'outline' : 'default'}
              size="default"
              className="gap-2 w-full sm:w-auto"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isRevised ? 'Mark as In-Progress' : 'Mark as Completed & Revised'}
            </Button>
          </div>
        </main>

        {/* Desktop Table of Contents (for markdown & docx) */}
        {headings.length > 0 && !focusMode && (
          <TableOfContents
            headings={headings}
            activeId={activeHeadingId}
            isOpen={tocOpen}
            onClose={() => setTocOpen(false)}
            onHeadingClick={scrollToHeading}
          />
        )}
      </div>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-20 md:bottom-8 right-6 z-30 p-3 rounded-full bg-brand-600 text-white shadow-floating hover:bg-brand-700 transition-all active:scale-95"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default NoteViewer;
