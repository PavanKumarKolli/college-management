const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Performance = require('../models/Performance');
const User = require('../models/User');
const { generateStudentReport } = require('../utils/reportGenerator');
const router = express.Router();

// GET /api/student/profile
router.get('/profile', protect, requireRole('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id })
            .populate('userId', 'name email department phone profileImage');

        if (!student) return res.status(404).json({ message: 'Student profile not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/student/performance
router.get('/performance', protect, requireRole('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const performances = await Performance.find({ studentId: student._id })
            .populate({
                path: 'facultyId',
                populate: { path: 'userId', select: 'name' }
            });

        const summary = {
            totalSubjects: performances.length,
            avgMarks: performances.length > 0
                ? (performances.reduce((s, p) => s + p.marks.total, 0) / performances.length).toFixed(1)
                : 0,
            avgAttendance: performances.length > 0
                ? (performances.reduce((s, p) => s + p.attendance, 0) / performances.length).toFixed(1)
                : 0,
            grades: performances.map(p => ({ subject: p.subject, grade: p.grade }))
        };

        res.json({ performances, summary });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/student/download-report
router.get('/download-report', protect, requireRole('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id })
            .populate('userId', 'name email department phone');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const performances = await Performance.find({ studentId: student._id })
            .populate({ path: 'facultyId', populate: { path: 'userId', select: 'name' } });

        const pdfBuffer = await generateStudentReport(student, performances);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${student.rollNumber}_report.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
