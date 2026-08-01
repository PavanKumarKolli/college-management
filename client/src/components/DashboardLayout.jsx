import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiHome, FiUsers, FiBookOpen, FiUpload, FiBarChart2, FiClipboard, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiSettings } from 'react-icons/fi';

const navConfig = {
    hod: [
        { path: '/hod/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/hod/faculty', label: 'Faculty', icon: FiUsers },
        { path: '/hod/students', label: 'Students', icon: FiBookOpen },
        { path: '/hod/admin', label: 'Admin', icon: FiSettings },
    ],
    faculty: [
        { path: '/faculty/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/faculty/work', label: 'Assigned Work', icon: FiClipboard },
        { path: '/faculty/syllabus', label: 'Syllabus', icon: FiBookOpen },
        { path: '/faculty/upload', label: 'Upload Data', icon: FiUpload },
        { path: '/faculty/students', label: 'Students', icon: FiUsers },
        { path: '/faculty/admin', label: 'Admin', icon: FiSettings },
    ],
    student: [
        { path: '/student/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/student/performance', label: 'Performance', icon: FiBarChart2 },
    ],
};

const roleLabels = { hod: 'Head of Department', faculty: 'Faculty', student: 'Student' };

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const nav = navConfig[user?.role] || [];
    const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
    const currentPage = nav.find(n => n.path === location.pathname);
    const pageTitle = currentPage?.label || 'Dashboard';

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="dashboard">
            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">🎓</div>
                    <div>
                        <div className="sidebar-title">CMS</div>
                        <div className="sidebar-subtitle">{roleLabels[user?.role]}</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section-label">Menu</div>
                    {nav.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{initial}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">{user?.role}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut /> Logout
                    </button>
                </div>
            </aside>

            <div className="main-content">
                <div className="topbar">
                    <div className="topbar-left">
                        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <FiX /> : <FiMenu />}
                        </button>
                        <h2>{pageTitle}</h2>
                    </div>
                    <div className="topbar-right">
                        <span className="topbar-date">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                            {theme === 'dark' ? <FiSun size={12} style={{ position: 'absolute', right: 6, color: '#f59e0b' }} /> : <FiMoon size={12} style={{ position: 'absolute', left: 6, color: '#6366f1' }} />}
                        </button>
                    </div>
                </div>

                <motion.div
                    className="page-content"
                    key={location.pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                >
                    <Outlet />
                </motion.div>
            </div>
        </div>
    );
}
