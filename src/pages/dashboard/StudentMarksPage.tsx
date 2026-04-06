import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';

const StudentMarksPage: React.FC = () => {
  const { user } = useAuth();

  const { data: student } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*').eq('user_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: marks, isLoading } = useQuery({
    queryKey: ['student-marks', student?.id],
    queryFn: async () => {
      const { data } = await supabase.from('marks').select('*, subjects(name, code)').eq('student_id', student!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!student,
  });

  const groupedByExam = marks?.reduce((acc, m) => {
    if (!acc[m.exam_type]) acc[m.exam_type] = [];
    acc[m.exam_type].push(m);
    return acc;
  }, {} as Record<string, typeof marks>) || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> My Marks
        </h1>
        <p className="text-muted-foreground">View your academic performance</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : Object.keys(groupedByExam).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No marks recorded yet</CardContent></Card>
      ) : (
        Object.entries(groupedByExam).map(([examType, examMarks]) => {
          const totalObtained = examMarks.reduce((s, m) => s + m.obtained_marks, 0);
          const totalMax = examMarks.reduce((s, m) => s + m.max_marks, 0);
          const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

          return (
            <Card key={examType}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{examType}</span>
                  <Badge variant={overallPct >= 60 ? 'default' : 'destructive'}>
                    Overall: {overallPct}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examMarks.map((m) => {
                      const pct = m.max_marks > 0 ? Math.round((m.obtained_marks / m.max_marks) * 100) : 0;
                      const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 40 ? 'D' : 'F';
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.subjects?.name}</TableCell>
                          <TableCell>{m.subjects?.code}</TableCell>
                          <TableCell>{m.obtained_marks}/{m.max_marks}</TableCell>
                          <TableCell>
                            <span className={pct >= 60 ? 'text-success font-medium' : pct >= 40 ? 'text-warning font-medium' : 'text-destructive font-medium'}>
                              {pct}%
                            </span>
                          </TableCell>
                          <TableCell><Badge variant="outline">{grade}</Badge></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{m.remarks || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default StudentMarksPage;
