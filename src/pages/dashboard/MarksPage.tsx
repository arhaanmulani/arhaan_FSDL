import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Save, Loader2 } from 'lucide-react';

const MarksPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('midterm');
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksData, setMarksData] = useState<Record<string, { obtained: number; remarks: string }>>({});
  const [saving, setSaving] = useState(false);

  const { data: teacher } = useQuery({
    queryKey: ['teacher-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('teachers').select('*').eq('user_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: subjects } = useQuery({
    queryKey: ['teacher-subjects', teacher?.id],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('*, classes(name, section)').eq('teacher_id', teacher!.id);
      return data || [];
    },
    enabled: !!teacher,
  });

  const selectedSubjectData = subjects?.find((s) => s.id === selectedSubject);

  const { data: students } = useQuery({
    queryKey: ['class-students', selectedSubjectData?.class_id],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*').eq('class_id', selectedSubjectData!.class_id).order('roll_number');
      return data || [];
    },
    enabled: !!selectedSubjectData?.class_id,
  });

  const { data: existingMarks } = useQuery({
    queryKey: ['existing-marks', selectedSubject, examType],
    queryFn: async () => {
      const { data } = await supabase.from('marks')
        .select('*')
        .eq('subject_id', selectedSubject)
        .eq('exam_type', examType);
      return data || [];
    },
    enabled: !!selectedSubject,
  });

  React.useEffect(() => {
    if (existingMarks && students) {
      const initial: Record<string, { obtained: number; remarks: string }> = {};
      students.forEach((s) => {
        const existing = existingMarks.find((m) => m.student_id === s.id);
        initial[s.id] = {
          obtained: existing?.obtained_marks ?? 0,
          remarks: existing?.remarks ?? '',
        };
      });
      setMarksData(initial);
    }
  }, [existingMarks, students]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const student of students || []) {
        const data = marksData[student.id];
        if (!data) continue;
        const existing = existingMarks?.find((m) => m.student_id === student.id);
        if (existing) {
          await supabase.from('marks').update({
            obtained_marks: data.obtained,
            max_marks: maxMarks,
            remarks: data.remarks,
          }).eq('id', existing.id);
        } else {
          await supabase.from('marks').insert({
            student_id: student.id,
            subject_id: selectedSubject,
            exam_type: examType,
            max_marks: maxMarks,
            obtained_marks: data.obtained,
            remarks: data.remarks,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['existing-marks'] });
      toast({ title: 'Marks saved successfully!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Manage Marks
        </h1>
        <p className="text-muted-foreground">Update student marks for your subjects</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>
              {subjects?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.classes?.name} - {s.classes?.section})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Exam Type</Label>
          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="midterm">Midterm</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="practical">Practical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Max Marks</Label>
          <Input type="number" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} />
        </div>
      </div>

      {selectedSubject && students && students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Enter Marks</CardTitle>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save All</>}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Marks (/{maxMarks})</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => {
                  const d = marksData[s.id] || { obtained: 0, remarks: '' };
                  const pct = maxMarks > 0 ? Math.round((d.obtained / maxMarks) * 100) : 0;
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{s.roll_number}</TableCell>
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={maxMarks}
                          className="w-20"
                          value={d.obtained}
                          onChange={(e) => setMarksData((prev) => ({
                            ...prev,
                            [s.id]: { ...prev[s.id], obtained: Number(e.target.value) },
                          }))}
                        />
                      </TableCell>
                      <TableCell>
                        <span className={pct >= 60 ? 'text-success font-medium' : pct >= 40 ? 'text-warning font-medium' : 'text-destructive font-medium'}>
                          {pct}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input
                          className="w-32"
                          placeholder="Remarks"
                          value={d.remarks}
                          onChange={(e) => setMarksData((prev) => ({
                            ...prev,
                            [s.id]: { ...prev[s.id], remarks: e.target.value },
                          }))}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarksPage;
