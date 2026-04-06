import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus } from 'lucide-react';

const ClassesPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [section, setSection] = useState('A');
  const [year, setYear] = useState('2025-2026');

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data || [];
    },
  });

  const createClass = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('classes').insert({ name, section, academic_year: year });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: 'Class created!' });
      setOpen(false);
      setName('');
      setSection('A');
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Classes
          </h1>
          <p className="text-muted-foreground">Manage classes and sections</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> Add Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Class</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createClass.mutate(); }} className="space-y-4">
              <div className="space-y-2"><Label>Class Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grade 10" required /></div>
              <div className="space-y-2"><Label>Section</Label><Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="A" /></div>
              <div className="space-y-2"><Label>Academic Year</Label><Input value={year} onChange={(e) => setYear(e.target.value)} /></div>
              <Button type="submit" className="w-full" disabled={createClass.isPending}>Create Class</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Academic Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : classes?.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No classes yet</TableCell></TableRow>
              ) : (
                classes?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.section}</TableCell>
                    <TableCell>{c.academic_year}</TableCell>
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

export default ClassesPage;
