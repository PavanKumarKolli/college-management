const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    section: {
        type: String,
        default: 'A'
    },
    year: {
        type: Number,
        default: 1
    },
    subjects: [{
        type: String
    }],
    attendance: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    cgpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    fatherName: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    address: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
