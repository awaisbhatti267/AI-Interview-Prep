import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle, ChevronRight } from 'lucide-react'
import SideBar from '../Components/SideBar/SideBar'
import DashboardTopBar from '../Components/DashboardTopBar/DashboardTopBar'
import { interviewAPI } from '../services/api'
import './History.css'

const scoreClass = s => s >= 80 ? 'good' : s >= 60 ? 'fair' : 'poor'

const History = () => {
    const [interviews, setInterviews] = useState([])
    const [loading, setLoading]       = useState(true)
    const [error, setError]           = useState('')

    useEffect(() => {
        interviewAPI.history()
            .then(res => setInterviews(res.data.interviews))
            .catch(() => setError('Failed to load history'))
            .finally(() => setLoading(false))
    }, [])

    const formatDate = iso => new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    })

    return (
        <div className='layout'>
            <SideBar />
            <div className='dashboard-wrapper'>
                <DashboardTopBar />
                <main className='dashboard-main'>
                    <div className='page-header'>
                        <h2 className='page-title'>Interview History</h2>
                        <p className='page-subtitle'>All your completed practice sessions</p>
                    </div>

                    {loading ? (
                        <div className='hist-loading'>
                            <div className='hist-spinner' />
                            <p>Loading history...</p>
                        </div>
                    ) : error ? (
                        <div className='hist-error'>{error}</div>
                    ) : interviews.length === 0 ? (
                        <div className='hist-empty'>
                            <Clock size={40} color='#d1d5db' />
                            <p>No interviews yet</p>
                            <Link to='/practice_interview' className='hist-start-btn'>
                                Start your first interview
                            </Link>
                        </div>
                    ) : (
                        <div className='hist-list'>
                            {interviews.map(i => (
                                <div className='hist-card' key={i.id}>
                                    <div className='hist-card-left'>
                                        <div className='hist-icon'>
                                            <CheckCircle size={20} color='#7c3aed' />
                                        </div>
                                        <div>
                                            <p className='hist-topic'>{i.topic}</p>
                                            <p className='hist-meta'>
                                                {i.total_questions} Questions · {formatDate(i.completed_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='hist-card-right'>
                                        <span className={`hist-score ${scoreClass(i.score)}`}>
                                            {Math.round(i.score)}%
                                        </span>
                                        <ChevronRight size={16} color='#9ca3af' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default History
