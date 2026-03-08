const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Performance = require('../models/Performance');
const User = require('../models/User');
const { sendAttendanceWarning } = require('../utils/alertService');
const router = express.Router();

// POST /api/alerts/attendance-warning
router.post('/attendance-warning', protect, requireRole('faculty', 'hod'), async (req, res) => {
    try {
        const { studentId, subject } = req.body;

        const student = await Student.findById(studentId).populate('userId', 'name email phone');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Get attendance from performance records or overall
        let attendance = student.attendance;
        if (subject) {
            const perf = await Performance.findOne({ studentId: student._id, subject });
            if (perf) attendance = perf.attendance;
        }

        if (attendance >= 75) {
            return res.json({ message: 'Attendance is above 75%, no warning needed', attendance });
        }

        const result = await sendAttendanceWarning(
            student.userId.email,
            student.userId.name,
            null, // In real app, would have parent email
            student.userId.phone,
            attendance,
            subject
        );

        res.json({
            message: `Warning sent for ${student.userId.name} (${attendance}% attendance)`,
            warningLevel: attendance < 60 ? 'CRITICAL' : 'WARNING',
            ...result
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/alerts/check-all - Check all students and send warnings
router.post('/check-all', protect, requireRole('faculty', 'hod'), async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'name email phone');
        const warnings = [];

        for (const student of students) {
            const performances = await Performance.find({ studentId: student._id });

            for (const perf of performances) {
                if (perf.attendance < 75) {
                    const result = await sendAttendanceWarning(
                        student.userId.email,
                        student.userId.name,
                        null,
                        student.userId.phone,
                        perf.attendance,
                        perf.subject
                    );
                    warnings.push({
                        student: student.userId.name,
                        rollNumber: student.rollNumber,
                        subject: perf.subject,
                        attendance: perf.attendance,
                        level: perf.attendance < 60 ? 'CRITICAL' : 'WARNING',
                        ...result
                    });
                }
            }
        }

        res.json({
            message: `Checked all students. ${warnings.length} warnings sent.`,
            warnings
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
