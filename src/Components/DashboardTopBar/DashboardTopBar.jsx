import React, { useState } from 'react'
import { Bell, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './DashboardTopBar.css'

const DashboardTopBar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const userName = user?.name || 'User'

    return (
        <div className='topbar'>
            <div className='topbar-left'>
                <h2 className='topbar-welcome'>Welcome back, {userName}! 👋</h2>
                <p className='topbar-subtitle'>Let's ace your next interview with the power of AI.</p>
            </div>
            <div className='topbar-right'>
                <button className='topbar-notif' aria-label='Notifications'>
                    <Bell size={20} />
                    <span className='notif-badge'>3</span>
                </button>
                <div className='topbar-user' onClick={() => setDropdownOpen(p => !p)}>
                    <div className='topbar-avatar'>
                        <User size={18} />
                    </div>
                    <span className='topbar-username'>{userName}</span>
                    <ChevronDown size={16} className={`topbar-chevron ${dropdownOpen ? 'open' : ''}`} />

                    {dropdownOpen && (
                        <div className='topbar-dropdown'>
                            <a href='/settings'>Profile</a>
                            <a href='/settings'>Settings</a>
                            <hr />
                            <button className='logout' onClick={handleLogout}>Sign Out</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardTopBar
