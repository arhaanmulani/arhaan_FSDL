import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen } from 'lucide-react';

const TeacherClassesPage: React.FC = () => {
  const { user } = useAuth();

  const { data: teacher } = useQuery({
    queryKey: ['teacher-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('teachers').select('*').eq('user_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['teacher-subjects', teacher?.id],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('*, classes(name, section, academic_year)').eq('teacher_id', teacher!.id);
      return data || [];
    },
    enabled: !!teacher,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> My Classes
        </h1>
        <p className="text-muted-foreground">Subjects and classes assigned to you</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Academic Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : subjects?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No subjects assigned</TableCell></TableRow>
              ) : (
                subjects?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.code}</TableCell>
                    <TableCell>{s.classes ? `${s.classes.name} - ${s.classes.section}` : '-'}</TableCell>
                    <TableCell>{s.classes?.academic_year || '-'}</TableCell>
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

export default TeacherClassesPage;
