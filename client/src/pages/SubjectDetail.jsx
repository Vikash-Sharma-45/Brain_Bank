import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import {
  ChevronLeft,
  Folder,
  FileText,
  Bookmark,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ArrowRight,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { cn } from '../lib/utils';

export function SubjectDetail() {
  const { id } = useParams();
  const { user, isAdmin, refetchUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Filters
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'markdown' | 'pdf' | 'docx'
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch subject details
  const { data: subjectData, isLoading: loadingSubject } = useQuery({
    queryKey: ['subject', id],
    queryFn: async () => {
      const res = await api.get(`/api/subjects/${id}`);
      return res.data?.subject || null;
    },
  });

  // Fetch all notes for this subject
  const {
    data: notesData,
    isLoading: loadingNotes,
    isError: notesError,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ['notes', { subject: id }],
    queryFn: async () => {
      const res = await api.get(`/api/notes?subject=${id}&limit=50`);
      return res.data?.notes || [];
    },
  });

  const subject = subjectData;
  const rawNotes = notesData || [];

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ noteId, isBookmarked }) => {
      if (isBookmarked) {
        await api.delete(`/api/users/bookmarks/${noteId}`);
      } else {
        await api.post(`/api/users/bookmarks/${noteId}`);
      }
    },
    onSuccess: (_, { isBookmarked }) => {
      refetchUser();
      showToast({
        title: isBookmarked ? 'Bookmark removed' : 'Note bookmarked',
        description: isBookmarked ? 'Removed from saved' : 'Added to your bookmarks',
        variant: 'default',
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => api.delete(`/api/notes/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotes'] });
      queryClient.invalidateQueries({ queryKey: ['userBookmarks'] });
      showToast({ title: 'Note deleted', description: 'The note has been removed.', variant: 'success' });
    },
    onError: (error) => {
      showToast({ title: 'Could not delete note', description: error.message, variant: 'destructive' });
    },
  });

  function handleDeleteNote(note) {
    if (window.confirm(`Delete "${note.title}"? This cannot be undone.`)) {
      deleteNoteMutation.mutate(note._id);
    }
  }

  // Extract all unique tags across notes for filtering
  const allTags = useMemo(() => {
    const tagSet = new Set();
    rawNotes.forEach((n) => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [rawNotes]);

  // Filter notes by type, tag, and search query
  const filteredNotes = useMemo(() => {
    return rawNotes.filter((note) => {
      if (selectedType !== 'all' && note.type !== selectedType) return false;
      if (selectedTag && !note.tags?.includes(selectedTag)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title?.toLowerCase().includes(q);
        const matchesChapter = note.chapter?.toLowerCase().includes(q);
        const matchesTags = note.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesChapter && !matchesTags) return false;
      }
      return true;
    });
  }, [rawNotes, selectedType, selectedTag, searchQuery]);

  // Group filtered notes by chapter
  const groupedByChapter = useMemo(() => {
    const groups = {};
    filteredNotes.forEach((note) => {
      const chapterKey = note.chapter?.trim() || 'General / Uncategorized';
      if (!groups[chapterKey]) {
        groups[chapterKey] = [];
      }
      groups[chapterKey].push(note);
    });
    return groups;
  }, [filteredNotes]);

  // Status helper
  const getNoteStatus = (noteId) => {
    const found = user?.noteStatus?.find((s) => s.note === noteId);
    return found?.status || 'not_started';
  };

  const isNoteBookmarked = (noteId) => {
    return Boolean(user?.bookmarks?.includes(noteId));
  };

  if (loadingSubject) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-xs text-muted-foreground mt-3">Loading subject details...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <Folder className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Subject Not Found</h2>
        <p className="text-xs text-muted-foreground">This study subject may have been removed.</p>
        <Link to="/subjects">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to subjects
          </Button>
        </Link>
      </div>
    );
  }

  const chapterNames = Object.keys(groupedByChapter);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header & Breadcrumb */}
      <div>
        <Link
          to="/subjects"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors min-h-[36px]"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to all subjects
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-border shadow-soft">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Folder className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {subject.name}
              </h1>
            </div>
            {subject.description && (
              <p className="text-sm text-muted-foreground max-w-2xl mt-1 leading-relaxed">
                {subject.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Badge variant="outline" className="font-mono text-xs px-3 py-1">
              {rawNotes.length} {rawNotes.length === 1 ? 'Note' : 'Notes'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Quick Search inside subject */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter notes by title or chapter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Formats' },
              { id: 'markdown', label: 'Markdown' },
              { id: 'pdf', label: 'PDF' },
              { id: 'docx', label: 'Word' },
            ].map(({ id: typeId, label }) => (
              <button
                key={typeId}
                type="button"
                onClick={() => setSelectedType(typeId)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap min-h-[36px]',
                  selectedType === typeId
                    ? 'bg-surface text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag pills if present */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Tags:
            </span>
            <button
              onClick={() => setSelectedTag('')}
              className={cn(
                'text-xs px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap',
                selectedTag === ''
                  ? 'bg-brand-600 text-white font-medium'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap',
                  selectedTag === tag
                    ? 'bg-brand-600 text-white font-medium'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grouped by Chapter */}
      {loadingNotes ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : notesError ? (
        <Card className="p-8 text-center">
          <h3 className="text-base font-semibold text-foreground">Could not load notes</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Check your connection and try again.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetchNotes()}>
            Retry
          </Button>
        </Card>
      ) : chapterNames.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No notes found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {rawNotes.length === 0
              ? 'No notes have been added to this subject yet.'
              : 'No notes match your selected filters. Try resetting the filters.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {chapterNames.map((chapterName) => {
            const chapterNotes = groupedByChapter[chapterName];

            return (
              <div key={chapterName} className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                  <h2 className="text-base font-bold text-foreground tracking-tight">
                    {chapterName}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    ({chapterNotes.length} {chapterNotes.length === 1 ? 'note' : 'notes'})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chapterNotes.map((note) => {
                    const status = getNoteStatus(note._id);
                    const bookmarked = isNoteBookmarked(note._id);

                    const statusBadgeMap = {
                      revised: { label: 'Revised', variant: 'revised' },
                      reading: { label: 'Reading', variant: 'reading' },
                      not_started: { label: 'Not started', variant: 'not_started' },
                    };

                    return (
                      <Card
                        key={note._id}
                        className="group hover:border-brand-500/50 hover:shadow-soft transition-all relative flex flex-col justify-between"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={note.type === 'pdf' ? 'default' : 'secondary'}
                                className="uppercase text-[10px] font-mono px-2 py-0.5"
                              >
                                {note.type}
                              </Badge>
                              <Badge
                                variant={statusBadgeMap[status]?.variant || 'not_started'}
                                className="text-[10px] px-2 py-0.5"
                              >
                                {statusBadgeMap[status]?.label || 'Not started'}
                              </Badge>
                            </div>

                            {/* Bookmark Toggle Button */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  bookmarkMutation.mutate({
                                    noteId: note._id,
                                    isBookmarked: bookmarked,
                                  });
                                }}
                                className={cn(
                                  'p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors',
                                  bookmarked && 'text-amber-500'
                                )}
                                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark note'}
                                title={bookmarked ? 'Bookmarked' : 'Bookmark'}
                              >
                                <Bookmark
                                  className={cn('h-4 w-4', bookmarked && 'fill-current')}
                                />
                              </button>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleDeleteNote(note);
                                  }}
                                  disabled={deleteNoteMutation.isPending}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                  aria-label={`Delete ${note.title}`}
                                  title="Delete note"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          <Link to={`/notes/${note._id}`} className="block mt-2">
                            <CardTitle className="text-base group-hover:text-brand-600 transition-colors leading-snug">
                              {note.title}
                            </CardTitle>
                          </Link>

                          {note.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {note.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </CardHeader>

                        <CardContent className="pt-0">
                          <Link
                            to={`/notes/${note._id}`}
                            className="inline-flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform min-h-[36px]"
                          >
                            <span>Read Note</span>
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SubjectDetail;
