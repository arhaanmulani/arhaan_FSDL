import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import StudentsPage from "./pages/dashboard/StudentsPage";
import TeachersPage from "./pages/dashboard/TeachersPage";
import ClassesPage from "./pages/dashboard/ClassesPage";
import SubjectsPage from "./pages/dashboard/SubjectsPage";
import CreateUserPage from "./pages/dashboard/CreateUserPage";
import MarksPage from "./pages/dashboard/MarksPage";
import AttendancePage from "./pages/dashboard/AttendancePage";
import StudentMarksPage from "./pages/dashboard/StudentMarksPage";
import StudentAttendancePage from "./pages/dashboard/StudentAttendancePage";
import AnnouncementsPage from "./pages/dashboard/AnnouncementsPage";
import TeacherClassesPage from "./pages/dashboard/TeacherClassesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              {/* Admin routes */}
              <Route path="students" element={<ProtectedRoute allowedRoles={['admin']}><StudentsPage /></ProtectedRoute>} />
              <Route path="teachers" element={<ProtectedRoute allowedRoles={['admin']}><TeachersPage /></ProtectedRoute>} />
              <Route path="classes" element={<ProtectedRoute allowedRoles={['admin']}><ClassesPage /></ProtectedRoute>} />
              <Route path="subjects" element={<ProtectedRoute allowedRoles={['admin']}><SubjectsPage /></ProtectedRoute>} />
              <Route path="create-user" element={<ProtectedRoute allowedRoles={['admin']}><CreateUserPage /></ProtectedRoute>} />
              {/* Teacher routes */}
              <Route path="my-classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherClassesPage /></ProtectedRoute>} />
              <Route path="marks" element={<ProtectedRoute allowedRoles={['teacher']}><MarksPage /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute allowedRoles={['teacher']}><AttendancePage /></ProtectedRoute>} />
              {/* Student routes */}
              <Route path="my-marks" element={<ProtectedRoute allowedRoles={['student']}><StudentMarksPage /></ProtectedRoute>} />
              <Route path="my-attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentAttendancePage /></ProtectedRoute>} />
              {/* Shared */}
              <Route path="announcements" element={<AnnouncementsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
