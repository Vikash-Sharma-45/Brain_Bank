import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { BookOpen, Folder, ArrowRight, Plus } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

export function Subjects() {
  const { isAdmin } = useAuth();

  const { data: subjectsData, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await api.get('/api/subjects');
      return res.data?.subjects || [];
    },
  });

  const subjects = subjectsData || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            Study Subjects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a subject to view its notes, chapters, and study materials
          </p>
        </div>

        {isAdmin && (
          <Link to="/admin">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Manage Subjects
            </Button>
          </Link>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-xs text-muted-foreground mt-3">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-3">
            <Folder className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No subjects yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Subjects will appear here once added by an administrator or loaded via the seed script.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link key={subject._id} to={`/subjects/${subject._id}`} className="group block">
              <Card className="h-full hover:border-brand-500/50 hover:shadow-soft transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Folder className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Order #{subject.order ?? 1}
                    </span>
                  </div>
                  <CardTitle className="text-xl mt-3 group-hover:text-brand-600 transition-colors">
                    {subject.name}
                  </CardTitle>
                  {subject.description && (
                    <CardDescription className="text-xs mt-1.5 line-clamp-3">
                      {subject.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-xs font-medium text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                    <span>View Notes</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Subjects;
