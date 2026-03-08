import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { uploadBulkData } from '../../api/api';

export default function FacultyUpload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [subject, setSubject] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setResult(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            if (subject) formData.append('subject', subject);

            const res = await uploadBulkData(formData);
            setResult({ type: 'success', data: res.data });
            setFile(null);
        } catch (err) {
            setResult({ type: 'error', message: err.response?.data?.message || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="section-header">
                <h3>Bulk Data Upload</h3>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <h3>Upload Student Data</h3>
                </div>
                <div className="card-body">
                    <div className="form-group">
                        <label>Subject (optional — overrides file data)</label>
                        <input className="form-input" placeholder="e.g., Data Structures" value={subject} onChange={e => setSubject(e.target.value)} style={{ maxWidth: 400 }} />
                    </div>

                    <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`}>
                        <input {...getInputProps()} />
                        <div className="upload-icon"><FiUploadCloud /></div>
                        {isDragActive ? (
                            <h4>Drop the file here...</h4>
                        ) : (
                            <>
                                <h4>Drag & drop a file here, or click to browse</h4>
                                <p>Supports Excel (.xlsx, .xls, .csv) and PDF files</p>
                            </>
                        )}
                    </div>

                    {file && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <FiFile size={20} color="#818cf8" />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{file.name}</div>
                                <div style={{ fontSize: 12, color: '#64748b' }}>{formatFileSize(file.size)}</div>
                            </div>
                            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`upload-result ${result.type}`}>
                            {result.type === 'success' ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <FiCheckCircle size={18} />
                                        <strong>{result.data.message}</strong>
                                    </div>
                                    <div style={{ fontSize: 13 }}>
                                        <p>Records processed: {result.data.updated} / {result.data.totalRows}</p>
                                        {result.data.errors?.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <p style={{ fontWeight: 600 }}>Errors:</p>
                                                <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                                                    {result.data.errors.map((e, i) => <li key={i} style={{ fontSize: 12 }}>{e}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiAlertCircle size={18} />
                                    <span>{result.message}</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3>Excel File Format Guide</h3></div>
                <div className="card-body">
                    <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>Your Excel file should have these columns (column names are flexible):</p>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Roll Number</th>
                                <th>Name</th>
                                <th>Subject</th>
                                <th>Internal</th>
                                <th>Mid</th>
                                <th>External</th>
                                <th>Attendance</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>CS2024001</td>
                                <td>Arjun Patel</td>
                                <td>Data Structures</td>
                                <td>35</td>
                                <td>25</td>
                                <td>82</td>
                                <td>85</td>
                                <td>Good</td>
                            </tr>
                            <tr>
                                <td>CS2024002</td>
                                <td>Priya Reddy</td>
                                <td>Data Structures</td>
                                <td>38</td>
                                <td>28</td>
                                <td>91</td>
                                <td>92</td>
                                <td>Excellent</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
