import React, { useState, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'
import SideBar from '../Components/SideBar/SideBar'
import DashboardTopBar from '../Components/DashboardTopBar/DashboardTopBar'
import { interviewAPI } from '../services/api'
import './Performance.css'

const scoreColor = s => s >= 80 ? '#7c3aed' : s >= 60 ? '#2563eb' : s >= 40 ? '#d97706' : '#ef4444'
const scoreLabel = s => s >= 80 ? 'Strong' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Weak'

const Performance = () => {
    const [stats, setStats]   = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError]   = useState('')

    useEffect(() => {
        interviewAPI.performance()
            .then(res => setStats(res.data.stats))
            .catch(() => setError('Failed to load performance data'))
            .finally(() => setLoading(false))
    }, [])

    const overall = stats.length
        ? Math.round(stats.reduce((s, t) => s + t.avg_score, 0) / stats.length)
        : 0

    return (
        <div className='layout'>
            <SideBar />
            <div className='dashboard-wrapper'>
                <DashboardTopBar />
                <main className='dashboard-main'>
                    <div className='page-header'>
                        <h2 className='page-title'>Performance</h2>
                        <p className='page-subtitle'>Your average scores per topic across all sessions</p>
                    </div>

                    {loading ? (
                        <div className='perf-loading'>
                            <div className='perf-spinner' />
                            <p>Loading performance data...</p>
                        </div>
                    ) : error ? (
                        <div className='perf-error'>{error}</div>
                    ) : stats.length === 0 ? (
                        <div className='perf-empty'>
                            <BarChart2 size={40} color='#d1d5db' />
                            <p>No performance data yet. Complete some interviews first.</p>
                        </div>
                    ) : (
                        <div className='perf-content'>
                            {/* Overall score */}
                            <div className='perf-overall'>
                                <div>
                                    <p className='perf-overall-label'>Overall Average</p>
                                    <p className='perf-overall-value'>{overall}%</p>
                                </div>
                                <div>
                                    <p className='perf-overall-label'>Topics Practiced</p>
                                    <p className='perf-overall-value'>{stats.length}</p>
                                </div>
                                <div>
                                    <p className='perf-overall-label'>Total Sessions</p>
                                    <p className='perf-overall-value'>
                                        {stats.reduce((s, t) => s + t.attempts, 0)}
                                    </p>
                                </div>
                            </div>

                            {/* Per-topic bars */}
                            <div className='perf-card'>
                                <h3>Score by Topic</h3>
                                <div className='perf-list'>
                                    {[...stats].sort((a, b) => b.avg_score - a.avg_score).map(t => (
                                        <div className='perf-row' key={t.topic}>
                                            <div className='perf-row-meta'>
                                                <span className='perf-topic'>{t.topic}</span>
                                                <span className='perf-attempts'>{t.attempts} session{t.attempts > 1 ? 's' : ''}</span>
                                            </div>
                                            <div className='perf-bar-wrap'>
                                                <div
                                                    className='perf-bar-fill'
                                                    style={{
                                                        width: `${t.avg_score}%`,
                                                        background: scoreColor(t.avg_score)
                                                    }}
                                                />
                                            </div>
                                            <div className='perf-row-right'>
                                                <span className='perf-score' style={{ color: scoreColor(t.avg_score) }}>
                                                    {t.avg_score}%
                                                </span>
                                                <span className='perf-label' style={{ color: scoreColor(t.avg_score) }}>
                                                    {scoreLabel(t.avg_score)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Performance
