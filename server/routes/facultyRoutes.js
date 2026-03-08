const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, requireRole } = require('../middleware/authMiddleware');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Performance = require('../models/Performance');
const { parseExcel, parsePDF } = require('../utils/fileParser');
const router = express.Router();

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['.xlsx', '.xls', '.csv', '.pdf'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only Excel and PDF files are allowed'));
    }
});

// GET /api/faculty/dashboard
router.get('/dashboard', protect, requireRole('faculty'), async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ userId: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

        const performances = await Performance.find({ facultyId: faculty._id })
            .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } });

        const pendingWork = faculty.assignedWork.filter(w => w.status !== 'completed').length;
        const completedWork = faculty.assignedWork.filter(w => w.status === 'completed').length;

        res.json({
            faculty,
            performances,
            stats: {
                totalStudents: performances.length,
                pendingWork,
                completedWork,
                totalSubjects: faculty.subjects.length,
                avgSyllabus: faculty.syllabusCoverage.length > 0
                    ? (faculty.syllabusCoverage.reduce((s, c) => s + c.percentage, 0) / faculty.syllabusCoverage.length).toFixed(1)
                    : 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/faculty/assigned-work
router.get('/assigned-work', protect, requireRole('faculty'), async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ userId: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
        res.json(faculty.assignedWork);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/faculty/assigned-work/:workId/status
router.put('/assigned-work/:workId/status', protect, requireRole('faculty'), async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ userId: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const work = faculty.assignedWork.id(req.params.workId);
        if (!work) return res.status(404).json({ message: 'Work item not found' });

        work.status = req.body.status;
        await faculty.save();
        res.json(work);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/faculty/syllabus
router.get('/syllabus', protect, requireRole('faculty'), async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ userId: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
        res.json(faculty.syllabusCoverage);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/faculty/syllabus/:subjectIndex/topic/:topicIndex
router.put('/syllabus/:subjectIndex/topic/:topicIndex', protect, requireRole('faculty'), async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ userId: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const sIdx = parseInt(req.params.subjectIndex);
        const tIdx = parseInt(req.params.topicIndex);

        if (faculty.syllabusCoverage[sIdx] && faculty.syllabusCoverage[sIdx].topics[tIdx]) {
            faculty.syllabusCoverage[sIdx].topics[tIdx].completed = req.body.completed;

            const subject = faculty.syllabusCoverage[sIdx];
            const covered = subject.topics.filter(t => t.completed).length;
            subject.coveredTopics = covered;
            subject.percentage = subject.totalTopics > 0 ? Math.round((covered / subject.totalTopics) * 100) : 0;

            await faculty.save();
            res.json(faculty.syllabusCoverage[sIdx]);
        } else {
            res.status(404).json({ message: 'Topic not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/faculty/upload-bulk
router.post('/upload-bulk', protect, requireRole('faculty'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const faculty = await Faculty.findOne({ userId: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const ext = path.extname(req.file.originalname).toLowerCase();
        let parsedData;

        if (['.xlsx', '.xls', '.csv'].includes(ext)) {
            parsedData = await parseExcel(req.file.path);
        } else if (ext === '.pdf') {
            parsedData = await parsePDF(req.file.path);
        } else {
            return res.status(400).json({ message: 'Unsupported file format' });
        }

        let updated = 0;
        let errors = [];

        for (const row of parsedData) {
            try {
                const student = await Student.findOne({ rollNumber: row.rollNumber });
                if (!student) {
                    errors.push(`Student ${row.rollNumber} not found`);
                    continue;
                }

                const perfData = {
                    studentId: student._id,
                    facultyId: faculty._id,
                    subject: row.subject || req.body.subject || faculty.subjects[0] || 'General',
                    semester: row.semester || student.semester,
                    marks: {
                        internal: Number(row.internal) || 0,
                        mid: Number(row.mid) || 0,
                        external: Number(row.external) || 0
                    },
                    attendance: Number(row.attendance) || 0,
                    remarks: row.remarks || ''
                };

                const existing = await Performance.findOne({
                    studentId: student._id,
                    facultyId: faculty._id,
                    subject: perfData.subject,
                    semester: perfData.semester
                });

                if (existing) {
                    existing.marks = perfData.marks;
                    existing.attendance = perfData.attendance;
                    existing.remarks = perfData.remarks;
                    await existing.save();
                } else {
                    await Performance.create(perfData);
                }
                updated++;
            } catch (err) {
                errors.push(`Error processing row for ${row.rollNumber}: ${err.message}`);
            }
        }

        res.json({
            message: `Bulk upload complete. ${updated} records processed.`,
            updated,
            errors,
            totalRows: parsedData.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/faculty/performance/:id
router.put('/performance/:id', protect, requireRole('faculty'), async (req, res) => {
    try {
        const performance = await Performance.findById(req.params.id);
        if (!performance) return res.status(404).json({ message: 'Performance record not found' });

        const { marks, attendance, remarks } = req.body;
        if (marks) {
            performance.marks.internal = marks.internal ?? performance.marks.internal;
            performance.marks.mid = marks.mid ?? performance.marks.mid;
            performance.marks.external = marks.external ?? performance.marks.external;
        }
        if (attendance !== undefined) performance.attendance = attendance;
        if (remarks !== undefined) performance.remarks = remarks;

        await performance.save();
        res.json(performance);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/faculty/students
router.get('/students', protect, requireRole('faculty'), async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ userId: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        const performances = await Performance.find({ facultyId: faculty._id })
            .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email phone' } });

        res.json(performances);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/faculty/student/:id - Update student details
router.put('/student/:id', protect, requireRole('faculty'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('userId', 'name email phone');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const { attendance, semester, section, cgpa, fatherName, address, phone } = req.body;

        if (attendance !== undefined) student.attendance = attendance;
        if (semester !== undefined) student.semester = semester;
        if (section !== undefined) student.section = section;
        if (cgpa !== undefined) student.cgpa = cgpa;
        if (fatherName !== undefined) student.fatherName = fatherName;
        if (address !== undefined) student.address = address;

        // Update phone on User model
        if (phone !== undefined) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(student.userId._id, { phone });
        }

        await student.save();
        const updated = await Student.findById(req.params.id).populate('userId', 'name email phone');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
