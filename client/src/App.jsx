import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import HodDashboard from './pages/hod/HodDashboard';
import HodFaculty from './pages/hod/HodFaculty';
import HodStudents from './pages/hod/HodStudents';
import HodAdmin from './pages/hod/HodAdmin';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyWork from './pages/faculty/FacultyWork';
import FacultySyllabus from './pages/faculty/FacultySyllabus';
import FacultyUpload from './pages/faculty/FacultyUpload';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyAdmin from './pages/faculty/FacultyAdmin';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentPerformance from './pages/student/StudentPerformance';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;
    return children;
};

function App() {
    const { user } = useAuth();

    const getDefaultRoute = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'hod': return '/hod/dashboard';
            case 'faculty': return '/faculty/dashboard';
            case 'student': return '/student/dashboard';
            default: return '/login';
        }
    };

    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/hod" element={<ProtectedRoute allowedRoles={['hod']}><DashboardLayout /></ProtectedRoute>}>
                    <Route path="dashboard" element={<HodDashboard />} />
                    <Route path="faculty" element={<HodFaculty />} />
                    <Route path="students" element={<HodStudents />} />
                    <Route path="admin" element={<HodAdmin />} />
                </Route>

                <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><DashboardLayout /></ProtectedRoute>}>
                    <Route path="dashboard" element={<FacultyDashboard />} />
                    <Route path="work" element={<FacultyWork />} />
                    <Route path="syllabus" element={<FacultySyllabus />} />
                    <Route path="upload" element={<FacultyUpload />} />
                    <Route path="students" element={<FacultyStudents />} />
                    <Route path="admin" element={<FacultyAdmin />} />
                </Route>

                <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout /></ProtectedRoute>}>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="performance" element={<StudentPerformance />} />
                </Route>

                <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
            </Routes>
        </AnimatePresence>
    );
}

export default App;
