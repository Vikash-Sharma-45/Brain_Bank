import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FolderPlus,
  Layers,
  Pencil,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import api from '../lib/api';

const emptySubject = { name: '', slug: '', description: '', order: '0' };
const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function Admin() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activePanel, setActivePanel] = useState(null);
  const [note, setNote] = useState({
    title: '',
    subject: '',
    chapter: '',
    tags: '',
    order: '0',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [subjectDraft, setSubjectDraft] = useState(emptySubject);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await api.get('/api/subjects');
      return response.data?.subjects || [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => api.post('/api/notes', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      showToast({ title: 'Note uploaded', description: 'The note is now available.', variant: 'success' });
      setNote({ title: '', subject: '', chapter: '', tags: '', order: '0' });
      setSelectedFile(null);
      setActivePanel(null);
    },
    onError: (error) => {
      showToast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    },
  });

  const saveSubjectMutation = useMutation({
    mutationFn: ({ id, data }) =>
      id ? api.put(`/api/subjects/${id}`, data) : api.post('/api/subjects', data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      showToast({
        title: variables.id ? 'Subject updated' : 'Subject created',
        variant: 'success',
      });
      resetSubjectForm();
    },
    onError: (error) => {
      showToast({ title: 'Could not save subject', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/subjects/${id}`),
    onSuccess: (_response, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      showToast({ title: 'Subject deleted', variant: 'success' });
      if (editingSubjectId === deletedId) resetSubjectForm();
    },
    onError: (error) => {
      showToast({ title: 'Could not delete subject', description: error.message, variant: 'destructive' });
    },
  });

  function resetSubjectForm() {
    setSubjectDraft(emptySubject);
    setEditingSubjectId(null);
    setSlugEdited(false);
  }

  function openPanel(panel) {
    setActivePanel((current) => (current === panel ? null : panel));
    if (panel !== 'subjects') resetSubjectForm();
  }

  function startEditingSubject(subject) {
    setEditingSubjectId(subject._id);
    setSubjectDraft({
      name: subject.name,
      slug: subject.slug,
      description: subject.description || '',
      order: String(subject.order ?? 0),
    });
    setSlugEdited(true);
  }

  function handleUpload(event) {
    event.preventDefault();
    if (!selectedFile) {
      showToast({ title: 'Choose a file', description: 'Select an .md, .pdf, or .docx file to upload.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', note.title);
    formData.append('subject', note.subject);
    formData.append('chapter', note.chapter);
    formData.append('tags', note.tags);
    formData.append('order', note.order);
    uploadMutation.mutate(formData);
  }

  function handleSubjectSubmit(event) {
    event.preventDefault();
    saveSubjectMutation.mutate({
      id: editingSubjectId,
      data: {
        ...subjectDraft,
        order: Number(subjectDraft.order),
      },
    });
  }

  function handleDeleteSubject(subject) {
    if (window.confirm(`Delete "${subject.name}"? Subjects with notes cannot be deleted.`)) {
      deleteSubjectMutation.mutate(subject._id);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            Admin Dashboard
          </h1>
          <Badge variant="admin">Admin Only</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage study subjects and upload Markdown, PDF, or Word notes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => openPanel('upload')}
          aria-expanded={activePanel === 'upload'}
          className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-colors hover:border-brand-500/50"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Upload className="h-5 w-5" />
          </div>
          <h2 className="text-base font-semibold mt-3">Upload Notes</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Add an .md, .pdf, or .docx note to a subject.
          </p>
        </button>

        <button
          type="button"
          onClick={() => openPanel('subjects')}
          aria-expanded={activePanel === 'subjects'}
          className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-colors hover:border-brand-500/50"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FolderPlus className="h-5 w-5" />
          </div>
          <h2 className="text-base font-semibold mt-3">Manage Subjects</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Create, edit, reorder, or remove subjects.
          </p>
        </button>
      </div>

      {activePanel === 'upload' && (
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg">Upload a note</CardTitle>
              <CardDescription>Files may be up to 25 MB.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close upload form" onClick={() => setActivePanel(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 && !subjectsLoading ? (
              <p className="text-sm text-muted-foreground">
                {subjectsError ? 'Subjects could not be loaded.' : 'Create a subject before uploading a note.'}
              </p>
            ) : (
              <form onSubmit={handleUpload} className="space-y-4">
                <Input
                  label="Note title"
                  name="title"
                  value={note.title}
                  onChange={(event) => setNote({ ...note, title: event.target.value })}
                  required
                  maxLength={200}
                />
                <div className="w-full flex flex-col space-y-1.5">
                  <label htmlFor="note-subject" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Subject
                  </label>
                  <select
                    id="note-subject"
                    value={note.subject}
                    onChange={(event) => setNote({ ...note, subject: event.target.value })}
                    required
                    disabled={subjectsLoading}
                    className="h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Chapter (optional)"
                  name="chapter"
                  value={note.chapter}
                  onChange={(event) => setNote({ ...note, chapter: event.target.value })}
                  maxLength={150}
                />
                <Input
                  label="Tags (comma-separated)"
                  name="tags"
                  value={note.tags}
                  onChange={(event) => setNote({ ...note, tags: event.target.value })}
                  placeholder="calculus, limits"
                />
                <Input
                  label="Display order"
                  name="note-order"
                  type="number"
                  min="0"
                  value={note.order}
                  onChange={(event) => setNote({ ...note, order: event.target.value })}
                />
                <div className="w-full flex flex-col space-y-1.5">
                  <label htmlFor="note-file" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Note file
                  </label>
                  <input
                    id="note-file"
                    type="file"
                    accept=".md,.pdf,.docx"
                    required
                    onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" isLoading={uploadMutation.isPending} disabled={!subjects.length}>
                    <Upload className="h-4 w-4 mr-2" /> Upload note
                  </Button>
                  <Button variant="outline" onClick={() => setActivePanel(null)}>Cancel</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {activePanel === 'subjects' && (
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg">Manage subjects</CardTitle>
              <CardDescription>Create subjects or update their details and display order.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close subject manager" onClick={() => setActivePanel(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <Input
                label="Subject name"
                name="subject-name"
                value={subjectDraft.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setSubjectDraft((current) => ({
                    ...current,
                    name,
                    ...(!slugEdited ? { slug: slugify(name) } : {}),
                  }));
                }}
                required
                maxLength={120}
              />
              <Input
                label="Slug"
                name="subject-slug"
                value={subjectDraft.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setSubjectDraft({ ...subjectDraft, slug: slugify(event.target.value) });
                }}
                required
                maxLength={120}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                helperText="Lowercase letters, numbers, and hyphens."
              />
              <div className="w-full flex flex-col space-y-1.5">
                <label htmlFor="subject-description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description (optional)
                </label>
                <textarea
                  id="subject-description"
                  value={subjectDraft.description}
                  onChange={(event) => setSubjectDraft({ ...subjectDraft, description: event.target.value })}
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>
              <Input
                label="Display order"
                name="subject-order"
                type="number"
                min="0"
                value={subjectDraft.order}
                onChange={(event) => setSubjectDraft({ ...subjectDraft, order: event.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit" isLoading={saveSubjectMutation.isPending}>
                  {editingSubjectId ? 'Save changes' : 'Create subject'}
                </Button>
                {editingSubjectId && (
                  <Button type="button" variant="outline" onClick={resetSubjectForm}>Cancel edit</Button>
                )}
              </div>
            </form>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold mb-3">Existing subjects</h3>
              {subjectsLoading ? (
                <p className="text-sm text-muted-foreground">Loading subjects…</p>
              ) : subjectsError ? (
                <p className="text-sm text-red-600">Could not load subjects. Try again by refreshing the page.</p>
              ) : subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subjects yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {subjects.map((subject) => (
                    <li key={subject._id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">/{subject.slug} · Order {subject.order ?? 0}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${subject.name}`}
                          onClick={() => startEditingSubject(subject)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${subject.name}`}
                          disabled={deleteSubjectMutation.isPending}
                          onClick={() => handleDeleteSubject(subject)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="p-8 text-center border-dashed">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-3">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Admin workspace</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Use the actions above to upload study notes and manage your subject list.
        </p>
      </Card>
    </div>
  );
}

export default Admin;
