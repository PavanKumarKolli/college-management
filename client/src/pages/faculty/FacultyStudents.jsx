import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiAlertTriangle } from 'react-icons/fi';
import { getFacultyStudents, sendAttendanceWarning } from '../../api/api';

const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function FacultyStudents() {
    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [alertMsg, setAlertMsg] = useState(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getFacultyStudents();
                setPerformances(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // Group by student
    const studentsMap = {};
    performances.forEach(p => {
        const sid = p.studentId?._id;
        if (!sid) return;
        if (!studentsMap[sid]) {
            studentsMap[sid] = { student: p.studentId, performances: [] };
        }
        studentsMap[sid].performances.push(p);
    });
    const students = Object.values(studentsMap);

    const handleSendWarning = async (studentId, subject) => {
        setSending(true);
        try {
            const res = await sendAttendanceWarning({ studentId, subject });
            setAlertMsg({ type: 'success', text: res.data.message, preview: res.data.studentMailPreview });
        } catch (err) {
            setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send warning' });
        } finally { setSending(false); }
    };

    const getAttendanceClass = (att) => att < 60 ? 'attendance-danger' : att < 75 ? 'attendance-warn' : 'attendance-ok';

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading students...</p></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-header">
                <h3>My Students ({students.length})</h3>
            </div>

            {alertMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`upload-result ${alertMsg.type}`} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{alertMsg.text}</span>
                        <button onClick={() => setAlertMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                    </div>
                    {alertMsg.preview && <a href={alertMsg.preview} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--info)', display: 'block', marginTop: 4 }}>📧 Preview sent email</a>}
                </motion.div>
            )}

            <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Roll No</th>
                                <th>Subject</th>
                                <th>Total</th>
                                <th>Attendance</th>
                                <th>Grade</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performances.map((p, i) => (
                                <motion.tr
                                    key={i}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="show"
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => setSelected(studentsMap[p.studentId?._id])}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                                                {p.studentId?.userId?.name?.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{p.studentId?.userId?.name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge orange">{p.studentId?.rollNumber}</span></td>
                                    <td>{p.subject}</td>
                                    <td><strong>{p.marks?.total}</strong></td>
                                    <td>
                                        <span className={getAttendanceClass(p.attendance)} style={{ fontWeight: 600 }}>
                                            {p.attendance}%
                                            {p.attendance < 75 && <span> {p.attendance < 60 ? '🚨' : '⚠️'}</span>}
                                        </span>
                                    </td>
                                    <td><span className={`badge ${p.grade === 'O' || p.grade === 'A+' ? 'success' : p.grade === 'F' ? 'danger' : 'info'}`}>{p.grade}</span></td>
                                    <td>
                                        {p.attendance < 75 && (
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: p.attendance < 60 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: p.attendance < 60 ? 'var(--danger)' : 'var(--warning)' }}
                                                onClick={(e) => { e.stopPropagation(); handleSendWarning(p.studentId?._id, p.subject); }}
                                                disabled={sending}
                                            >
                                                <FiAlertTriangle size={12} /> Send Alert
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Detail Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
                        <motion.div className="modal-content" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>📋 {selected.student?.userId?.name}</h2>
                                <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
                            </div>
                            <div className="modal-body">
                                {/* Student Info */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24, padding: 16, background: 'rgba(243,97,0,0.04)', borderRadius: 12 }}>
                                    <div className="profile-detail-item"><label>Roll Number</label><span>{selected.student?.rollNumber}</span></div>
                                    <div className="profile-detail-item"><label>Semester</label><span>{selected.student?.semester}</span></div>
                                    <div className="profile-detail-item"><label>Section</label><span>{selected.student?.section}</span></div>
                                    <div className="profile-detail-item"><label>Email</label><span>{selected.student?.userId?.email}</span></div>
                                    <div className="profile-detail-item"><label>Phone</label><span>{selected.student?.userId?.phone || 'N/A'}</span></div>
                                    <div className="profile-detail-item"><label>CGPA</label><span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selected.student?.cgpa}</span></div>
                                    <div className="profile-detail-item"><label>Overall Attendance</label>
                                        <span className={getAttendanceClass(selected.student?.attendance)} style={{ fontWeight: 700 }}>
                                            {selected.student?.attendance}%
                                            {selected.student?.attendance < 75 && (selected.student?.attendance < 60 ? ' 🚨 CRITICAL' : ' ⚠️ LOW')}
                                        </span>
                                    </div>
                                </div>

                                {/* Performance Table */}
                                <h3 style={{ marginBottom: 12 }}>Subject-wise Performance</h3>
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Subject</th><th>Sem</th><th>Internal</th><th>Mid</th><th>External</th><th>Total</th><th>Attend.</th><th>Grade</th></tr>
                                    </thead>
                                    <tbody>
                                        {selected.performances.map((p, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 500 }}>{p.subject}</td>
                                                <td>{p.semester}</td>
                                                <td>{p.marks?.internal}</td>
                                                <td>{p.marks?.mid}</td>
                                                <td>{p.marks?.external}</td>
                                                <td><strong>{p.marks?.total}</strong></td>
                                                <td>
                                                    <span className={getAttendanceClass(p.attendance)} style={{ fontWeight: 600 }}>
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
                )}
            </AnimatePresence>
        </motion.div>
    );
}
