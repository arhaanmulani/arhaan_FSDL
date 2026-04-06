import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';
import StatCard from '@/components/StatCard';

const StudentAttendancePage: React.FC = () => {
  const { user } = useAuth();

  const { data: student } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*').eq('user_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['student-attendance', student?.id],
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('*').eq('student_id', student!.id).order('date', { ascending: false });
      return data || [];
    },
    enabled: !!student,
  });

  const stats = React.useMemo(() => {
    if (!attendance) return { present: 0, absent: 0, late: 0, total: 0, pct: 0 };
    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const total = attendance.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, pct };
  }, [attendance]);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'present': return <Badge className="bg-success/10 text-success border-0">Present</Badge>;
      case 'absent': return <Badge className="bg-destructive/10 text-destructive border-0">Absent</Badge>;
      case 'late': return <Badge className="bg-warning/10 text-warning border-0">Late</Badge>;
      case 'excused': return <Badge className="bg-info/10 text-info border-0">Excused</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" /> My Attendance
        </h1>
        <p className="text-muted-foreground">View your attendance records</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Present" value={stats.present} icon={Check} colorClass="bg-success" />
        <StatCard title="Absent" value={stats.absent} icon={X} colorClass="bg-destructive" />
        <StatCard title="Late" value={stats.late} icon={Clock} colorClass="bg-warning" />
        <StatCard title="Rate" value={`${stats.pct}%`} icon={AlertCircle} colorClass="gradient-primary" />
      </div>

      <Card>
        <CardHeader><CardTitle>Attendance History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : attendance?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No attendance records</TableCell></TableRow>
              ) : (
                attendance?.map((a) => {
                  const d = new Date(a.date);
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{d.toLocaleDateString()}</TableCell>
                      <TableCell>{d.toLocaleDateString('en-US', { weekday: 'long' })}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{a.remarks || '-'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAttendancePage;
