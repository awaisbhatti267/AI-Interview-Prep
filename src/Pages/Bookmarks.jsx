import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Trash2, BookmarkX } from 'lucide-react'
import SideBar from '../Components/SideBar/SideBar'
import DashboardTopBar from '../Components/DashboardTopBar/DashboardTopBar'
import { bookmarksAPI } from '../services/api'
import './Bookmarks.css'

const Bookmarks = () => {
    const [bookmarks, setBookmarks] = useState([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState('')

    useEffect(() => {
        bookmarksAPI.list()
            .then(res => setBookmarks(res.data.bookmarks))
            .catch(() => setError('Failed to load bookmarks'))
            .finally(() => setLoading(false))
    }, [])

    const handleRemove = async (questionId) => {
        try {
            await bookmarksAPI.toggle(questionId)
            setBookmarks(prev => prev.filter(b => b.question?.id !== questionId))
        } catch (err) { console.error(err) }
    }

    const formatDate = iso => new Date(iso).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    })

    const scoreClass = s => s >= 80 ? 'good' : s >= 60 ? 'fair' : 'poor'

    return (
        <div className='layout'>
            <SideBar />
            <div className='dashboard-wrapper'>
                <DashboardTopBar />
                <main className='dashboard-main'>
                    <div className='page-header'>
                        <h2 className='page-title'>Bookmarks</h2>
                        <p className='page-subtitle'>Questions you saved for later review</p>
                    </div>

                    {loading ? (
                        <div className='bm-loading'>
                            <div className='bm-spinner' /><p>Loading bookmarks...</p>
                        </div>
                    ) : error ? (
                        <div className='bm-error'>{error}</div>
                    ) : bookmarks.length === 0 ? (
                        <div className='bm-empty'>
                            <BookmarkX size={40} color='#d1d5db' />
                            <p>No bookmarks yet</p>
                            <span>Bookmark questions during interviews to review them here</span>
                            <Link to='/practice_interview' className='bm-btn'>
                                Start an Interview
                            </Link>
                        </div>
                    ) : (
                        <div className='bm-list'>
                            <p className='bm-count'>{bookmarks.length} saved question{bookmarks.length > 1 ? 's' : ''}</p>
                            {bookmarks.map(b => (
                                <div className='bm-card' key={b.id}>
                                    <div className='bm-card-top'>
                                        <Bookmark size={16} fill='#7c3aed' color='#7c3aed' />
                                        <span className='bm-date'>{formatDate(b.created_at)}</span>
                                        <button className='bm-remove' onClick={() => handleRemove(b.question?.id)}
                                            title='Remove bookmark'>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                    <p className='bm-question'>{b.question?.question}</p>

                                    {b.question?.user_answer && (
                                        <div className='bm-answer-wrap'>
                                            <p className='bm-label'>Your Answer</p>
                                            <p className='bm-answer'>{b.question.user_answer}</p>
                                        </div>
                                    )}

                                    {b.question?.score != null && (
                                        <span className={`bm-score ${scoreClass(b.question.score)}`}>
                                            Score: {b.question.score}/100
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Bookmarks
