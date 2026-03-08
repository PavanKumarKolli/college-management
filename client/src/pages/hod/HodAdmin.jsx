import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiCalendar, FiClock } from 'react-icons/fi';
import { getHodFacultyList, assignWorkToFaculty, getAllAssignedWork, deleteAssignedWork } from '../../api/api';

const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function HodAdmin() {
    const [facultyList, setFacultyList] = useState([]);
    const [allWork, setAllWork] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState(null);

    const [form, setForm] = useState({
        facultyId: '', title: '', description: '', deadline: '', priority: 'medium'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [facRes, workRes] = await Promise.all([getHodFacultyList(), getAllAssignedWork()]);
                setFacultyList(facRes.data);
                setAllWork(workRes.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.facultyId || !form.title) return;
        setSubmitting(true);
        try {
            await assignWorkToFaculty(form);
            setMsg({ type: 'success', text: `Task "${form.title}" assigned successfully!` });
            setForm({ facultyId: '', title: '', description: '', deadline: '', priority: 'medium' });
            setShowForm(false);
            // Refresh work list
            const res = await getAllAssignedWork();
            setAllWork(res.data);
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to assign work' });
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (facultyDbId, workId) => {
        if (!window.confirm('Remove this task?')) return;
        try {
            await deleteAssignedWork(facultyDbId, workId);
            setAllWork(prev => prev.filter(w => w._id !== workId));
            setMsg({ type: 'success', text: 'Task removed' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to remove task' });
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-header">
                <h3>Admin — Assign Work to Faculty</h3>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <FiPlus /> {showForm ? 'Cancel' : 'Assign New Task'}
                </button>
            </div>

            {msg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`upload-result ${msg.type}`} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{msg.text}</span>
                        <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                    </div>
                </motion.div>
            )}

            {/* Assign Work Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 24, overflow: 'hidden' }}>
                        <div className="card-header"><h3>📋 New Task Assignment</h3></div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                                    <div className="form-group">
                                        <label>Select Faculty *</label>
                                        <select className="form-input" value={form.facultyId} onChange={e => setForm({ ...form, facultyId: e.target.value })} required>
                                            <option value="">Choose faculty...</option>
                                            {facultyList.map(f => (
                                                <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Task Title *</label>
                                        <input className="form-input" placeholder="e.g., Submit Lab Manual" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Deadline</label>
                                        <input className="form-input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea className="form-input" rows={3} placeholder="Task details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: 8 }}>
                                    {submitting ? 'Assigning...' : '✅ Assign Task'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* All Assigned Work */}
            <div className="card">
                <div className="card-header">
                    <h3>All Assigned Tasks ({allWork.length})</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr><th>Faculty</th><th>Task</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Assigned</th><th></th></tr>
                        </thead>
                        <tbody>
                            {allWork.map((w, i) => (
                                <motion.tr key={w._id} variants={itemVariants} initial="hidden" animate="show" transition={{ delay: i * 0.03 }}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{w.facultyName}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{w.facultyEmail}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{w.title}</div>
                                        {w.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{w.description.substring(0, 60)}{w.description.length > 60 ? '...' : ''}</div>}
                                    </td>
                                    <td>
                                        <span className={`badge ${w.priority === 'high' ? 'danger' : w.priority === 'medium' ? 'warning' : 'success'}`}>
                                            {w.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                                            <FiCalendar size={12} /> {formatDate(w.deadline)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${w.status === 'completed' ? 'success' : w.status === 'in-progress' ? 'orange' : 'info'}`}>
                                            {w.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        <FiClock size={11} /> {formatDate(w.assignedDate)}
                                    </td>
                                    <td>
                                        <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}
                                            onClick={() => handleDelete(w.facultyDbId, w._id)} title="Remove task">
                                            <FiTrash2 size={14} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {allWork.length === 0 && <div className="empty-state"><h4>No tasks assigned yet</h4></div>}
                </div>
            </div>
        </motion.div>
    );
}
