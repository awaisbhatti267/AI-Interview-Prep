import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mic, Calendar, TrendingUp, ArrowUp, FileCheck, Mic2, Grid2x2 } from 'lucide-react'
import SideBar from '../Components/SideBar/SideBar'
import DashboardTopBar from '../Components/DashboardTopBar/DashboardTopBar'
import { dashboardAPI, interviewAPI } from '../services/api'
import './Dashboard.css'

/* ── Fallback static skills ── */
const staticSkills = [
    { name: 'Python', score: 0 },
    { name: 'Data Structures & Algorithms', score: 0 },
    { name: 'System Design', score: 0 },
    { name: 'React.js', score: 0 },
    { name: 'SQL', score: 0 },
    { name: 'OOP', score: 0 },
]

/* ── Donut chart (SVG) ── */
const DonutChart = ({ percent, color }) => {
    const r = 36
    const circ = 2 * Math.PI * r
    const offset = circ - (percent / 100) * circ
    return (
        <svg width='90' height='90' viewBox='0 0 90 90'>
            <circle cx='45' cy='45' r={r} fill='none' stroke='#e5e7eb' strokeWidth='8' />
            <circle cx='45' cy='45' r={r} fill='none' stroke={color} strokeWidth='8'
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap='round' transform='rotate(-90 45 45)'
                style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
            <text x='45' y='49' textAnchor='middle' fontSize='14' fontWeight='700' fill='#111827'>
                {percent}%
            </text>
        </svg>
    )
}

/* ── Sparkline ── */
const Sparkline = ({ color = '#7c3aed' }) => {
    const bars = [40, 55, 45, 65, 60, 75, 70]
    return (
        <div className='sparkline'>
            {bars.map((h, i) => (
                <div key={i} className='spark-bar' style={{ height: `${h}%`, background: color }} />
            ))}
        </div>
    )
}

const scoreClass = s => s >= 80 ? 'score-green' : s >= 65 ? 'score-orange' : 'score-red'

