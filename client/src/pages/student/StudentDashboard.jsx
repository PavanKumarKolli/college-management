import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiBook, FiHash, FiTrendingUp, FiPercent } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudentProfile, getStudentPerformance, downloadReport } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function StudentDashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profRes, perfRes] = await Promise.all([getStudentProfile(), getStudentPerformance()]);
                setProfile(profRes.data);
                setPerformance(perfRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await downloadReport();
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${profile?.rollNumber || 'student'}_report.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading profile...</p></div>;

    const chartData = performance?.performances?.map(p => ({
        subject: p.subject?.length > 12 ? p.subject.substring(0, 12) + '...' : p.subject,
        total: p.marks?.total || 0,
        attendance: p.attendance || 0
    })) || [];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            {/* Profile Card */}
            <motion.div className="profile-card" variants={itemVariants} style={{ marginBottom: 24 }}>
                <div className="profile-banner" />
                <div className="profile-avatar">{user?.name?.charAt(0)}</div>
                <div className="profile-info">
                    <h2>{user?.name}</h2>
                    <span className="role-tag">Student — {profile?.userId?.department || 'Computer Science'}</span>

                    <div className="profile-details">
                        <div className="profile-detail-item">
                            <label><FiHash size={12} /> Roll Number</label>
                            <span>{profile?.rollNumber}</span>
                        </div>
                        <div className="profile-detail-item">
                            <label><FiMail size={12} /> Email</label>
                            <span>{profile?.userId?.email}</span>
                        </div>
                        <div className="profile-detail-item">
                            <label><FiBook size={12} /> Semester</label>
                            <span>{profile?.semester} — Section {profile?.section}</span>
                        </div>
                        <div className="profile-detail-item">
                            <label><FiTrendingUp size={12} /> CGPA</label>
                            <span style={{ color: '#10b981', fontWeight: 700, fontSize: 16 }}>{profile?.cgpa}</span>
                        </div>
                        <div className="profile-detail-item">
                            <label><FiPercent size={12} /> Attendance</label>
                            <span>{profile?.attendance}%</span>
                        </div>
                        <div className="profile-detail-item">
                            <label><FiPhone size={12} /> Phone</label>
                            <span>{profile?.userId?.phone || 'N/A'}</span>
                        </div>
                        {profile?.fatherName && (
                            <div className="profile-detail-item">
                                <label>Father's Name</label>
                                <span>{profile.fatherName}</span>
                            </div>
                        )}
                        {profile?.address && (
                            <div className="profile-detail-item">
                                <label><FiMapPin size={12} /> Address</label>
                                <span>{profile.address}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div className="stats-grid" variants={itemVariants}>
                <motion.div className="stat-card purple" variants={itemVariants}>
                    <div className="stat-icon purple"><FiBook /></div>
                    <div className="stat-value">{performance?.summary?.totalSubjects || 0}</div>
                    <div className="stat-label">Subjects</div>
                </motion.div>
                <motion.div className="stat-card green" variants={itemVariants}>
                    <div className="stat-icon green"><FiTrendingUp /></div>
                    <div className="stat-value">{performance?.summary?.avgMarks || 0}</div>
                    <div className="stat-label">Avg Marks</div>
                </motion.div>
                <motion.div className="stat-card blue" variants={itemVariants}>
                    <div className="stat-icon blue"><FiPercent /></div>
                    <div className="stat-value">{performance?.summary?.avgAttendance || 0}%</div>
                    <div className="stat-label">Avg Attendance</div>
                </motion.div>
            </motion.div>

            {/* Chart */}
            {chartData.length > 0 && (
                <motion.div className="card" variants={itemVariants} style={{ marginBottom: 24 }}>
                    <div className="card-header">
                        <h3>Subject-wise Performance</h3>
                        <button className="btn btn-success" onClick={handleDownload} disabled={downloading}>
                            {downloading ? 'Generating...' : '📄 Download Report'}
                        </button>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9' }} />
                                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} name="Total Marks" />
                                <Bar dataKey="attendance" fill="#10b981" radius={[6, 6, 0, 0]} name="Attendance %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
