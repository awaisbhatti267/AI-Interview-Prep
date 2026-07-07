import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: '#f9fafb'
            }}>
                <div style={{
                    width: 32, height: 32,
                    border: '3px solid #ede9fe',
                    borderTop: '3px solid #7c3aed',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                }} />
            </div>
        )
    }

    return user ? children : <Navigate to='/login' replace />
}

export default ProtectedRoute
