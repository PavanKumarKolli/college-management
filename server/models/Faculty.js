const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    facultyId: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        default: 'Computer Science'
    },
    designation: {
        type: String,
        default: 'Assistant Professor'
    },
    subjects: [{
        type: String
    }],
    assignedWork: [{
        title: { type: String, required: true },
        description: { type: String, default: '' },
        deadline: { type: Date },
        status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        assignedDate: { type: Date, default: Date.now }
    }],
    syllabusCoverage: [{
        subject: { type: String, required: true },
        totalTopics: { type: Number, default: 0 },
        coveredTopics: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        topics: [{
            name: { type: String },
            completed: { type: Boolean, default: false }
        }]
    }],
    experience: {
        type: Number,
        default: 0
    },
    qualification: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
