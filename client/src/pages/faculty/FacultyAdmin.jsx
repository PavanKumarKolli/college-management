import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiSave, FiX, FiCheck } from 'react-icons/fi';
import { getFacultyStudents, updateStudentDetails, updatePerformance } from '../../api/api';

const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function FacultyAdmin() {
    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editingPerf, setEditingPerf] = useState(null);
    const [studentForm, setStudentForm] = useState({});
    const [perfForm, setPerfForm] = useState({});
    const [msg, setMsg] = useState(null);
    const [saving, setSaving] = useState(false);

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
            studentsMap[sid] = { student: p.studentId, perfs: [] };
        }
        studentsMap[sid].perfs.push(p);
    });
    const students = Object.values(studentsMap);

    const startEditStudent = (student) => {
        setEditingStudent(student._id);
        setStudentForm({
            attendance: student.attendance,
            semester: student.semester,
            section: student.section,
            cgpa: student.cgpa,
            fatherName: student.fatherName || '',
            address: student.address || '',
            phone: student.userId?.phone || ''
        });
    };

    const saveStudent = async (studentId) => {
        setSaving(true);
        try {
            await updateStudentDetails(studentId, studentForm);
            setMsg({ type: 'success', text: 'Student details updated!' });
            setEditingStudent(null);
            // Refresh
            const res = await getFacultyStudents();
            setPerformances(res.data);
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally { setSaving(false); }
    };

    const startEditPerf = (perf) => {
        setEditingPerf(perf._id);
        setPerfForm({
            internal: perf.marks?.internal || 0,
            mid: perf.marks?.mid || 0,
            external: perf.marks?.external || 0,
            attendance: perf.attendance || 0,
            remarks: perf.remarks || ''
        });
    };

    const savePerf = async (perfId) => {
        setSaving(true);
        try {
            await updatePerformance(perfId, {
                marks: { internal: Number(perfForm.internal), mid: Number(perfForm.mid), external: Number(perfForm.external) },
                attendance: Number(perfForm.attendance),
                remarks: perfForm.remarks
            });
            setMsg({ type: 'success', text: 'Performance record updated!' });
            setEditingPerf(null);
            const res = await getFacultyStudents();
            setPerformances(res.data);
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally { setSaving(false); }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-header">
                <h3>Admin — Manage Student Data</h3>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{students.length} students · {performances.length} records</span>
            </div>

            {msg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`upload-result ${msg.type}`} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{msg.text}</span>
                        <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                    </div>
                </motion.div>
            )}

            {students.map(({ student, perfs }, sIdx) => (
                <motion.div key={student._id} className="card" style={{ marginBottom: 20 }} variants={itemVariants} initial="hidden" animate="show" transition={{ delay: sIdx * 0.05 }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{student.userId?.name?.charAt(0)}</div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{student.userId?.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{student.rollNumber} · {student.userId?.email}</div>
                            </div>
                        </div>
                        {editingStudent === student._id ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-sm btn-primary" onClick={() => saveStudent(student._id)} disabled={saving}>
                                    <FiSave size={12} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button className="btn btn-sm btn-outline" onClick={() => setEditingStudent(null)}><FiX size={12} /></button>
                            </div>
                        ) : (
                            <button className="btn btn-sm btn-outline" onClick={() => startEditStudent(student)}>
                                <FiEdit3 size={12} /> Edit Info
                            </button>
                        )}
                    </div>

                    {/* Student Details Editing */}
                    <AnimatePresence>
                        {editingStudent === student._id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                <div className="card-body" style={{ background: 'rgba(243,97,0,0.03)', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Attendance (%)</label>
                                            <input className="form-input" type="number" min="0" max="100" value={studentForm.attendance} onChange={e => setStudentForm({ ...studentForm, attendance: e.target.value })} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Semester</label>
                                            <input className="form-input" type="number" min="1" max="8" value={studentForm.semester} onChange={e => setStudentForm({ ...studentForm, semester: e.target.value })} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Section</label>
                                            <input className="form-input" value={studentForm.section} onChange={e => setStudentForm({ ...studentForm, section: e.target.value })} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>CGPA</label>
                                            <input className="form-input" type="number" step="0.1" min="0" max="10" value={studentForm.cgpa} onChange={e => setStudentForm({ ...studentForm, cgpa: e.target.value })} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Father's Name</label>
                                            <input className="form-input" value={studentForm.fatherName} onChange={e => setStudentForm({ ...studentForm, fatherName: e.target.value })} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Phone</label>
                                            <input className="form-input" value={studentForm.phone} onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Address</label>
                                            <input className="form-input" value={studentForm.address} onChange={e => setStudentForm({ ...studentForm, address: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Performance Records */}
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>Subject</th><th>Sem</th><th>Internal</th><th>Mid</th><th>External</th><th>Total</th><th>Attend.</th><th>Remarks</th><th></th></tr>
                            </thead>
                            <tbody>
                                {perfs.map((p) => (
                                    <tr key={p._id}>
                                        <td style={{ fontWeight: 500 }}>{p.subject}</td>
                                        <td>{p.semester}</td>
                                        {editingPerf === p._id ? (
                                            <>
                                                <td><input className="form-input" type="number" style={{ width: 60, padding: '4px 6px', fontSize: 13 }} value={perfForm.internal} onChange={e => setPerfForm({ ...perfForm, internal: e.target.value })} /></td>
                                                <td><input className="form-input" type="number" style={{ width: 60, padding: '4px 6px', fontSize: 13 }} value={perfForm.mid} onChange={e => setPerfForm({ ...perfForm, mid: e.target.value })} /></td>
                                                <td><input className="form-input" type="number" style={{ width: 60, padding: '4px 6px', fontSize: 13 }} value={perfForm.external} onChange={e => setPerfForm({ ...perfForm, external: e.target.value })} /></td>
                                                <td>-</td>
                                                <td><input className="form-input" type="number" style={{ width: 60, padding: '4px 6px', fontSize: 13 }} value={perfForm.attendance} onChange={e => setPerfForm({ ...perfForm, attendance: e.target.value })} /></td>
                                                <td><input className="form-input" style={{ width: 100, padding: '4px 6px', fontSize: 13 }} value={perfForm.remarks} onChange={e => setPerfForm({ ...perfForm, remarks: e.target.value })} /></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', padding: '4px 8px' }} onClick={() => savePerf(p._id)} disabled={saving}>
                                                            <FiCheck size={12} />
                                                        </button>
                                                        <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '4px 8px' }} onClick={() => setEditingPerf(null)}>
                                                            <FiX size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{p.marks?.internal}</td>
                                                <td>{p.marks?.mid}</td>
                                                <td>{p.marks?.external}</td>
                                                <td><strong>{p.marks?.total}</strong></td>
                                                <td>
                                                    <span className={p.attendance < 60 ? 'attendance-danger' : p.attendance < 75 ? 'attendance-warn' : 'attendance-ok'} style={{ fontWeight: 600 }}>
                                                        {p.attendance}%
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.remarks || '-'}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline" style={{ padding: '4px 8px' }} onClick={() => startEditPerf(p)}>
                                                        <FiEdit3 size={12} />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            ))}

            {students.length === 0 && <div className="empty-state"><h4>No students found</h4></div>}
        </motion.div>
    );
}
