import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { BrainCircuit, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import './Auth.css'

const VerifyOtp = () => {
    const { verifyOtp }   = useAuth()
    const navigate        = useNavigate()
    const location        = useLocation()
    const email           = location.state?.email || ''

    const [otp, setOtp]           = useState(['', '', '', '', '', ''])
    const [loading, setLoading]   = useState(false)
    const [resending, setResending] = useState(false)
    const [error, setError]       = useState('')
    const [resendMsg, setResendMsg] = useState('')
    const [countdown, setCountdown] = useState(60)

    const inputRefs = useRef([])

    // Redirect if no email in state
    useEffect(() => {
        if (!email) navigate('/signup')
    }, [email])

    // Countdown for resend
    useEffect(() => {
        if (countdown <= 0) return
        const t = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [countdown])

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return  // digits only
        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)   // one digit per box
        setOtp(newOtp)
        setError('')

        // Auto-focus next
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all filled
        if (newOtp.every(d => d !== '') && value) {
            handleVerify(newOtp.join(''))
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            const newOtp = pasted.split('')
            setOtp(newOtp)
            inputRefs.current[5]?.focus()
            handleVerify(pasted)
        }
    }

    const handleVerify = async (code) => {
        if (loading) return
        setLoading(true)
        setError('')
        try {
            await verifyOtp(email, code)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Invalid code. Please try again.')
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResending(true)
        setResendMsg('')
        setError('')
        try {
            await authAPI.resendOtp(email)
            setResendMsg('New code sent! Check your inbox.')
            setCountdown(60)
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } catch (err) {
            setError(err.message || 'Failed to resend code.')
        } finally {
            setResending(false)
        }
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
                    <div className='auth-card-header'>
                        <div className='otp-email-icon'>
                            <CheckCircle size={32} color='#7c3aed' />
                        </div>
                        <h2>Verify your email</h2>
                        <p>
                            We sent a 6-digit code to<br />
                            <strong style={{ color: '#111827' }}>{email}</strong>
                        </p>
                    </div>

                    {/* OTP inputs */}
                    <div className='otp-inputs' onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type='text'
                                inputMode='numeric'
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`otp-box ${error ? 'has-error' : ''} ${digit ? 'filled' : ''}`}
                                disabled={loading}
                                autoFocus={i === 0}
                            />
                        ))}
                    </div>

                    {loading && (
                        <div className='otp-verifying'>
                            <span className='auth-spinner' style={{ borderTopColor: '#7c3aed', borderColor: '#ede9fe' }} />
                            <span>Verifying...</span>
                        </div>
                    )}

                    {error && <div className='auth-server-error'>{error}</div>}
                    {resendMsg && <div className='otp-success-msg'>{resendMsg}</div>}

                    {/* Resend */}
                    <div className='otp-resend'>
                        {countdown > 0 ? (
                            <p>Resend code in <strong>{countdown}s</strong></p>
                        ) : (
                            <button
                                className='otp-resend-btn'
                                onClick={handleResend}
                                disabled={resending}
                            >
                                <RefreshCw size={14} />
                                {resending ? 'Sending...' : 'Resend code'}
                            </button>
                        )}
                    </div>

                    <p className='auth-switch'>
                        <Link to='/signup' className='auth-back-link'>
                            <ArrowLeft size={14} /> Back to sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default VerifyOtp
