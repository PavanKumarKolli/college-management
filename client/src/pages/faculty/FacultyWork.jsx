import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock } from 'react-icons/fi';
import { getAssignedWork, updateWorkStatus } from '../../api/api';

const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function FacultyWork() {
    const [work, setWork] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAssignedWork();
                setWork(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStatusChange = async (workId, newStatus) => {
        try {
            await updateWorkStatus(workId, { status: newStatus });
            setWork(prev => prev.map(w => w._id === workId ? { ...w, status: newStatus } : w));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading work...</p></div>;

    const filtered = filter === 'all' ? work : work.filter(w => w.status === filter);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

    const isOverdue = (deadline) => deadline && new Date(deadline) < new Date();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-header">
                <h3>Assigned Work ({work.length})</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['all', 'pending', 'in-progress', 'completed'].map(f => (
                        <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="work-grid">
                {filtered.map((w, i) => (
                    <motion.div key={w._id} className="work-card" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}>
                        <div className="work-card-header">
                            <h4>{w.title}</h4>
                            <span className="priority-dot" style={{ background: w.priority === 'high' ? '#ef4444' : w.priority === 'medium' ? '#f59e0b' : '#10b981' }} title={w.priority} />
                        </div>
                        <p>{w.description || 'No description provided'}</p>
                        <div className="work-card-meta">
                            <span className="work-meta-item">
                                <FiCalendar size={12} />
                                Due: {formatDate(w.deadline)}
                                {isOverdue(w.deadline) && w.status !== 'completed' && <span style={{ color: '#ef4444', marginLeft: 4 }}>(Overdue)</span>}
                            </span>
                            <span className="work-meta-item">
                                <FiClock size={12} />
                                {formatDate(w.assignedDate)}
                            </span>
                        </div>
                        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className={`badge ${w.priority === 'high' ? 'danger' : w.priority === 'medium' ? 'warning' : 'success'}`}>
                                {w.priority}
                            </span>
                            <select className="status-select" value={w.status} onChange={e => handleStatusChange(w._id, e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <h4>No {filter !== 'all' ? filter : ''} work items found</h4>
                </div>
            )}
        </motion.div>
    );
}
