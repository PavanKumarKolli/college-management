import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiAlertTriangle } from 'react-icons/fi';
import { getHodStudents, sendAttendanceWarning } from '../../api/api';

const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function HodStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [activeSem, setActiveSem] = useState(null);
    const [alertMsg, setAlertMsg] = useState(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try { const res = await getHodStudents(); setStudents(res.data); }
            catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const handleStudentClick = (s) => {
        setSelected(s);
        const semesters = [...new Set(s.performances?.map(p => p.semester))].sort((a, b) => b - a);
        setActiveSem(semesters[0] || 1);
    };

    const handleSendWarning = async (studentId, subject) => {
        setSending(true);
        try {
            const res = await sendAttendanceWarning({ studentId, subject });
            setAlertMsg({ type: 'success', text: res.data.message });
        } catch (err) { setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
        finally { setSending(false); }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading students...</p></div>;

    const filtered = students.filter(s =>
        s.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(search.toLowerCase())
    );

    const getAttendanceClass = (att) => att < 60 ? 'attendance-danger' : att < 75 ? 'attendance-warn' : 'attendance-ok';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-header">
                <h3>Students ({students.length})</h3>
                <div style={{ position: 'relative', maxWidth: 260 }}>
                    <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" placeholder="Search by name or roll no..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
            </div>

            {alertMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`upload-result ${alertMsg.type}`} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{alertMsg.text}</span>
                        <button onClick={() => setAlertMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                    </div>
                </motion.div>
            )}

            <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr><th>Student</th><th>Roll No</th><th>Sem / Yr</th><th>CGPA</th><th>Attendance</th><th>Subjects</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, i) => (
                                <motion.tr key={s._id} variants={itemVariants} initial="hidden" animate="show" transition={{ delay: i * 0.03 }}
                                    onClick={() => handleStudentClick(s)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{s.userId?.name?.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{s.userId?.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.userId?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge orange">{s.rollNumber}</span></td>
                                    <td>Sem {s.semester} / Year {s.year || Math.ceil(s.semester / 2)}</td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: s.cgpa >= 8 ? 'var(--success)' : s.cgpa >= 6 ? 'var(--primary)' : 'var(--danger)' }}>
                                            {s.cgpa}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={getAttendanceClass(s.attendance)} style={{ fontWeight: 600 }}>
                                            {s.attendance}% {s.attendance < 75 && (s.attendance < 60 ? '🚨' : '⚠️')}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            {s.subjects?.slice(0, 2).map((sub, j) => <span key={j} className="badge info" style={{ fontSize: 11 }}>{sub}</span>)}
                                            {s.subjects?.length > 2 && <span className="badge" style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{s.subjects.length - 2}</span>}
                                        </div>
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
                                <h2>🎓 {selected.userId?.name}</h2>
                                <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
                            </div>
                            <div className="modal-body">
                                {/* Student Info */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24, padding: 16, background: 'rgba(243,97,0,0.04)', borderRadius: 12 }}>
                                    <div className="profile-detail-item"><label>Roll Number</label><span>{selected.rollNumber}</span></div>
                                    <div className="profile-detail-item"><label>Email</label><span>{selected.userId?.email}</span></div>
                                    <div className="profile-detail-item"><label>Phone</label><span>{selected.userId?.phone || 'N/A'}</span></div>
                                    <div className="profile-detail-item"><label>Semester</label><span>{selected.semester} (Year {selected.year || Math.ceil(selected.semester / 2)})</span></div>
                                    <div className="profile-detail-item"><label>Section</label><span>{selected.section}</span></div>
                                    <div className="profile-detail-item"><label>CGPA</label><span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selected.cgpa}</span></div>
                                    <div className="profile-detail-item"><label>Overall Attendance</label>
                                        <span className={getAttendanceClass(selected.attendance)} style={{ fontWeight: 700 }}>
                                            {selected.attendance}% {selected.attendance < 75 && (selected.attendance < 60 ? '🚨 CRITICAL' : '⚠️ LOW')}
                                        </span>
                                    </div>
                                    {selected.fatherName && <div className="profile-detail-item"><label>Father's Name</label><span>{selected.fatherName}</span></div>}
                                    {selected.address && <div className="profile-detail-item"><label>Address</label><span>{selected.address}</span></div>}
                                </div>

                                {/* Attendance Warning Button */}
                                {selected.attendance < 75 && (
                                    <div style={{ marginBottom: 20 }}>
                                        <button
                                            className="btn"
                                            style={{ background: selected.attendance < 60 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: selected.attendance < 60 ? 'var(--danger)' : 'var(--warning)', width: '100%', justifyContent: 'center' }}
                                            onClick={() => handleSendWarning(selected._id)}
                                            disabled={sending}
                                        >
                                            <FiAlertTriangle /> {sending ? 'Sending...' : `Send ${selected.attendance < 60 ? 'CRITICAL' : 'WARNING'} Alert to Student & Parent`}
                                        </button>
                                    </div>
                                )}

                                {/* Semester Tabs for Modal */}
                                {selected.performances?.length > 0 && (() => {
                                    const semesters = [...new Set(selected.performances.map(p => p.semester))].sort((a, b) => a - b);
                                    const semPerfs = selected.performances.filter(p => p.semester === activeSem);
                                    return (
                                        <>
                                            <h3 style={{ marginBottom: 12 }}>Semester Results</h3>
                                            <div className="semester-tabs" style={{ marginBottom: 16 }}>
                                                {semesters.map(sem => (
                                                    <button key={sem} className={`semester-tab ${activeSem === sem ? 'active' : ''}`} onClick={() => setActiveSem(sem)}>
                                                        Sem {sem}
                                                    </button>
                                                ))}
                                            </div>
                                            <table className="data-table">
                                                <thead>
                                                    <tr><th>Subject</th><th>Internal</th><th>Mid</th><th>External</th><th>Total</th><th>Attend.</th><th>Grade</th></tr>
                                                </thead>
                                                <tbody>
                                                    {semPerfs.map((p, j) => (
                                                        <tr key={j}>
                                                            <td style={{ fontWeight: 500 }}>{p.subject}</td>
                                                            <td>{p.marks?.internal}</td>
                                                            <td>{p.marks?.mid}</td>
                                                            <td>{p.marks?.external}</td>
                                                            <td><strong>{p.marks?.total}</strong></td>
                                                            <td>
                                                                <span className={getAttendanceClass(p.attendance)} style={{ fontWeight: 600 }}>
                                                                    {p.attendance}% {p.attendance < 75 && (p.attendance < 60 ? '🚨' : '⚠️')}
                                                                </span>
                                                            </td>
                                                            <td><span className={`badge ${p.grade === 'O' || p.grade === 'A+' ? 'success' : p.grade === 'F' ? 'danger' : 'info'}`}>{p.grade}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
