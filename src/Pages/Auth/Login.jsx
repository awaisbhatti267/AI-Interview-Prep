import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrainCircuit, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState('')

    const validate = () => {
        const e = {}
        if (!form.email.trim()) e.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
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
            await login(form.email, form.password)
            navigate('/dashboard')
        } catch (err) {
            if (err.status === 403 || err.message?.toLowerCase().includes('verify')) {
                navigate('/verify-otp', { state: { email: form.email } })
                return
            }
            setServerError(err.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
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
                        <h2>Welcome back</h2>
                        <p>Sign in to continue your prep</p>
                    </div>

                    <form className='auth-form' onSubmit={handleSubmit} noValidate>
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
                            <div className='auth-label-row'>
                                <label htmlFor='password'>Password</label>
                                <Link to='/forgot-password' className='auth-forgot'>Forgot password?</Link>
                            </div>
                            <div className='auth-input-wrap'>
                                <Lock size={16} className='auth-input-icon' />
                                <input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    name='password'
                                    placeholder='••••••••'
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete='current-password'
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
                            {errors.password && <span className='auth-error'>{errors.password}</span>}
                        </div>

                        {serverError && (
                            <div className='auth-server-error'>{serverError}</div>
                        )}

                        <button type='submit' className='auth-btn' disabled={loading}>
                            {loading ? <span className='auth-spinner' /> : <>Sign In <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <p className='auth-switch'>
                        Don't have an account? <Link to='/signup'>Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
