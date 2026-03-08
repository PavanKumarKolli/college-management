import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStudentPerformance, downloadReport } from '../../api/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function StudentPerformance() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSem, setActiveSem] = useState(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getStudentPerformance();
                setData(res.data);
                // Find the latest semester
                const semesters = [...new Set(res.data.performances?.map(p => p.semester))].sort((a, b) => b - a);
                if (semesters.length > 0) setActiveSem(semesters[0]);
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
            a.download = `performance_report.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) { console.error(err); }
        finally { setDownloading(false); }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading performance...</p></div>;
    if (!data) return <div className="empty-state"><h4>Failed to load</h4></div>;

    const allSemesters = [...new Set(data.performances?.map(p => p.semester))].sort((a, b) => a - b);
    const semPerformances = data.performances?.filter(p => p.semester === activeSem) || [];

    const getGradeStyle = (grade) => {
        const styles = {
            'O': { background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white' },
            'A+': { background: 'linear-gradient(135deg, #f36100, #ff8533)', color: 'white' },
            'A': { background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white' },
            'B+': { background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', color: 'white' },
            'B': { background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#1a1a2e' },
        };
        return styles[grade] || { background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white' };
    };

    const getAttendanceClass = (att) => {
        if (att < 60) return 'attendance-danger';
        if (att < 75) return 'attendance-warn';
        return 'attendance-ok';
    };

    // Semester summary
    const semSummary = semPerformances.length > 0 ? {
        avg: (semPerformances.reduce((s, p) => s + p.marks?.total, 0) / semPerformances.length).toFixed(1),
        avgAtt: (semPerformances.reduce((s, p) => s + p.attendance, 0) / semPerformances.length).toFixed(1),
        total: semPerformances.length
    } : null;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <div className="section-header">
                <h3>Semester-wise Performance</h3>
                <button className="btn btn-success" onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'Generating...' : '📄 Download Report'}
                </button>
            </div>

            {/* Semester Tabs - 4 years = 8 semesters */}
            <div className="semester-tabs">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                    const hasSem = allSemesters.includes(sem);
                    return (
                        <button
                            key={sem}
                            className={`semester-tab ${activeSem === sem ? 'active' : ''}`}
                            onClick={() => hasSem && setActiveSem(sem)}
                            style={{ opacity: hasSem ? 1 : 0.3, cursor: hasSem ? 'pointer' : 'default' }}
                        >
                            Sem {sem}
                            {hasSem && <span style={{ display: 'block', fontSize: 10, opacity: 0.7 }}>Year {Math.ceil(sem / 2)}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Semester Summary */}
            {semSummary && (
                <motion.div className="stats-grid" variants={itemVariants} style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                    <div className="stat-card orange">
                        <div className="stat-icon orange">📚</div>
                        <div className="stat-value">{semSummary.total}</div>
                        <div className="stat-label">Subjects</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-icon green">📊</div>
                        <div className="stat-value">{semSummary.avg}</div>
                        <div className="stat-label">Avg Marks (170)</div>
                    </div>
                    <div className={`stat-card ${Number(semSummary.avgAtt) < 75 ? 'orange' : 'green'}`}>
                        <div className={`stat-icon ${Number(semSummary.avgAtt) < 75 ? 'orange' : 'green'}`}>📋</div>
                        <div className="stat-value" style={{ color: Number(semSummary.avgAtt) < 60 ? 'var(--danger)' : Number(semSummary.avgAtt) < 75 ? 'var(--warning)' : 'var(--success)' }}>
                            {semSummary.avgAtt}%
                        </div>
                        <div className="stat-label">
                            Avg Attendance
                            {Number(semSummary.avgAtt) < 75 && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>⚠️</span>}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Subject Cards */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSem}
                    className="perf-grid"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {semPerformances.map((p, i) => (
                        <motion.div key={i} className="perf-card" variants={itemVariants} whileHover={{ y: -3 }}>
                            <div className="perf-card-header">
                                <h4>{p.subject}</h4>
                                <div style={{ ...getGradeStyle(p.grade), padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: 14 }}>
                                    {p.grade}
                                </div>
                            </div>

                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                                Faculty: {p.facultyId?.userId?.name || 'N/A'} | Sem {p.semester}
                            </div>

                            <div className="perf-marks">
                                <div className="perf-mark-item">
                                    <div className="value">{p.marks?.internal}</div>
                                    <div className="label">Internal (40)</div>
                                </div>
                                <div className="perf-mark-item">
                                    <div className="value">{p.marks?.mid}</div>
                                    <div className="label">Mid (30)</div>
                                </div>
                                <div className="perf-mark-item">
                                    <div className="value">{p.marks?.external}</div>
                                    <div className="label">External (100)</div>
                                </div>
                            </div>

                            <div className="perf-total">
                                <div>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total</span>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-light)' }}>
                                        {p.marks?.total}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/170</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Attendance</span>
                                    <div className={getAttendanceClass(p.attendance)} style={{ fontSize: 22, fontWeight: 800 }}>
                                        {p.attendance}%
                                        {p.attendance < 75 && <span style={{ fontSize: 12, display: 'block' }}>
                                            {p.attendance < 60 ? '🚨 CRITICAL' : '⚠️ LOW'}
                                        </span>}
                                    </div>
                                </div>
                            </div>

                            {p.remarks && (
                                <div style={{ marginTop: 12, padding: '8px 12px', background: p.attendance < 60 ? 'rgba(239,68,68,0.08)' : 'rgba(243,97,0,0.05)', borderRadius: 8, fontSize: 13, color: p.attendance < 60 ? 'var(--danger)' : 'var(--text-secondary)', border: p.attendance < 60 ? '1px solid rgba(239,68,68,0.2)' : 'none' }}>
                                    {p.attendance < 60 ? '🚨' : '💬'} {p.remarks}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {semPerformances.length === 0 && (
                <div className="empty-state"><h4>No records for Semester {activeSem}</h4><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Results will appear when published by faculty</p></div>
            )}
        </motion.div>
    );
}
