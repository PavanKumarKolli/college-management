import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiClipboard, FiBookOpen, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFacultyDashboard, sendAttendanceWarning } from '../../api/api';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function FacultyDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(null);
    const [alertResult, setAlertResult] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getFacultyDashboard();
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSendWarning = async (studentId, studentName, subject) => {
        setSending(studentId + subject);
        try {
            const res = await sendAttendanceWarning({ studentId, subject });
            setAlertResult({ type: 'success', text: `Alert sent for ${studentName}`, preview: res.data.studentMailPreview });
        } catch (err) {
            setAlertResult({ type: 'error', text: err.response?.data?.message || 'Failed' });
        } finally { setSending(null); }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading dashboard...</p></div>;
    if (!data) return <div className="empty-state"><h4>Failed to load dashboard</h4></div>;

    const stats = [
        { label: 'Total Students', value: data.stats?.totalStudents || 0, icon: <FiUsers />, color: 'orange' },
        { label: 'Pending Work', value: data.stats?.pendingWork || 0, icon: <FiClipboard />, color: 'purple' },
        { label: 'Completed Work', value: data.stats?.completedWork || 0, icon: <FiTrendingUp />, color: 'green' },
        { label: 'Avg Syllabus', value: `${data.stats?.avgSyllabus || 0}%`, icon: <FiBookOpen />, color: 'cyan' },
    ];

    const chartData = data.performances?.map(p => ({
        name: p.studentId?.userId?.name?.split(' ')[0] || 'N/A',
        total: p.marks?.total || 0,
        attendance: p.attendance || 0
    })) || [];

    // Find students with low attendance (below 60%)
    const criticalStudents = data.performances?.filter(p => p.attendance < 60) || [];
    const warningStudents = data.performances?.filter(p => p.attendance >= 60 && p.attendance < 75) || [];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div className="stats-grid" variants={itemVariants}>
                {stats.map((s, i) => (
                    <motion.div key={i} className={`stat-card ${s.color}`} variants={itemVariants} whileHover={{ y: -4 }}>
                        <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* CRITICAL: Low Attendance Notification Panel */}
            {criticalStudents.length > 0 && (
                <motion.div className="card" variants={itemVariants} style={{ marginBottom: 20, border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div className="card-header" style={{ background: 'rgba(239,68,68,0.08)' }}>
                        <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiAlertTriangle /> 🚨 Critical: Students Below 60% Attendance
                        </h3>
                        <span className="badge danger">{criticalStudents.length} students</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {alertResult && (
                            <div className={`upload-result ${alertResult.type}`} style={{ margin: 12, borderRadius: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{alertResult.text}</span>
                                    <button onClick={() => setAlertResult(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                                </div>
                                {alertResult.preview && <a href={alertResult.preview} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--info)' }}>📧 Preview email</a>}
                            </div>
                        )}
                        <table className="data-table">
                            <thead>
                                <tr><th>Student</th><th>Roll No</th><th>Subject</th><th>Attendance</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {criticalStudents.map((p, i) => (
                                    <tr key={i} style={{ background: 'rgba(239,68,68,0.03)' }}>
                                        <td style={{ fontWeight: 600 }}>{p.studentId?.userId?.name}</td>
                                        <td><span className="badge danger">{p.studentId?.rollNumber}</span></td>
                                        <td>{p.subject} (Sem {p.semester})</td>
                                        <td>
                                            <span className="attendance-danger" style={{ fontWeight: 700, fontSize: 16 }}>
                                                {p.attendance}% 🚨
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}
                                                onClick={() => handleSendWarning(p.studentId?._id, p.studentId?.userId?.name, p.subject)}
                                                disabled={sending === p.studentId?._id + p.subject}
                                            >
                                                {sending === p.studentId?._id + p.subject ? 'Sending...' : '📧 Alert Parent/Student'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Warning: Students between 60-75% */}
            {warningStudents.length > 0 && (
                <motion.div className="card" variants={itemVariants} style={{ marginBottom: 20, border: '1px solid rgba(245,158,11,0.3)' }}>
                    <div className="card-header" style={{ background: 'rgba(245,158,11,0.06)' }}>
                        <h3 style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            ⚠️ Warning: Students Below 75% Attendance
                        </h3>
                        <span className="badge warning">{warningStudents.length} students</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>Student</th><th>Roll No</th><th>Subject</th><th>Attendance</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {warningStudents.map((p, i) => (
                                    <tr key={i} style={{ background: 'rgba(245,158,11,0.02)' }}>
                                        <td style={{ fontWeight: 500 }}>{p.studentId?.userId?.name}</td>
                                        <td><span className="badge warning">{p.studentId?.rollNumber}</span></td>
                                        <td>{p.subject} (Sem {p.semester})</td>
                                        <td>
                                            <span className="attendance-warn" style={{ fontWeight: 600 }}>
                                                {p.attendance}% ⚠️
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--warning)' }}
                                                onClick={() => handleSendWarning(p.studentId?._id, p.studentId?.userId?.name, p.subject)}
                                                disabled={sending === p.studentId?._id + p.subject}
                                            >
                                                {sending === p.studentId?._id + p.subject ? 'Sending...' : '📧 Send Warning'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {chartData.length > 0 && (
                <motion.div className="card" variants={itemVariants} style={{ marginBottom: 20 }}>
                    <div className="card-header"><h3>Student Performance</h3></div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                                <Bar dataKey="total" fill="#f36100" radius={[6, 6, 0, 0]} name="Total Marks" />
                                <Bar dataKey="attendance" fill="#10b981" radius={[6, 6, 0, 0]} name="Attendance %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            <motion.div className="card" variants={itemVariants}>
                <div className="card-header"><h3>Recent Student Records</h3></div>
                <div className="card-body" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr><th>Student</th><th>Subject</th><th>Sem</th><th>Internal</th><th>Mid</th><th>External</th><th>Total</th><th>Attend.</th><th>Grade</th></tr>
                        </thead>
                        <tbody>
                            {data.performances?.slice(0, 15).map((p, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500 }}>{p.studentId?.userId?.name || 'N/A'}</td>
                                    <td>{p.subject}</td>
                                    <td>{p.semester}</td>
                                    <td>{p.marks?.internal}</td>
                                    <td>{p.marks?.mid}</td>
                                    <td>{p.marks?.external}</td>
                                    <td><strong>{p.marks?.total}</strong></td>
                                    <td>
                                        <span className={p.attendance < 60 ? 'attendance-danger' : p.attendance < 75 ? 'attendance-warn' : 'attendance-ok'} style={{ fontWeight: 600 }}>
                                            {p.attendance}% {p.attendance < 60 ? '🚨' : p.attendance < 75 ? '⚠️' : ''}
                                        </span>
                                    </td>
                                    <td><span className={`badge ${p.grade === 'O' || p.grade === 'A+' ? 'success' : p.grade === 'F' ? 'danger' : 'info'}`}>{p.grade}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
