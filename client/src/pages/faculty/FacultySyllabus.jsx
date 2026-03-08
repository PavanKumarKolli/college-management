import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { getSyllabus, updateTopic } from '../../api/api';

const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function FacultySyllabus() {
    const [syllabus, setSyllabus] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getSyllabus();
                setSyllabus(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggle = async (subjectIndex, topicIndex, currentCompleted) => {
        try {
            const res = await updateTopic(subjectIndex, topicIndex, { completed: !currentCompleted });
            setSyllabus(prev => prev.map((s, i) => i === subjectIndex ? res.data : s));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading syllabus...</p></div>;

    const getProgressColor = (pct) => {
        if (pct >= 80) return 'green';
        if (pct >= 50) return 'blue';
        if (pct >= 25) return 'orange';
        return 'purple';
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-header">
                <h3>Syllabus Coverage</h3>
            </div>

            {syllabus.map((subject, sIdx) => (
                <motion.div key={sIdx} className="syllabus-card" variants={itemVariants} initial="hidden" animate="show" transition={{ delay: sIdx * 0.1 }}>
                    <div className="syllabus-header">
                        <h4>{subject.subject}</h4>
                        <div className="syllabus-percentage">{subject.percentage}%</div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <div className="progress-bar-container" style={{ height: 10 }}>
                            <div className={`progress-bar-fill ${getProgressColor(subject.percentage)}`} style={{ width: `${subject.percentage}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#64748b' }}>
                            <span>{subject.coveredTopics} of {subject.totalTopics} topics covered</span>
                            <span>{subject.totalTopics - subject.coveredTopics} remaining</span>
                        </div>
                    </div>

                    <ul className="topic-list">
                        {subject.topics?.map((topic, tIdx) => (
                            <li key={tIdx} className="topic-item">
                                <button className={`topic-checkbox ${topic.completed ? 'checked' : ''}`} onClick={() => handleToggle(sIdx, tIdx, topic.completed)}>
                                    {topic.completed && <FiCheck size={14} />}
                                </button>
                                <span className={`topic-name ${topic.completed ? 'completed' : ''}`}>{topic.name}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            ))}

            {syllabus.length === 0 && (
                <div className="empty-state"><h4>No syllabus data available</h4></div>
            )}
        </motion.div>
    );
}
