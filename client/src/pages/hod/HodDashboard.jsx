import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBookOpen, FiTrendingUp, FiPercent } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getHodDashboard } from '../../api/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const CHART_COLORS = ['#f36100', '#7c3aed', '#10b981', '#06b6d4', '#ef4444', '#f59e0b'];

export default function HodDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try { const res = await getHodDashboard(); setData(res.data); }
            catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading dashboard...</p></div>;
    if (!data) return <div className="empty-state"><h4>Failed to load</h4></div>;

    const stats = [
        { label: 'Total Faculty', value: data.totalFaculty, icon: <FiUsers />, color: 'orange' },
        { label: 'Total Students', value: data.totalStudents, icon: <FiBookOpen />, color: 'cyan' },
        { label: 'Avg Marks', value: data.avgMarks, icon: <FiTrendingUp />, color: 'green' },
        { label: 'Avg Attendance', value: `${data.avgAttendance}%`, icon: <FiPercent />, color: data.avgAttendance < 75 ? 'orange' : 'purple' },
    ];

    const gradeData = Object.entries(data.gradeDistribution || {})
        .map(([grade, count]) => ({ name: grade, value: count }))
        .sort((a, b) => ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'].indexOf(a.name) - ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'].indexOf(b.name));

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

            <div className="charts-grid">
                <motion.div className="card" variants={itemVariants}>
                    <div className="card-header"><h3>Grade Distribution</h3></div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={gradeData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                    {gradeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div className="card" variants={itemVariants}>
                    <div className="card-header"><h3>Performance Overview</h3></div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={gradeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                                <Bar dataKey="value" fill="#f36100" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
