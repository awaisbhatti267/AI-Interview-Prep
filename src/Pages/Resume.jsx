import React, { useState, useEffect, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, RefreshCw, Zap } from 'lucide-react'
import SideBar from '../Components/SideBar/SideBar'
import DashboardTopBar from '../Components/DashboardTopBar/DashboardTopBar'
import { resumeAPI } from '../services/api'
import './Resume.css'

const levelColor = {
    Advanced:     { bg: '#ede9fe', text: '#7c3aed' },
    Intermediate: { bg: '#dbeafe', text: '#2563eb' },
    Beginner:     { bg: '#dcfce7', text: '#16a34a' },
}

const Resume = () => {
    const [resume, setResume]       = useState(null)
    const [loading, setLoading]     = useState(true)
    const [uploading, setUploading] = useState(false)
    const [error, setError]         = useState('')
    const [dragOver, setDragOver]   = useState(false)
    const fileInputRef              = useRef(null)

    // Load existing resume on mount
    useEffect(() => {
        resumeAPI.get()
            .then(res => setResume(res.data))
            .catch(() => setResume(null))
            .finally(() => setLoading(false))
    }, [])

    const handleFile = async (file) => {
        if (!file) return
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed.')
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be under 10MB.')
            return
        }

        setError('')
        setUploading(true)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await resumeAPI.upload(formData)
            setResume(res.data)
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleInputChange = (e) => handleFile(e.target.files[0])

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        handleFile(e.dataTransfer.files[0])
    }

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true) }
    const handleDragLeave = () => setDragOver(false)

    const handleReplace = () => {
        setResume(null)
        setError('')
        setTimeout(() => fileInputRef.current?.click(), 100)
    }

    const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    })

    return (
        <div className='layout'>
            <SideBar />
            <div className='dashboard-wrapper'>
                <DashboardTopBar />
                <main className='dashboard-main'>

                    <div className='resume-page'>

                        {/* ── Page heading ── */}
                        <div className='page-header'>
                            <h2 className='page-title'>Resume</h2>
                            <p className='page-subtitle'>Upload your resume — AI will extract your skills and generate tailored interview questions</p>
                        </div>

                        {loading ? (
                            <div className='resume-loading'>
                                <div className='resume-spinner' />
                                <p>Loading your resume...</p>
                            </div>
                        ) : resume ? (
                            /* ── Resume uploaded state ── */
                            <div className='resume-content'>
                                <div className='resume-card'>
                                    <div className='resume-card-header'>
                                        <div className='resume-file-info'>
                                            <div className='resume-file-icon'>
                                                <FileText size={28} color='#7c3aed' />
                                            </div>
                                            <div>
                                                <p className='resume-filename'>{resume.filename}</p>
                                                <p className='resume-uploaded'>Uploaded on {formatDate(resume.uploaded_at)}</p>
                                            </div>
                                        </div>
                                        <div className='resume-status-badge'>
                                            <CheckCircle size={16} />
                                            Analyzed
                                        </div>
                                    </div>

                                    <div className='resume-card-actions'>
                                        <button className='resume-btn outline' onClick={handleReplace}>
                                            <RefreshCw size={15} /> Replace Resume
                                        </button>
                                    </div>
                                </div>

                                {/* ── Extracted Skills ── */}
                                {resume.skills && resume.skills.length > 0 && (
                                    <div className='skills-extracted'>
                                        <div className='skills-extracted-header'>
                                            <Zap size={18} color='#7c3aed' />
                                            <h3>Extracted Skills <span>{resume.skills.length} found</span></h3>
                                        </div>
                                        <div className='skills-grid'>
                                            {resume.skills.map((skill, i) => {
                                                const style = levelColor[skill.level] || levelColor.Intermediate
                                                return (
                                                    <div className='skill-chip' key={i}
                                                        style={{ background: style.bg, color: style.text }}>
                                                        <span className='skill-chip-name'>{skill.name}</span>
                                                        <span className='skill-chip-level'>{skill.level}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ── Upload state ── */
                            <div className='resume-upload-wrap'>
                                <div
                                    className={`resume-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type='file'
                                        accept='.pdf'
                                        onChange={handleInputChange}
                                        style={{ display: 'none' }}
                                    />

                                    {uploading ? (
                                        <div className='dropzone-uploading'>
                                            <div className='resume-spinner large' />
                                            <p className='dropzone-title'>Analyzing your resume...</p>
                                            <p className='dropzone-sub'>Groq AI is extracting your skills</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className='dropzone-icon'>
                                                <Upload size={32} color='#7c3aed' />
                                            </div>
                                            <p className='dropzone-title'>
                                                {dragOver ? 'Drop your PDF here' : 'Drag & drop your resume'}
                                            </p>
                                            <p className='dropzone-sub'>or <span>click to browse</span></p>
                                            <p className='dropzone-hint'>PDF only · Max 10MB</p>
                                        </>
                                    )}
                                </div>

                                {error && (
                                    <div className='resume-error'>
                                        <AlertCircle size={15} />
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    )
}

export default Resume
