const PDFDocument = require('pdfkit');

const generateStudentReport = (student, performances) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Header
            doc.rect(0, 0, doc.page.width, 120).fill('#1a1a2e');
            doc.fillColor('#ffffff')
                .fontSize(24)
                .text('COLLEGE MANAGEMENT SYSTEM', 50, 30, { align: 'center' });
            doc.fontSize(14)
                .text('Student Performance Report', 50, 60, { align: 'center' });
            doc.fontSize(10)
                .text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 50, 85, { align: 'center' });

            // Student Info
            doc.fillColor('#333333');
            doc.moveDown(3);
            doc.fontSize(16).text('Student Information', { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(11);
            const info = [
                ['Name', student.userId?.name || 'N/A'],
                ['Roll Number', student.rollNumber],
                ['Email', student.userId?.email || 'N/A'],
                ['Department', student.userId?.department || 'N/A'],
                ['Semester', String(student.semester)],
                ['Section', student.section],
                ['CGPA', String(student.cgpa)],
                ['Overall Attendance', `${student.attendance}%`]
            ];

            info.forEach(([label, value]) => {
                doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
                doc.font('Helvetica').text(value);
            });

            // Performance Table
            doc.moveDown(1.5);
            doc.fontSize(16).font('Helvetica-Bold').text('Subject-wise Performance', { underline: true });
            doc.moveDown(0.5);

            if (performances.length > 0) {
                const tableTop = doc.y + 10;
                const colWidths = [120, 55, 50, 60, 55, 55, 50];
                const headers = ['Subject', 'Internal', 'Mid', 'External', 'Total', 'Attend.', 'Grade'];

                // Table Header
                doc.rect(50, tableTop, 495, 25).fill('#16213e');
                doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
                let x = 55;
                headers.forEach((h, i) => {
                    doc.text(h, x, tableTop + 7, { width: colWidths[i], align: 'center' });
                    x += colWidths[i];
                });

                // Table Rows
                let y = tableTop + 25;
                doc.fillColor('#333333').font('Helvetica').fontSize(9);

                performances.forEach((p, idx) => {
                    if (y > 700) {
                        doc.addPage();
                        y = 50;
                    }

                    const bgColor = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
                    doc.rect(50, y, 495, 22).fill(bgColor);
                    doc.fillColor('#333333');

                    x = 55;
                    const rowData = [
                        p.subject,
                        String(p.marks.internal),
                        String(p.marks.mid),
                        String(p.marks.external),
                        String(p.marks.total),
                        `${p.attendance}%`,
                        p.grade
                    ];

                    rowData.forEach((val, i) => {
                        doc.text(val, x, y + 6, { width: colWidths[i], align: 'center' });
                        x += colWidths[i];
                    });

                    y += 22;
                });

                // Summary
                y += 15;
                if (y > 700) { doc.addPage(); y = 50; }

                const avgMarks = (performances.reduce((s, p) => s + p.marks.total, 0) / performances.length).toFixed(1);
                const avgAttendance = (performances.reduce((s, p) => s + p.attendance, 0) / performances.length).toFixed(1);

                doc.rect(50, y, 495, 60).fill('#e8f4f8').stroke('#16213e');
                doc.fillColor('#16213e').fontSize(12).font('Helvetica-Bold');
                doc.text('Summary', 60, y + 8);
                doc.fontSize(10).font('Helvetica');
                doc.text(`Average Marks: ${avgMarks} / 170`, 60, y + 25);
                doc.text(`Average Attendance: ${avgAttendance}%`, 60, y + 40);
                doc.text(`Total Subjects: ${performances.length}`, 300, y + 25);
            } else {
                doc.fontSize(12).text('No performance records available.', { align: 'center' });
            }

            // Footer
            doc.fontSize(8)
                .fillColor('#999999')
                .text('This is a computer-generated report.', 50, doc.page.height - 50, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateStudentReport };
