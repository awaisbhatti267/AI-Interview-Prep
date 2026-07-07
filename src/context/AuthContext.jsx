import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null)
    const [loading, setLoading] = useState(true)  // checking existing session

    // On mount — restore session if token exists
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            authAPI.me()
                .then(res => setUser(res.data.user))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password })
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        return res.data.user
    }

    const register = async (name, email, password) => {
        const res = await authAPI.register({ name, email, password })
        // Returns email only — user must verify OTP before login
        return res.data.email
    }

    const verifyOtp = async (email, otp) => {
        const res = await authAPI.verifyOtp(email, otp)
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        return res.data.user
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
