import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AnnouncementsPage: React.FC = () => {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState<string>('all');

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('announcements').insert({
        title,
        content,
        target_role: targetRole === 'all' ? null : targetRole as any,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'Announcement posted!' });
      setOpen(false);
      setTitle('');
      setContent('');
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const canCreate = role === 'admin' || role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Announcements
          </h1>
          <p className="text-muted-foreground">School-wide announcements and notices</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4" /> New Announcement</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createAnnouncement.mutate(); }} className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} required /></div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="student">Students Only</SelectItem>
                      <SelectItem value="teacher">Teachers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createAnnouncement.isPending}>Post Announcement</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : announcements?.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No announcements yet</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {announcements?.map((a) => (
            <Card key={a.id} className="animate-fade-in">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{a.title}</CardTitle>
                  </div>
                  {a.target_role && (
                    <Badge variant="outline" className="capitalize">{a.target_role}s</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 whitespace-pre-wrap">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(a.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
