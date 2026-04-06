import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Save, Loader2, Check, X, Clock } from 'lucide-react';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: teacher } = useQuery({
    queryKey: ['teacher-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('teachers').select('*').eq('user_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: teacherSubjects } = useQuery({
    queryKey: ['teacher-subjects', teacher?.id],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('*, classes(id, name, section)').eq('teacher_id', teacher!.id);
      return data || [];
    },
    enabled: !!teacher,
  });

  const uniqueClasses = React.useMemo(() => {
    const map = new Map();
    teacherSubjects?.forEach((s) => {
      if (s.classes) map.set(s.classes.id, s.classes);
    });
    return Array.from(map.values());
  }, [teacherSubjects]);

  const { data: students } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*').eq('class_id', selectedClass).order('roll_number');
      return data || [];
    },
    enabled: !!selectedClass,
  });

  const { data: existingAttendance } = useQuery({
    queryKey: ['existing-attendance', selectedClass, date],
    queryFn: async () => {
      const studentIds = students?.map((s) => s.id) || [];
      if (studentIds.length === 0) return [];
      const { data } = await supabase.from('attendance').select('*').in('student_id', studentIds).eq('date', date);
      return data || [];
    },
    enabled: !!students && students.length > 0,
  });

  React.useEffect(() => {
    if (existingAttendance && students) {
      const initial: Record<string, string> = {};
      students.forEach((s) => {
        const existing = existingAttendance.find((a) => a.student_id === s.id);
        initial[s.id] = existing?.status || 'present';
      });
      setAttendanceData(initial);
    }
  }, [existingAttendance, students]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const student of students || []) {
        const status = attendanceData[student.id] || 'present';
        const existing = existingAttendance?.find((a) => a.student_id === student.id);
        if (existing) {
          await supabase.from('attendance').update({ status }).eq('id', existing.id);
        } else {
          await supabase.from('attendance').insert({ student_id: student.id, date, status });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['existing-attendance'] });
      toast({ title: 'Attendance saved!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'present') return <Check className="w-4 h-4 text-success" />;
    if (status === 'absent') return <X className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-warning" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" /> Attendance
        </h1>
        <p className="text-muted-foreground">Mark daily attendance for your classes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {uniqueClasses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} - {c.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {selectedClass && students && students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mark Attendance — {date}</CardTitle>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.roll_number}</TableCell>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusIcon(attendanceData[s.id] || 'present')}
                        <Select value={attendanceData[s.id] || 'present'} onValueChange={(v) => setAttendanceData((prev) => ({ ...prev, [s.id]: v }))}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendancePage;
