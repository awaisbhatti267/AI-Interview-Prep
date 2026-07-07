import React, { useState, useEffect } from 'react'
import { Mic, ChevronRight, CheckCircle, XCircle, RotateCcw, Trophy, BookmarkPlus, Bookmark } from 'lucide-react'
import SideBar from '../Components/SideBar/SideBar'
import DashboardTopBar from '../Components/DashboardTopBar/DashboardTopBar'
import { interviewAPI, resumeAPI, bookmarksAPI } from '../services/api'
import './PracticeInterview.css'

const SUGGESTED_TOPICS = [
    'Python', 'JavaScript', 'React.js', 'Data Structures & Algorithms',
    'System Design', 'SQL', 'OOP', 'HR Interview', 'Node.js', 'Machine Learning'
]

/* ── Step 1: Topic selection ── */
const TopicStep = ({ onStart, resumeSkills }) => {
    const [topic, setTopic]   = useState('')
    const [numQ, setNumQ]     = useState(10)
    const [loading, setLoading] = useState(false)
    const [error, setError]   = useState('')

    const start = async () => {
        if (!topic.trim()) return setError('Please enter or select a topic')
        setError('')
        setLoading(true)
        try {
            await onStart(topic.trim(), numQ)
        } catch (err) {
            setError(err.message || 'Failed to start interview')
            setLoading(false)
        }
    }

    return (
        <div className='pi-step'>
            <div className='pi-step-header'>
                <div className='pi-step-icon'><Mic size={28} /></div>
                <h2>Start a Practice Interview</h2>
                <p>Choose a topic and our AI will generate questions based on your resume and skill level</p>
            </div>

            <div className='pi-form'>
                <div className='pi-field'>
                    <label>Topic</label>
                    <input
                        type='text'
                        placeholder='e.g. Python, System Design, React.js...'
                        value={topic}
                        onChange={e => { setTopic(e.target.value); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && start()}
                    />
                    {error && <span className='pi-error'>{error}</span>}
                </div>

                {/* Suggested topics */}
                <div className='pi-suggestions'>
                    <p>Quick pick:</p>
                    <div className='pi-tags'>
                        {/* Resume skills first */}
                        {resumeSkills.slice(0, 4).map(s => (
                            <button key={s.name} className={`pi-tag ${topic === s.name ? 'active' : ''}`}
                                onClick={() => setTopic(s.name)}>
                                {s.name}
                            </button>
                        ))}
                        {/* Then suggested */}
                        {SUGGESTED_TOPICS.filter(t => !resumeSkills.find(s => s.name === t))
                            .slice(0, 6).map(t => (
                            <button key={t} className={`pi-tag ${topic === t ? 'active' : ''}`}
                                onClick={() => setTopic(t)}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='pi-field'>
                    <label>Number of Questions: <strong>{numQ}</strong></label>
                    <input type='range' min={5} max={20} value={numQ}
                        onChange={e => setNumQ(Number(e.target.value))}
                        className='pi-range' />
                    <div className='pi-range-labels'><span>5</span><span>20</span></div>
                </div>

                <button className='pi-btn primary' onClick={start} disabled={loading}>
                    {loading ? <span className='pi-spinner' /> : <><Mic size={16} /> Start Interview</>}
                </button>
            </div>
        </div>
    )
}

/* ── Step 2: Question answering ── */
const QuestionStep = ({ interview, questions, onComplete }) => {
    const [index, setIndex]       = useState(0)
    const [answer, setAnswer]     = useState('')
    const [feedback, setFeedback] = useState(null)
    const [loading, setLoading]   = useState(false)
    const [bookmarked, setBookmarked] = useState({})
    const [answers, setAnswers]   = useState([])

    const current = questions[index]
    const isLast  = index === questions.length - 1

    const submitAnswer = async () => {
        if (!answer.trim()) return
        setLoading(true)
        try {
            const res = await interviewAPI.submitAnswer(current.id, answer)
            const fb  = res.data
            setFeedback(fb)
            setAnswers(prev => [...prev, { ...current, ...fb, user_answer: answer }])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const next = async () => {
        if (isLast) {
            await interviewAPI.complete(interview.id)
            onComplete(answers)
        } else {
            setIndex(i => i + 1)
            setAnswer('')
            setFeedback(null)
        }
    }

    const toggleBookmark = async (qId) => {
        try {
            await bookmarksAPI.toggle(qId)
            setBookmarked(prev => ({ ...prev, [qId]: !prev[qId] }))
        } catch (err) { console.error(err) }
    }

    const progress = ((index) / questions.length) * 100

    return (
        <div className='pi-session'>
            {/* Progress bar */}
            <div className='pi-progress-wrap'>
                <div className='pi-progress-info'>
                    <span>Question {index + 1} of {questions.length}</span>
                    <span>{interview.topic}</span>
                </div>
                <div className='pi-progress-bar'>
                    <div className='pi-progress-fill' style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className='pi-question-card'>
                {/* Question */}
                <div className='pi-question'>
                    <div className='pi-q-number'>Q{index + 1}</div>
                    <p>{current.question}</p>
                    <button className='pi-bookmark-btn'
                        onClick={() => toggleBookmark(current.id)}
                        title='Bookmark question'>
                        {bookmarked[current.id]
                            ? <Bookmark size={18} fill='#7c3aed' color='#7c3aed' />
                            : <BookmarkPlus size={18} />}
                    </button>
                </div>

                {/* Answer area */}
                {!feedback ? (
                    <div className='pi-answer-wrap'>
                        <textarea
                            className='pi-answer'
                            placeholder='Type your answer here...'
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            rows={6}
                            disabled={loading}
                        />
                        <button className='pi-btn primary' onClick={submitAnswer}
                            disabled={!answer.trim() || loading}>
                            {loading
                                ? <><span className='pi-spinner' /> Evaluating...</>
                                : <>Submit Answer <ChevronRight size={16} /></>}
                        </button>
                    </div>
                ) : (
                    /* Feedback */
                    <div className='pi-feedback'>
                        <div className={`pi-score-badge ${feedback.score >= 70 ? 'good' : feedback.score >= 50 ? 'fair' : 'poor'}`}>
                            {feedback.score >= 70
                                ? <CheckCircle size={18} />
                                : <XCircle size={18} />}
                            Score: {feedback.score}/100
                        </div>

                        <div className='pi-feedback-section'>
                            <h4>Your Answer</h4>
                            <p className='pi-user-answer'>{answer}</p>
                        </div>

                        <div className='pi-feedback-section'>
                            <h4>AI Feedback</h4>
                            <p>{feedback.feedback}</p>
                        </div>

                        <div className='pi-feedback-section ideal'>
                            <h4>Ideal Answer</h4>
                            <p>{feedback.correct_answer}</p>
                        </div>

                        <button className='pi-btn primary' onClick={next}>
                            {isLast ? <><Trophy size={16} /> Finish Interview</> : <>Next Question <ChevronRight size={16} /></>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── Step 3: Results ── */
const ResultStep = ({ answers, interview, onRestart }) => {
    const avg = answers.length
        ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length)
        : 0

    const scoreColor = avg >= 70 ? '#16a34a' : avg >= 50 ? '#d97706' : '#ef4444'

    return (
        <div className='pi-results'>
            <div className='pi-results-header'>
                <Trophy size={40} color='#7c3aed' />
                <h2>Interview Complete!</h2>
                <p>{interview.topic} · {answers.length} Questions</p>
                <div className='pi-final-score' style={{ color: scoreColor }}>
                    {avg}%
                </div>
                <p className='pi-score-label' style={{ color: scoreColor }}>
                    {avg >= 80 ? 'Excellent!' : avg >= 60 ? 'Good job!' : 'Keep practicing!'}
                </p>
            </div>

            <div className='pi-answers-review'>
                <h3>Review</h3>
                {answers.map((a, i) => (
                    <div className='pi-review-row' key={i}>
                        <div className='pi-review-header'>
                            <span className='pi-review-q'>Q{i + 1}. {a.question}</span>
                            <span className={`pi-review-score ${a.score >= 70 ? 'good' : a.score >= 50 ? 'fair' : 'poor'}`}>
                                {a.score}/100
                            </span>
                        </div>
                        <p className='pi-review-answer'>{a.user_answer}</p>
                    </div>
                ))}
            </div>

            <button className='pi-btn primary' onClick={onRestart}>
                <RotateCcw size={16} /> Start New Interview
            </button>
        </div>
    )
}

/* ── Main component ── */
const PracticeInterview = () => {
    const [step, setStep]           = useState('topic')   // topic | session | results
    const [interview, setInterview] = useState(null)
    const [questions, setQuestions] = useState([])
    const [answers, setAnswers]     = useState([])
    const [resumeSkills, setResumeSkills] = useState([])

    useEffect(() => {
        resumeAPI.get()
            .then(res => { if (res.data?.skills) setResumeSkills(res.data.skills) })
            .catch(() => {})
    }, [])

    const handleStart = async (topic, numQ) => {
        const res = await interviewAPI.start(topic, numQ)
        setInterview(res.data.interview)
        setQuestions(res.data.questions)
        setStep('session')
    }

    const handleComplete = (allAnswers) => {
        setAnswers(allAnswers)
        setStep('results')
    }

    const handleRestart = () => {
        setStep('topic')
        setInterview(null)
        setQuestions([])
        setAnswers([])
    }

    return (
        <div className='layout'>
            <SideBar />
            <div className='dashboard-wrapper'>
                <DashboardTopBar />
                <main className='dashboard-main'>
                    <div className='pi-page'>
                        {step === 'topic' && (
                            <TopicStep onStart={handleStart} resumeSkills={resumeSkills} />
                        )}
                        {step === 'session' && interview && (
                            <QuestionStep
                                interview={interview}
                                questions={questions}
                                onComplete={handleComplete}
                            />
                        )}
                        {step === 'results' && (
                            <ResultStep
                                answers={answers}
                                interview={interview}
                                onRestart={handleRestart}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default PracticeInterview
