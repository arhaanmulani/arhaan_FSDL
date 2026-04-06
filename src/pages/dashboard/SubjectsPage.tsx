import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, Plus } from 'lucide-react';

const SubjectsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', classId: '', teacherId: '' });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('*, classes(name, section), teachers(full_name)').order('name');
      return data || [];
    },
  });

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: async () => { const { data } = await supabase.from('classes').select('*'); return data || []; } });
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: async () => { const { data } = await supabase.from('teachers').select('*'); return data || []; } });

  const createSubject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('subjects').insert({
        name: form.name, code: form.code, class_id: form.classId,
        teacher_id: form.teacherId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Subject created!' });
      setOpen(false);
      setForm({ name: '', code: '', classId: '', teacherId: '' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" /> Subjects
          </h1>
          <p className="text-muted-foreground">Manage subjects and assign teachers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4" /> Add Subject</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Subject</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createSubject.mutate(); }} className="space-y-4">
              <div className="space-y-2"><Label>Subject Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="MATH101" required /></div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} - {c.section}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teacher (optional)</Label>
                <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                  <SelectTrigger><SelectValue placeholder="Assign teacher" /></SelectTrigger>
                  <SelectContent>{teachers?.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createSubject.isPending}>Create Subject</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Teacher</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : subjects?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No subjects yet</TableCell></TableRow>
              ) : (
                subjects?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.code}</TableCell>
                    <TableCell>{s.classes ? `${s.classes.name} - ${s.classes.section}` : '-'}</TableCell>
                    <TableCell>{s.teachers?.full_name || 'Unassigned'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectsPage;
