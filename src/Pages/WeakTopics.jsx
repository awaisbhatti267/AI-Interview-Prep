import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, TrendingUp } from 'lucide-react'
import SideBar from '../Components/SideBar/SideBar'
import DashboardTopBar from '../Components/DashboardTopBar/DashboardTopBar'
import { interviewAPI } from '../services/api'
import './WeakTopics.css'

const WeakTopics = () => {
    const [topics, setTopics]   = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState('')

    useEffect(() => {
        interviewAPI.weakTopics(65)
            .then(res => setTopics(res.data.weak_topics))
            .catch(() => setError('Failed to load weak topics'))
            .finally(() => setLoading(false))
    }, [])

    const urgencyColor = s => s < 40 ? '#ef4444' : s < 55 ? '#f97316' : '#d97706'

    return (
        <div className='layout'>
            <SideBar />
            <div className='dashboard-wrapper'>
                <DashboardTopBar />
                <main className='dashboard-main'>
                    <div className='page-header'>
                        <h2 className='page-title'>Weak Topics</h2>
                        <p className='page-subtitle'>Topics where your average score is below 65% — focus here to improve</p>
                    </div>

                    {loading ? (
                        <div className='wt-loading'>
                            <div className='wt-spinner' /><p>Analyzing your performance...</p>
                        </div>
                    ) : error ? (
                        <div className='wt-error'>{error}</div>
                    ) : topics.length === 0 ? (
                        <div className='wt-empty'>
                            <TrendingUp size={40} color='#16a34a' />
                            <p>No weak topics found — you're doing great!</p>
                            <Link to='/practice_interview' className='wt-btn'>Keep Practicing</Link>
                        </div>
                    ) : (
                        <div className='wt-content'>
                            <div className='wt-grid'>
                                {topics.map(t => (
                                    <div className='wt-card' key={t.topic}>
                                        <div className='wt-card-top'>
                                            <BookOpen size={20} color={urgencyColor(t.avg_score)} />
                                            <span className='wt-score'
                                                style={{ color: urgencyColor(t.avg_score), background: urgencyColor(t.avg_score) + '18' }}>
                                                {t.avg_score}%
                                            </span>
                                        </div>
                                        <h3 className='wt-topic'>{t.topic}</h3>
                                        <p className='wt-meta'>
                                            {t.attempts} attempt{t.attempts > 1 ? 's' : ''} · Best: {t.best}%
                                        </p>
                                        <div className='wt-bar-wrap'>
                                            <div className='wt-bar-fill'
                                                style={{ width: `${t.avg_score}%`, background: urgencyColor(t.avg_score) }} />
                                        </div>
                                        <Link
                                            to={`/practice_interview`}
                                            state={{ topic: t.topic }}
                                            className='wt-practice-btn'
                                        >
                                            Practice Now <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default WeakTopics
