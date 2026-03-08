const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Performance = require('./models/Performance');

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        await User.deleteMany({});
        await Student.deleteMany({});
        await Faculty.deleteMany({});
        await Performance.deleteMany({});
        console.log('Cleared existing data');

        // HOD
        await User.create({ name: 'Dr. Rajesh Kumar', email: 'hod@college.com', password: 'password123', role: 'hod', department: 'Computer Science', phone: '9876543210' });
        console.log('HOD created');

        // Faculty
        const facultyUsers = await User.create([
            { name: 'Prof. Anitha Sharma', email: 'faculty1@college.com', password: 'password123', role: 'faculty', department: 'Computer Science', phone: '9876543211' },
            { name: 'Prof. Vikram Reddy', email: 'faculty2@college.com', password: 'password123', role: 'faculty', department: 'Computer Science', phone: '9876543212' },
            { name: 'Prof. Lakshmi Devi', email: 'faculty3@college.com', password: 'password123', role: 'faculty', department: 'Computer Science', phone: '9876543213' }
        ]);

        const faculties = await Faculty.create([
            {
                userId: facultyUsers[0]._id, facultyId: 'FAC001', department: 'Computer Science', designation: 'Associate Professor',
                subjects: ['Data Structures', 'Algorithms', 'C Programming', 'Python Programming'],
                experience: 8, qualification: 'M.Tech, Ph.D',
                assignedWork: [
                    { title: 'Prepare Mid Exam Question Paper', description: 'Prepare for DS mid exam', deadline: new Date('2026-03-20'), status: 'in-progress', priority: 'high' },
                    { title: 'Submit Lab Manual', description: 'Complete DS lab manual', deadline: new Date('2026-03-25'), status: 'pending', priority: 'medium' },
                    { title: 'Student Mentoring Report', description: 'Submit mentoring report', deadline: new Date('2026-04-01'), status: 'pending', priority: 'low' }
                ],
                syllabusCoverage: [
                    { subject: 'Data Structures', totalTopics: 6, coveredTopics: 4, percentage: 67, topics: [{ name: 'Arrays & Linked Lists', completed: true }, { name: 'Stacks & Queues', completed: true }, { name: 'Trees', completed: true }, { name: 'Graphs', completed: true }, { name: 'Hashing', completed: false }, { name: 'Sorting', completed: false }] },
                    { subject: 'Algorithms', totalTopics: 5, coveredTopics: 2, percentage: 40, topics: [{ name: 'Divide & Conquer', completed: true }, { name: 'Greedy', completed: true }, { name: 'Dynamic Programming', completed: false }, { name: 'Backtracking', completed: false }, { name: 'NP-Completeness', completed: false }] }
                ]
            },
            {
                userId: facultyUsers[1]._id, facultyId: 'FAC002', department: 'Computer Science', designation: 'Assistant Professor',
                subjects: ['Database Systems', 'Web Technologies', 'Software Engineering', 'Computer Graphics'],
                experience: 5, qualification: 'M.Tech',
                assignedWork: [
                    { title: 'Lab Setup for Web Tech', description: 'Setup lab environment', deadline: new Date('2026-03-18'), status: 'completed', priority: 'high' },
                    { title: 'Industry Visit Coordination', description: 'Coordinate industry visit', deadline: new Date('2026-04-10'), status: 'pending', priority: 'medium' }
                ],
                syllabusCoverage: [
                    { subject: 'Database Systems', totalTopics: 5, coveredTopics: 3, percentage: 60, topics: [{ name: 'ER Model', completed: true }, { name: 'SQL & Normalization', completed: true }, { name: 'Transactions', completed: true }, { name: 'Indexing', completed: false }, { name: 'NoSQL', completed: false }] },
                    { subject: 'Web Technologies', totalTopics: 6, coveredTopics: 4, percentage: 67, topics: [{ name: 'HTML & CSS', completed: true }, { name: 'JavaScript', completed: true }, { name: 'React.js', completed: true }, { name: 'Node.js', completed: true }, { name: 'REST APIs', completed: false }, { name: 'Deployment', completed: false }] }
                ]
            },
            {
                userId: facultyUsers[2]._id, facultyId: 'FAC003', department: 'Computer Science', designation: 'Professor',
                subjects: ['Operating Systems', 'Computer Networks', 'Digital Logic', 'Computer Architecture'],
                experience: 12, qualification: 'M.Tech, Ph.D',
                assignedWork: [
                    { title: 'Research Paper Review', description: 'Review 3 papers for conference', deadline: new Date('2026-03-30'), status: 'in-progress', priority: 'high' },
                    { title: 'Curriculum Update Proposal', description: 'Draft proposal for OS curriculum', deadline: new Date('2026-04-15'), status: 'pending', priority: 'medium' }
                ],
                syllabusCoverage: [
                    { subject: 'Operating Systems', totalTopics: 5, coveredTopics: 5, percentage: 100, topics: [{ name: 'Process Mgmt', completed: true }, { name: 'Memory Mgmt', completed: true }, { name: 'File Systems', completed: true }, { name: 'I/O Mgmt', completed: true }, { name: 'Security', completed: true }] },
                    { subject: 'Computer Networks', totalTopics: 5, coveredTopics: 3, percentage: 60, topics: [{ name: 'OSI/TCP', completed: true }, { name: 'Data Link', completed: true }, { name: 'Network Layer', completed: true }, { name: 'Transport Layer', completed: false }, { name: 'Application Layer', completed: false }] }
                ]
            }
        ]);

        // Students
        const studentUsers = await User.create([
            { name: 'Arjun Patel', email: 'student1@college.com', password: 'password123', role: 'student', department: 'Computer Science', phone: '9998887771' },
            { name: 'Priya Reddy', email: 'student2@college.com', password: 'password123', role: 'student', department: 'Computer Science', phone: '9998887772' },
            { name: 'Rahul Verma', email: 'student3@college.com', password: 'password123', role: 'student', department: 'Computer Science', phone: '9998887773' },
            { name: 'Sneha Gupta', email: 'student4@college.com', password: 'password123', role: 'student', department: 'Computer Science', phone: '9998887774' },
            { name: 'Karthik Nair', email: 'student5@college.com', password: 'password123', role: 'student', department: 'Computer Science', phone: '9998887775' },
            { name: 'Divya Sharma', email: 'student6@college.com', password: 'password123', role: 'student', department: 'Computer Science', phone: '9998887776' },
            { name: 'Arun Kumar', email: 'student7@college.com', password: 'password123', role: 'student', department: 'Computer Science', phone: '9998887777' },
            { name: 'Meera Joshi', email: 'student8@college.com', password: 'password123', role: 'student', department: 'Computer Science', phone: '9998887778' }
        ]);

        const students = await Student.create([
            { userId: studentUsers[0]._id, rollNumber: 'CS2024001', semester: 4, section: 'A', year: 2, subjects: ['Data Structures', 'Database Systems', 'Operating Systems'], attendance: 85, cgpa: 8.5, fatherName: 'Rajesh Patel', address: 'Hyderabad' },
            { userId: studentUsers[1]._id, rollNumber: 'CS2024002', semester: 4, section: 'A', year: 2, subjects: ['Data Structures', 'Web Technologies', 'Computer Networks'], attendance: 92, cgpa: 9.1, fatherName: 'Suresh Reddy', address: 'Bangalore' },
            { userId: studentUsers[2]._id, rollNumber: 'CS2024003', semester: 4, section: 'B', year: 2, subjects: ['Algorithms', 'Database Systems', 'Operating Systems'], attendance: 58, cgpa: 6.3, fatherName: 'Manoj Verma', address: 'Chennai' },
            { userId: studentUsers[3]._id, rollNumber: 'CS2024004', semester: 4, section: 'A', year: 2, subjects: ['Data Structures', 'Web Technologies', 'Computer Networks'], attendance: 72, cgpa: 7.8, fatherName: 'Amit Gupta', address: 'Mumbai' },
            { userId: studentUsers[4]._id, rollNumber: 'CS2024005', semester: 4, section: 'B', year: 2, subjects: ['Algorithms', 'Database Systems', 'Operating Systems'], attendance: 55, cgpa: 5.5, fatherName: 'Mohan Nair', address: 'Kerala' },
            { userId: studentUsers[5]._id, rollNumber: 'CS2024006', semester: 4, section: 'A', year: 2, subjects: ['Data Structures', 'Database Systems', 'Computer Networks'], attendance: 95, cgpa: 9.5, fatherName: 'Ravi Sharma', address: 'Delhi' },
            { userId: studentUsers[6]._id, rollNumber: 'CS2024007', semester: 4, section: 'B', year: 2, subjects: ['Algorithms', 'Web Technologies', 'Operating Systems'], attendance: 68, cgpa: 6.8, fatherName: 'Venkat Kumar', address: 'Pune' },
            { userId: studentUsers[7]._id, rollNumber: 'CS2024008', semester: 4, section: 'A', year: 2, subjects: ['Data Structures', 'Database Systems', 'Computer Networks'], attendance: 90, cgpa: 8.9, fatherName: 'Sanjay Joshi', address: 'Visakhapatnam' }
        ]);

        // Subjects per semester for a typical B.Tech CS program
        const semSubjects = {
            1: ['Mathematics-I', 'Physics', 'C Programming', 'English'],
            2: ['Mathematics-II', 'Chemistry', 'Python Programming', 'Digital Logic'],
            3: ['Data Structures', 'Database Systems', 'Computer Architecture', 'Discrete Maths'],
            4: ['Algorithms', 'Operating Systems', 'Computer Networks', 'Web Technologies']
        };

        // Generate multi-semester performance data
        const perfRecords = [];
        for (const student of students) {
            for (let sem = 1; sem <= 4; sem++) {
                const subjects = semSubjects[sem];
                for (const subject of subjects) {
                    // Randomize but keep student's tendency
                    const baseIdx = students.indexOf(student);
                    const baseQuality = [0.85, 0.92, 0.58, 0.72, 0.55, 0.95, 0.68, 0.90][baseIdx];
                    const semFactor = 0.85 + (sem * 0.04); // slightly better each sem
                    const rand = () => 0.85 + Math.random() * 0.3;

                    // Assign to appropriate faculty
                    let facultyIdx;
                    if (['C Programming', 'Python Programming', 'Data Structures', 'Algorithms', 'Discrete Maths'].includes(subject)) facultyIdx = 0;
                    else if (['Database Systems', 'Web Technologies', 'English', 'Chemistry', 'Software Engineering'].includes(subject)) facultyIdx = 1;
                    else facultyIdx = 2;

                    const quality = baseQuality * semFactor * rand();
                    const internal = Math.min(40, Math.round(40 * quality));
                    const mid = Math.min(30, Math.round(30 * quality));
                    const external = Math.min(100, Math.round(100 * quality));
                    const attendance = Math.min(100, Math.round(100 * baseQuality * (0.9 + Math.random() * 0.2)));

                    perfRecords.push({
                        studentId: student._id,
                        facultyId: faculties[facultyIdx]._id,
                        subject,
                        semester: sem,
                        marks: { internal, mid, external },
                        attendance,
                        remarks: attendance < 60 ? 'Low attendance - Warning issued' : attendance < 75 ? 'Attendance below threshold' : ''
                    });
                }
            }
        }

        for (const perf of perfRecords) {
            await Performance.create(perf);
        }
        console.log(`${perfRecords.length} performance records created across 4 semesters`);

        console.log('\n=== SEED COMPLETE ===');
        console.log('Login: password123 for all');
        console.log('HOD:     hod@college.com');
        console.log('Faculty: faculty1@college.com, faculty2@college.com, faculty3@college.com');
        console.log('Student: student1@college.com through student8@college.com');
        console.log('\nStudents with LOW attendance (for warning testing):');
        console.log('  student3@college.com (Rahul Verma) - 58% overall');
        console.log('  student5@college.com (Karthik Nair) - 55% overall');
        console.log('  student4@college.com (Sneha Gupta) - 72% overall');
        console.log('  student7@college.com (Arun Kumar) - 68% overall');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
