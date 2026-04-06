import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import StatCard from '@/components/StatCard';
import { Users, GraduationCap, BookOpen, ClipboardList, Calendar, BarChart3, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardHome: React.FC = () => {
  const { role, user } = useAuth();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, subjects: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [recentMarks, setRecentMarks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (role === 'admin') {
        const [s, t, c, sub] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('teachers').select('id', { count: 'exact', head: true }),
          supabase.from('classes').select('id', { count: 'exact', head: true }),
          supabase.from('subjects').select('id', { count: 'exact', head: true }),
        ]);
        setStats({
          students: s.count || 0,
          teachers: t.count || 0,
          classes: c.count || 0,
          subjects: sub.count || 0,
        });
      } else if (role === 'student' && user) {
        const { data: profile } = await supabase
          .from('students')
          .select('*, classes(name, section)')
          .eq('user_id', user.id)
          .single();
        setStudentProfile(profile);

        if (profile) {
          const { data: marks } = await supabase
            .from('marks')
            .select('*, subjects(name, code)')
            .eq('student_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(5);
          setRecentMarks(marks || []);
        }
      }

      const { data: ann } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setAnnouncements(ann || []);
    };
    if (role) fetchData();
  }, [role, user]);

  const greeting = `Welcome back${user?.user_metadata?.full_name ? ', ' + user.user_metadata.full_name : ''}!`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{greeting}</h1>
        <p className="text-muted-foreground capitalize">{role} Dashboard</p>
      </div>

      {role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={stats.students} icon={GraduationCap} colorClass="gradient-primary" />
          <StatCard title="Total Teachers" value={stats.teachers} icon={Users} colorClass="gradient-accent" />
          <StatCard title="Classes" value={stats.classes} icon={BookOpen} colorClass="bg-success" />
          <StatCard title="Subjects" value={stats.subjects} icon={ClipboardList} colorClass="bg-info" />
        </div>
      )}

      {role === 'student' && studentProfile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Class" value={studentProfile.classes ? `${studentProfile.classes.name} - ${studentProfile.classes.section}` : 'N/A'} icon={BookOpen} colorClass="gradient-primary" />
          <StatCard title="Roll Number" value={studentProfile.roll_number} icon={GraduationCap} colorClass="gradient-accent" />
          <StatCard title="Recent Exams" value={recentMarks.length} icon={BarChart3} colorClass="bg-success" />
        </div>
      )}

      {role === 'teacher' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Quick Action" value="Marks" icon={BarChart3} colorClass="gradient-primary" />
          <StatCard title="Quick Action" value="Attendance" icon={Calendar} colorClass="gradient-accent" />
          <StatCard title="Quick Action" value="Announce" icon={Bell} colorClass="bg-success" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-muted-foreground text-sm">No announcements yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <h4 className="font-medium text-sm text-foreground">{a.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {role === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Recent Marks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMarks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No marks recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentMarks.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div>
                        <p className="font-medium text-sm text-foreground">{m.subjects?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{m.exam_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{m.obtained_marks}/{m.max_marks}</p>
                        <p className={`text-xs font-medium ${(m.obtained_marks / m.max_marks) >= 0.6 ? 'text-success' : 'text-destructive'}`}>
                          {Math.round((m.obtained_marks / m.max_marks) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
