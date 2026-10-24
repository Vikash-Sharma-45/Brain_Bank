import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import {
  BookOpen,
  Search,
  ArrowRight,
  Bookmark,
  Sparkles,
  Folder,
  Clock,
  PlayCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export function Home() {
  const { user } = useAuth();

  // 1. Fetch recently viewed notes for "Continue where you left off"
  const { data: recentData, isLoading: loadingRecent } = useQuery({
    queryKey: ['recentNotes'],
    queryFn: async () => {
      const res = await api.get('/api/users/recent');
      return res.data?.recent || [];
    },
  });

  // 2. Fetch subject progress
  const { data: progressData, isLoading: loadingProgress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const res = await api.get('/api/users/progress');
      return res.data?.progress || [];
    },
  });

  // 3. Fetch bookmarks
  const { data: bookmarksData, isLoading: loadingBookmarks } = useQuery({
    queryKey: ['userBookmarks'],
    queryFn: async () => {
      const res = await api.get('/api/users/bookmarks');
      return res.data?.bookmarks || [];
    },
  });

  const recentNotes = recentData || [];
  const subjectProgress = progressData || [];
  const bookmarks = bookmarksData || [];

  // Most recent note for "Continue where you left off"
  const latestNoteItem = recentNotes.length > 0 ? recentNotes[0] : null;
  const latestNote = latestNoteItem?.note;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* "Continue Where You Left Off" Hero Banner (if recent note exists) */}
      {latestNote ? (
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 sm:p-7 shadow-soft relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white">
              <PlayCircle className="h-3.5 w-3.5 text-amber-300" />
              <span>Continue Where You Left Off</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                {latestNote.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-brand-100 mt-1">
                <span>{latestNote.subject?.name}</span>
                {latestNote.chapter && (
                  <>
                    <span>&bull;</span>
                    <span>{latestNote.chapter}</span>
                  </>
                )}
                <span>&bull;</span>
                <span className="uppercase font-mono">{latestNote.type}</span>
                {latestNoteItem.position > 0 && (
                  <>
                    <span>&bull;</span>
                    <span className="font-medium text-amber-200">
                      {latestNote.type === 'pdf'
                        ? `Page ${latestNoteItem.position}`
                        : `${latestNoteItem.position}% read`}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link to={`/notes/${latestNote._id}`}>
                <Button
                  size="default"
                  className="bg-white text-brand-900 hover:bg-brand-50 font-semibold shadow-sm gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Resume Reading
                </Button>
              </Link>
              <Link to="/subjects">
                <Button
                  variant="outline"
                  size="default"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Browse All
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        </div>
      ) : (
        /* Welcome Banner when user has no recent history */
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 sm:p-7 shadow-soft relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Mobile-First Study Notes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Reader'}
            </h1>
            <p className="text-brand-100 text-sm leading-relaxed">
              Explore your course materials, track your revision progress, and read smoothly on phone, tablet, or laptop.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link to="/subjects">
                <Button
                  size="default"
                  className="bg-white text-brand-900 hover:bg-brand-50 font-semibold shadow-sm gap-2"
                >
                  Browse Subjects
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        </div>
      )}

      {/* Subject Cards with Progress Bars */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            Subject Progress
          </h2>
          <Link
            to="/subjects"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            All Subjects &rarr;
          </Link>
        </div>

        {loadingProgress ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : subjectProgress.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-sm text-muted-foreground">
              No subjects registered yet. Admin can create subjects or run the seed script.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectProgress.map((subj) => (
              <Link key={subj.subjectId} to={`/subjects/${subj.subjectId}`} className="group block">
                <Card className="h-full hover:border-brand-500/40 hover:shadow-soft transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <Folder className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold font-mono text-muted-foreground">
                        {subj.revisedCount}/{subj.totalNotes} Revised
                      </span>
                    </div>

                    <CardTitle className="text-base mt-3 group-hover:text-brand-600 transition-colors">
                      {subj.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {/* Progress bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${subj.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{subj.percentage}% completed</span>
                      <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
                        Study &rarr;
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Section: Recently Viewed & Bookmarked Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Viewed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Recently Viewed
            </h3>
          </div>

          {loadingRecent ? (
            <div className="py-8 flex justify-center">
              <Spinner />
            </div>
          ) : recentNotes.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <p className="text-xs text-muted-foreground">
                Notes you read will automatically appear here with your saved position.
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {recentNotes.slice(0, 4).map((item) => {
                const n = item.note;
                if (!n) return null;
                return (
                  <Link key={n._id} to={`/notes/${n._id}`} className="block group">
                    <Card className="p-3.5 hover:border-brand-500/40 hover:bg-surface-hover/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0 pr-3">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-brand-600 transition-colors truncate">
                            {n.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {n.subject?.name} &bull; {n.chapter || 'Chapter'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={n.type === 'pdf' ? 'default' : 'secondary'} className="uppercase text-[9px] font-mono">
                            {n.type}
                          </Badge>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bookmarked Notes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-amber-500" />
              Saved Bookmarks
            </h3>
            <Link
              to="/saved"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {loadingBookmarks ? (
            <div className="py-8 flex justify-center">
              <Spinner />
            </div>
          ) : bookmarks.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <p className="text-xs text-muted-foreground">
                Click the bookmark icon on any note to save it here for fast revision.
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {bookmarks.slice(0, 4).map((b) => (
                <Link key={b._id} to={`/notes/${b._id}`} className="block group">
                  <Card className="p-3.5 hover:border-brand-500/40 hover:bg-surface-hover/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-brand-600 transition-colors truncate">
                          {b.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {b.subject?.name} &bull; {b.chapter || 'General'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="uppercase text-[9px] font-mono">
                          {b.type}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
