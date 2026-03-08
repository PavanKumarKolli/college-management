import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPercent } from 'react-icons/fi';
import { getHodFaculty, getHodFacultyDetail } from '../../api/api';

const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function HodFaculty() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try { const res = await getHodFaculty(); setFaculty(res.data); }
            catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const handleFacultyClick = async (fac) => {
        setDetailLoading(true);
        try {
            const res = await getHodFacultyDetail(fac._id);
            setSelected(res.data);
        } catch (err) { console.error(err); }
        finally { setDetailLoading(false); }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading faculty...</p></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-header"><h3>Faculty ({faculty.length})</h3></div>

            <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr><th>Faculty</th><th>Designation</th><th>Subjects</th><th>Students</th><th>Avg Marks</th><th>Syllabus</th></tr>
                        </thead>
                        <tbody>
                            {faculty.map((f, i) => (
                                <motion.tr key={f._id} variants={itemVariants} initial="hidden" animate="show" transition={{ delay: i * 0.05 }}
                                    onClick={() => handleFacultyClick(f)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{f.userId?.name?.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{f.userId?.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.userId?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge purple">{f.designation}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            {f.subjects?.slice(0, 3).map((s, j) => <span key={j} className="badge info" style={{ fontSize: 11 }}>{s}</span>)}
                                            {f.subjects?.length > 3 && <span className="badge" style={{ fontSize: 11 }}>+{f.subjects.length - 3}</span>}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{f.stats?.studentsHandled}</td>
                                    <td style={{ fontWeight: 600 }}>{f.stats?.avgMarks}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="progress-bar-container" style={{ width: 80 }}>
                                                <div className={`progress-bar-fill ${f.stats?.syllabusProgress >= 75 ? 'green' : 'orange'}`} style={{ width: `${f.stats?.syllabusProgress}%` }} />
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{f.stats?.syllabusProgress}%</span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Faculty Detail Modal */}
            <AnimatePresence>
                {(selected || detailLoading) && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelected(null); setDetailLoading(false); }}>
                        <motion.div className="modal-content" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
                            {detailLoading ? (
                                <div className="loading-container"><div className="spinner" /></div>
                            ) : selected && (
                                <>
                                    <div className="modal-header">
                                        <h2>👨‍🏫 {selected.faculty?.userId?.name}</h2>
                                        <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
                                    </div>
                                    <div className="modal-body">
                                        {/* Faculty Info */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24, padding: 16, background: 'rgba(243,97,0,0.04)', borderRadius: 12 }}>
                                            <div className="profile-detail-item"><label>Faculty ID</label><span>{selected.faculty?.facultyId}</span></div>
                                            <div className="profile-detail-item"><label>Designation</label><span>{selected.faculty?.designation}</span></div>
                                            <div className="profile-detail-item"><label>Email</label><span>{selected.faculty?.userId?.email}</span></div>
                                            <div className="profile-detail-item"><label>Phone</label><span>{selected.faculty?.userId?.phone || 'N/A'}</span></div>
                                            <div className="profile-detail-item"><label>Experience</label><span>{selected.faculty?.experience} years</span></div>
                                            <div className="profile-detail-item"><label>Qualification</label><span>{selected.faculty?.qualification}</span></div>
                                        </div>

                                        {/* Subjects */}
                                        <h3 style={{ marginBottom: 8 }}>Subjects</h3>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                                            {selected.faculty?.subjects?.map((s, j) => <span key={j} className="badge orange">{s}</span>)}
                                        </div>

                                        {/* Syllabus Coverage */}
                                        <h3 style={{ marginBottom: 12 }}>Syllabus Coverage</h3>
                                        <div style={{ marginBottom: 24 }}>
                                            {selected.faculty?.syllabusCoverage?.map((sc, j) => (
                                                <div key={j} style={{ marginBottom: 12 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                                                        <span>{sc.subject}</span>
                                                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{sc.percentage}%</span>
                                                    </div>
                                                    <div className="progress-bar-container" style={{ height: 8 }}>
                                                        <div className={`progress-bar-fill ${sc.percentage >= 75 ? 'green' : 'orange'}`} style={{ width: `${sc.percentage}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Student Performance */}
                                        <h3 style={{ marginBottom: 12 }}>Student Performance ({selected.performances?.length} records)</h3>
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>Student</th><th>Subject</th><th>Sem</th><th>Total</th><th>Attendance</th><th>Grade</th></tr>
                                            </thead>
                                            <tbody>
                                                {selected.performances?.slice(0, 20).map((p, j) => (
                                                    <tr key={j}>
                                                        <td style={{ fontWeight: 500 }}>{p.studentId?.userId?.name || 'N/A'}</td>
                                                        <td>{p.subject}</td>
                                                        <td>{p.semester}</td>
                                                        <td><strong>{p.marks?.total}</strong></td>
                                                        <td>
                                                            <span className={p.attendance < 60 ? 'attendance-danger' : p.attendance < 75 ? 'attendance-warn' : 'attendance-ok'} style={{ fontWeight: 600 }}>
                                                                {p.attendance}% {p.attendance < 75 && (p.attendance < 60 ? '🚨' : '⚠️')}
                                                            </span>
                                                        </td>
                                                        <td><span className={`badge ${p.grade === 'O' || p.grade === 'A+' ? 'success' : p.grade === 'F' ? 'danger' : 'info'}`}>{p.grade}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
