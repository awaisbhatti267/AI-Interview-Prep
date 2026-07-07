import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrainCircuit, Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import './Auth.css'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const validate = () => {
        if (!email.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email'
        return ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const err = validate()
        if (err) return setError(err)
        setLoading(true)
        // TODO: connect to backend
        await new Promise(r => setTimeout(r, 1500))
        setLoading(false)
        setSent(true)
    }

    return (
        <div className='auth-page'>
            {/* ── Left brand panel ── */}
            <div className='auth-brand'>
                <div className='auth-brand-inner'>
                    <div className='auth-brand-logo'>
                        <BrainCircuit size={36} />
                    </div>
                    <h1>AI Interview</h1>
                    <p>Prep Platform</p>
                    <ul className='auth-brand-features'>
                        <li>AI-powered mock interviews</li>
                        <li>Real-time feedback & scoring</li>
                        <li>Track your weak areas</li>
                        <li>Resume-based question generation</li>
                    </ul>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className='auth-form-panel'>
                <div className='auth-card'>
                    {!sent ? (
                        <>
                            <div className='auth-card-header'>
                                <h2>Forgot password?</h2>
                                <p>Enter your email and we'll send you a reset link</p>
                            </div>

                            <form className='auth-form' onSubmit={handleSubmit} noValidate>
                                <div className={`auth-field ${error ? 'has-error' : ''}`}>
                                    <label htmlFor='email'>Email</label>
                                    <div className='auth-input-wrap'>
                                        <Mail size={16} className='auth-input-icon' />
                                        <input
                                            id='email'
                                            type='email'
                                            placeholder='you@example.com'
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value)
                                                if (error) setError('')
                                            }}
                                            autoComplete='email'
                                        />
                                    </div>
                                    {error && <span className='auth-error'>{error}</span>}
                                </div>

                                <button type='submit' className='auth-btn' disabled={loading}>
                                    {loading ? <span className='auth-spinner' /> : <>Send Reset Link <ArrowRight size={16} /></>}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className='auth-success'>
                            <div className='auth-success-icon'>
                                <CheckCircle size={48} />
                            </div>
                            <h2>Check your email</h2>
                            <p>We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.</p>
                            <button
                                className='auth-btn'
                                onClick={() => { setSent(false); setEmail('') }}
                            >
                                Resend email
                            </button>
                        </div>
                    )}

                    <p className='auth-switch'>
                        <Link to='/login' className='auth-back-link'>
                            <ArrowLeft size={14} /> Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
