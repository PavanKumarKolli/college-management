const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Performance = require('../models/Performance');
const User = require('../models/User');
const router = express.Router();

// GET /api/hod/dashboard - Overview stats
router.get('/dashboard', protect, requireRole('hod'), async (req, res) => {
    try {
        const totalFaculty = await Faculty.countDocuments();
        const totalStudents = await Student.countDocuments();
        const performances = await Performance.find();

        const avgAttendance = performances.length > 0
            ? (performances.reduce((sum, p) => sum + p.attendance, 0) / performances.length).toFixed(1)
            : 0;

        const avgMarks = performances.length > 0
            ? (performances.reduce((sum, p) => sum + p.marks.total, 0) / performances.length).toFixed(1)
            : 0;

        const gradeDistribution = {};
        performances.forEach(p => {
            gradeDistribution[p.grade] = (gradeDistribution[p.grade] || 0) + 1;
        });

        res.json({
            totalFaculty,
            totalStudents,
            totalPerformances: performances.length,
            avgAttendance: Number(avgAttendance),
            avgMarks: Number(avgMarks),
            gradeDistribution
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/hod/faculty - All faculty with details
router.get('/faculty', protect, requireRole('hod'), async (req, res) => {
    try {
        const faculty = await Faculty.find().populate('userId', 'name email department phone profileImage');

        const facultyWithStats = await Promise.all(faculty.map(async (f) => {
            const performances = await Performance.find({ facultyId: f._id });
            const avgMarks = performances.length > 0
                ? (performances.reduce((sum, p) => sum + p.marks.total, 0) / performances.length).toFixed(1)
                : 0;
            const totalSyllabus = f.syllabusCoverage.length > 0
                ? (f.syllabusCoverage.reduce((sum, s) => sum + s.percentage, 0) / f.syllabusCoverage.length).toFixed(1)
                : 0;

            return {
                ...f.toObject(),
                stats: {
                    studentsHandled: performances.length,
                    avgMarks: Number(avgMarks),
                    syllabusProgress: Number(totalSyllabus)
                }
            };
        }));

        res.json(facultyWithStats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/hod/students - All students with performance
router.get('/students', protect, requireRole('hod'), async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'name email department phone profileImage');

        const studentsWithPerformance = await Promise.all(students.map(async (s) => {
            const performances = await Performance.find({ studentId: s._id })
                .populate('facultyId', 'userId');

            return {
                ...s.toObject(),
                performances
            };
        }));

        res.json(studentsWithPerformance);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/hod/faculty/:id - Individual faculty detail
router.get('/faculty/:id', protect, requireRole('hod'), async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id)
            .populate('userId', 'name email department phone profileImage');

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        const performances = await Performance.find({ facultyId: faculty._id })
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name email' }
            });

        res.json({ faculty, performances });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/hod/assign-work - Assign work to a faculty member
router.post('/assign-work', protect, requireRole('hod'), async (req, res) => {
    try {
        const { facultyId, title, description, deadline, priority } = req.body;
        if (!facultyId || !title) return res.status(400).json({ message: 'Faculty and title are required' });

        const faculty = await Faculty.findById(facultyId);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        faculty.assignedWork.push({
            title,
            description: description || '',
            deadline: deadline ? new Date(deadline) : null,
            priority: priority || 'medium',
            status: 'pending',
            assignedDate: new Date()
        });

        await faculty.save();
        const newWork = faculty.assignedWork[faculty.assignedWork.length - 1];

        res.status(201).json({ message: `Work "${title}" assigned to ${faculty.userId}`, work: newWork });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/hod/assigned-work/:facultyId/:workId - Remove assigned work
router.delete('/assigned-work/:facultyId/:workId', protect, requireRole('hod'), async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.facultyId);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const work = faculty.assignedWork.id(req.params.workId);
        if (!work) return res.status(404).json({ message: 'Work not found' });

        work.deleteOne();
        await faculty.save();
        res.json({ message: 'Work removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/hod/faculty-list - Simple list for dropdowns
router.get('/faculty-list', protect, requireRole('hod'), async (req, res) => {
    try {
        const faculty = await Faculty.find().populate('userId', 'name email');
        res.json(faculty.map(f => ({ _id: f._id, name: f.userId?.name, email: f.userId?.email, facultyId: f.facultyId })));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/hod/all-assigned-work - Get all work across all faculty
router.get('/all-assigned-work', protect, requireRole('hod'), async (req, res) => {
    try {
        const faculties = await Faculty.find().populate('userId', 'name email');
        const allWork = [];
        faculties.forEach(f => {
            f.assignedWork.forEach(w => {
                allWork.push({
                    ...w.toObject(),
                    facultyName: f.userId?.name,
                    facultyEmail: f.userId?.email,
                    facultyDbId: f._id
                });
            });
        });
        allWork.sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate));
        res.json(allWork);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
