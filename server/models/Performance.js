const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    marks: {
        internal: { type: Number, default: 0, min: 0, max: 40 },
        mid: { type: Number, default: 0, min: 0, max: 30 },
        external: { type: Number, default: 0, min: 0, max: 100 },
        total: { type: Number, default: 0 }
    },
    attendance: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    grade: {
        type: String,
        enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'N/A'],
        default: 'N/A'
    },
    remarks: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

performanceSchema.pre('save', function (next) {
    this.marks.total = (this.marks.internal || 0) + (this.marks.mid || 0) + (this.marks.external || 0);

    const total = this.marks.total;
    const maxTotal = 170;
    const percentage = (total / maxTotal) * 100;

    if (percentage >= 90) this.grade = 'O';
    else if (percentage >= 80) this.grade = 'A+';
    else if (percentage >= 70) this.grade = 'A';
    else if (percentage >= 60) this.grade = 'B+';
    else if (percentage >= 50) this.grade = 'B';
    else if (percentage >= 40) this.grade = 'C';
    else if (percentage >= 30) this.grade = 'D';
    else this.grade = 'F';

    next();
});

module.exports = mongoose.model('Performance', performanceSchema);
