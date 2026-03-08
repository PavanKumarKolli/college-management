import axios from 'axios';

const API = axios.create({
    baseURL: '/api'
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (data) => API.post('/auth/login', data);

// HOD
export const getHodDashboard = () => API.get('/hod/dashboard');
export const getHodFaculty = () => API.get('/hod/faculty');
export const getHodStudents = () => API.get('/hod/students');
export const getHodFacultyDetail = (id) => API.get(`/hod/faculty/${id}`);

// Faculty
export const getFacultyDashboard = () => API.get('/faculty/dashboard');
export const getAssignedWork = () => API.get('/faculty/assigned-work');
export const updateWorkStatus = (workId, data) => API.put(`/faculty/assigned-work/${workId}/status`, data);
export const getSyllabus = () => API.get('/faculty/syllabus');
export const updateTopic = (subjectIndex, topicIndex, data) => API.put(`/faculty/syllabus/${subjectIndex}/topic/${topicIndex}`, data);
export const uploadBulkData = (formData) => API.post('/faculty/upload-bulk', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePerformance = (id, data) => API.put(`/faculty/performance/${id}`, data);
export const getFacultyStudents = () => API.get('/faculty/students');

// Student
export const getStudentProfile = () => API.get('/student/profile');
export const getStudentPerformance = () => API.get('/student/performance');
export const downloadReport = () => API.get('/student/download-report', { responseType: 'blob' });

// Alerts
export const sendAttendanceWarning = (data) => API.post('/alerts/attendance-warning', data);
export const checkAllAttendance = () => API.post('/alerts/check-all');

// HOD Admin
export const getHodFacultyList = () => API.get('/hod/faculty-list');
export const assignWorkToFaculty = (data) => API.post('/hod/assign-work', data);
export const getAllAssignedWork = () => API.get('/hod/all-assigned-work');
export const deleteAssignedWork = (facultyId, workId) => API.delete(`/hod/assigned-work/${facultyId}/${workId}`);

// Faculty Admin
export const updateStudentDetails = (id, data) => API.put(`/faculty/student/${id}`, data);

export default API;
