import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrainCircuit, Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const Signup = () => {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState('')

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Full name is required'
        if (!form.email.trim()) e.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
        if (!form.confirm) e.confirm = 'Please confirm your password'
        else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
        return e
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
        if (serverError) setServerError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) return setErrors(errs)
        setLoading(true)
        try {
            const email = await register(form.name, form.email, form.password)
            navigate('/verify-otp', { state: { email } })
        } catch (err) {
            setServerError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const getStrength = () => {
        const p = form.password
        if (!p) return null
        if (p.length < 6) return { label: 'Weak', level: 1 }
        if (p.length < 10 || !/[A-Z]/.test(p) || !/\d/.test(p)) return { label: 'Fair', level: 2 }
        if (/[^a-zA-Z0-9]/.test(p)) return { label: 'Strong', level: 4 }
        return { label: 'Good', level: 3 }
    }

    const strength = getStrength()

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
                        <h2>Create account</h2>
                        <p>Start your interview prep journey</p>
                    </div>

                    <form className='auth-form' onSubmit={handleSubmit} noValidate>
                        <div className={`auth-field ${errors.name ? 'has-error' : ''}`}>
                            <label htmlFor='name'>Full Name</label>
                            <div className='auth-input-wrap'>
                                <User size={16} className='auth-input-icon' />
                                <input
                                    id='name'
                                    type='text'
                                    name='name'
                                    placeholder='Awais Bhatti'
                                    value={form.name}
                                    onChange={handleChange}
                                    autoComplete='name'
                                />
                            </div>
                            {errors.name && <span className='auth-error'>{errors.name}</span>}
                        </div>

                        <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
                            <label htmlFor='email'>Email</label>
                            <div className='auth-input-wrap'>
                                <Mail size={16} className='auth-input-icon' />
                                <input
                                    id='email'
                                    type='email'
                                    name='email'
                                    placeholder='you@example.com'
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete='email'
                                />
                            </div>
                            {errors.email && <span className='auth-error'>{errors.email}</span>}
                        </div>

                        <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
                            <label htmlFor='password'>Password</label>
                            <div className='auth-input-wrap'>
                                <Lock size={16} className='auth-input-icon' />
                                <input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    name='password'
                                    placeholder='••••••••'
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete='new-password'
                                />
                                <button
                                    type='button'
                                    className='auth-eye'
                                    onClick={() => setShowPassword(p => !p)}
                                    aria-label='Toggle password visibility'
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {strength && (
                                <div className='password-strength'>
                                    <div className='strength-bars'>
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className={`strength-bar ${i <= strength.level ? `level-${strength.level}` : ''}`}
                                            />
                                        ))}
                                    </div>
                                    <span className={`strength-label level-${strength.level}`}>{strength.label}</span>
                                </div>
                            )}
                            {errors.password && <span className='auth-error'>{errors.password}</span>}
                        </div>

                        <div className={`auth-field ${errors.confirm ? 'has-error' : ''}`}>
                            <label htmlFor='confirm'>Confirm Password</label>
                            <div className='auth-input-wrap'>
                                <Lock size={16} className='auth-input-icon' />
                                <input
                                    id='confirm'
                                    type={showConfirm ? 'text' : 'password'}
                                    name='confirm'
                                    placeholder='••••••••'
                                    value={form.confirm}
                                    onChange={handleChange}
                                    autoComplete='new-password'
                                />
                                <button
                                    type='button'
                                    className='auth-eye'
                                    onClick={() => setShowConfirm(p => !p)}
                                    aria-label='Toggle confirm password visibility'
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirm && <span className='auth-error'>{errors.confirm}</span>}
                        </div>

                        {serverError && (
                            <div className='auth-server-error'>{serverError}</div>
                        )}

                        <button type='submit' className='auth-btn' disabled={loading}>
                            {loading ? <span className='auth-spinner' /> : <>Create Account <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <p className='auth-switch'>
                        Already have an account? <Link to='/login'>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup
