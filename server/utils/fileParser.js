const xlsx = require('xlsx');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const parseExcel = async (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    return data.map(row => ({
        rollNumber: String(row['Roll Number'] || row['rollNumber'] || row['RollNo'] || row['roll_number'] || ''),
        name: row['Name'] || row['name'] || row['Student Name'] || '',
        subject: row['Subject'] || row['subject'] || '',
        internal: row['Internal'] || row['internal'] || row['Internal Marks'] || 0,
        mid: row['Mid'] || row['mid'] || row['Mid Marks'] || row['Midterm'] || 0,
        external: row['External'] || row['external'] || row['External Marks'] || 0,
        attendance: row['Attendance'] || row['attendance'] || 0,
        semester: row['Semester'] || row['semester'] || 1,
        remarks: row['Remarks'] || row['remarks'] || ''
    }));
};

const parsePDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    const lines = text.split('\n').filter(line => line.trim());
    const results = [];

    for (const line of lines) {
        const parts = line.split(/\s{2,}|\t/);
        if (parts.length >= 4) {
            const rollNumber = parts[0]?.trim();
            if (rollNumber && /^[A-Z0-9]+$/i.test(rollNumber)) {
                results.push({
                    rollNumber,
                    name: parts[1]?.trim() || '',
                    subject: parts[2]?.trim() || '',
                    internal: parseInt(parts[3]) || 0,
                    mid: parseInt(parts[4]) || 0,
                    external: parseInt(parts[5]) || 0,
                    attendance: parseInt(parts[6]) || 0,
                    semester: parseInt(parts[7]) || 1,
                    remarks: parts[8]?.trim() || ''
                });
            }
        }
    }

    return results;
};

module.exports = { parseExcel, parsePDF };