const Dashboard = () => {
    const [data, setData]         = useState(null)
    const [weakAreas, setWeakAreas] = useState([])
    const [loading, setLoading]   = useState(true)

    useEffect(() => {
        Promise.all([
            dashboardAPI.getStats().catch(() => null),
            interviewAPI.weakTopics(65).catch(() => null)
        ]).then(([dashRes, weakRes]) => {
            if (dashRes) setData(dashRes.data)
            if (weakRes) setWeakAreas(weakRes.data.weak_topics.slice(0, 3))
        }).finally(() => setLoading(false))
    }, [])

    const overallScore    = data?.overall_score      ?? 0
    const scoreTrend      = data?.score_trend        ?? 0
    const interviewsTaken = data?.interviews_taken   ?? 0
    const interviewsMonth = data?.interviews_this_month ?? 0
    const averageScore    = data?.average_score      ?? 0
    const skills          = data?.skills?.length ? data.skills : staticSkills
    const recentList      = data?.recent_interviews ?? []
    const resume          = data?.resume ?? null

    return (
        <div className='layout'>
            <SideBar />
            <div className='dashboard-wrapper'>
                <DashboardTopBar />
                <main className='dashboard-main'>

                    {/* ── Stat Cards ── */}
                    <section className='stat-cards'>

                        {/* Overall Score */}
                        <div className='stat-card'>
                            <div className='stat-card-donut'>
                                <div className='stat-card-info'>
                                    <p className='stat-label'>Overall Interview Score</p>
                                    <span className='stat-tag good'>
                                        {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good Job!' : 'Keep Going'}
                                    </span>
                                    <div className='stat-trend'>
                                        <ArrowUp size={13} className='trend-up' />
                                        <span className='trend-up'>{scoreTrend >= 0 ? '+' : ''}{scoreTrend}%</span>
                                        <span className='trend-label'>vs last month</span>
                                    </div>
                                </div>
                                <DonutChart percent={overallScore} color='#7c3aed' />
                            </div>
                        </div>

                        {/* Interviews Taken */}
                        <div className='stat-card'>
                            <p className='stat-label'>Interviews Taken</p>
                            <div className='stat-row'>
                                <div className='stat-icon-wrap' style={{ background: '#ede9fe', color: '#7c3aed' }}>
                                    <Mic size={28} />
                                </div>
                                <span className='stat-value'>{interviewsTaken}</span>
                            </div>
                            <div className='stat-trend'>
                                <ArrowUp size={13} className='trend-up' />
                                <span className='trend-up'>+{interviewsMonth} this month</span>
                            </div>
                            <Sparkline color='#7c3aed' />
                        </div>

                        {/* Average Score */}
                        <div className='stat-card'>
                            <p className='stat-label'>Average Score</p>
                            <div className='stat-row'>
                                <div className='stat-icon-wrap' style={{ background: '#dcfce7', color: '#16a34a' }}>
                                    <TrendingUp size={28} />
                                </div>
                                <span className='stat-value'>{averageScore}%</span>
                            </div>
                            <div className='stat-trend'>
                                <ArrowUp size={13} className='trend-up' />
                                <span className='trend-up'>{scoreTrend >= 0 ? '+' : ''}{scoreTrend}% vs last month</span>
                            </div>
                            <Sparkline color='#16a34a' />
                        </div>

                        {/* Upcoming */}
                        <div className='stat-card'>
                            <p className='stat-label'>Upcoming Interviews</p>
                            <div className='stat-row'>
                                <div className='stat-icon-wrap' style={{ background: '#dbeafe', color: '#2563eb' }}>
                                    <Calendar size={28} />
                                </div>
                                <span className='stat-value'>0</span>
                            </div>
                            <p className='stat-next'>Schedule your next session</p>
                        </div>
                    </section>

                    {/* ── Middle row ── */}
                    <section className='dashboard-mid'>

                        {/* Skills Progress */}
                        <div className='dash-card skills-card'>
                            <div className='dash-card-header'>
                                <h3>Your Skills Progress</h3>
                                <span className='dash-card-label'>Score</span>
                            </div>
                            <div className='skills-list'>
                                {skills.map(s => (
                                    <div className='skill-row' key={s.name}>
                                        <div className='skill-meta'>
                                            <span className='skill-name'>{s.name}</span>
                                        </div>
                                        <div className='skill-bar-wrap'>
                                            <div className='skill-bar-fill' style={{
                                                width: `${s.score}%`,
                                                background: s.score >= 80 ? '#7c3aed' : s.score >= 70 ? '#2563eb' : '#6b7280'
                                            }} />
                                        </div>
                                        <span className='skill-score'>{s.score}%</span>
                                    </div>
                                ))}
                            </div>
                            <Link to='/performance' className='dash-view-btn'>
                                View Full Performance →
                            </Link>
                        </div>

                        {/* Recent Interviews */}
                        <div className='dash-card recent-card'>
                            <div className='dash-card-header'>
                                <h3>Recent Interview</h3>
                                <Link to='/history' className='view-all'>View All</Link>
                            </div>
                            <div className='recent-list'>
                                {recentList.length === 0 ? (
                                    <p style={{ color: '#9ca3af', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
                                        No interviews yet.{' '}
                                        <Link to='/practice_interview' style={{ color: '#7c3aed' }}>Start one!</Link>
                                    </p>
                                ) : recentList.map(i => (
                                    <div className='recent-row' key={i.id}>
                                        <div className='recent-icon'>🎯</div>
                                        <div className='recent-info'>
                                            <p className='recent-title'>{i.topic}</p>
                                            <span className='recent-meta'>{i.total_questions} Questions</span>
                                        </div>
                                        <div className='recent-right'>
                                            <span className={`recent-score ${scoreClass(i.score)}`}>
                                                {Math.round(i.score)}%
                                            </span>
                                            <span className='recent-date'>
                                                {new Date(i.completed_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Bottom row ── */}
                    <section className='dashboard-bottom'>

                        {/* Resume Status */}
                        <div className='dash-card resume-card'>
                            <div className='dash-card-header'><h3>Resume Status</h3></div>
                            {resume ? (
                                <>
                                    <div className='resume-status-row'>
                                        <div className='resume-check'>
                                            <FileCheck size={20} color='#16a34a' />
                                        </div>
                                        <div className='resume-info'>
                                            <p className='resume-analyzed'>Resume <span>Analyzed</span></p>
                                            <p className='resume-filename'>{resume.filename}</p>
                                            <p className='resume-date'>
                                                Uploaded on {new Date(resume.uploaded_at).toLocaleDateString('en-US', {
                                                    month: 'long', day: 'numeric', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <Link to='/resume' className='dash-view-btn outline'>View Resume</Link>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12 }}>
                                        No resume uploaded yet
                                    </p>
                                    <Link to='/resume' className='dash-view-btn'>Upload Resume</Link>
                                </div>
                            )}
                        </div>

                        {/* Weakest Areas */}
                        <div className='dash-card weak-card'>
                            <div className='dash-card-header'><h3>Weakest Areas</h3></div>
                            <p className='weak-subtitle'>Improve these topics</p>
                            {weakAreas.length === 0 ? (
                                <p style={{ color: '#9ca3af', fontSize: 13, padding: '10px 0' }}>
                                    Complete interviews to see your weak areas
                                </p>
                            ) : (
                                <div className='weak-list'>
                                    {weakAreas.map(w => {
                                        const color = w.avg_score < 40 ? '#ef4444' : w.avg_score < 55 ? '#f97316' : '#d97706'
                                        return (
                                            <div className='weak-row' key={w.topic}>
                                                <span className='weak-topic'>{w.topic}</span>
                                                <span className='weak-score'
                                                    style={{ color, background: color + '18' }}>
                                                    {w.avg_score}%
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            <Link to='/weak_topics' className='weak-practice'>Practice Now →</Link>
                        </div>
                    </section>

                    {/* ── CTA Banner ── */}
                    <section className='cta-banner'>
                        <div className='cta-left'>
                            <div className='cta-icon'>🎯</div>
                            <div>
                                <h3>Ready to practice?</h3>
                                <p>Start a new AI interview and level up your skills.</p>
                            </div>
                        </div>
                        <div className='cta-actions'>
                            <Link to='/practice_interview' className='cta-btn primary'>
                                <Mic2 size={16} /> Start New Interview
                            </Link>
                            <Link to='/weak_topics' className='cta-btn outline'>
                                <Grid2x2 size={16} /> Choose Topic
                            </Link>
                        </div>
                    </section>

                </main>
            </div>
        </div>
    )
}

export default Dashboard
