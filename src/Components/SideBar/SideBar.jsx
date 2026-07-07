import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Mic, History, BarChart2, BookOpen, Bookmark, Settings, Menu, X } from 'lucide-react'
import Header from '../Header/Header'
import './SideBar.css'

const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/resume', label: 'Resume', icon: <FileText size={18} /> },
    { to: '/practice_interview', label: 'Practice Interview', icon: <Mic size={18} /> },
    { to: '/history', label: 'History', icon: <History size={18} /> },
    { to: '/performance', label: 'Performance', icon: <BarChart2 size={18} /> },
    { to: '/weak_topics', label: 'Weak Topics', icon: <BookOpen size={18} /> },
    { to: '/bookmarks', label: 'Bookmarks', icon: <Bookmark size={18} /> },
]

const SideBar = () => {
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(false)

    const toggleSidebar = () => setIsOpen(prev => !prev)
    const closeSidebar = () => setIsOpen(false)

    return (
        <>
            {/* ── Mobile top navbar (always visible) ── */}
            <div className='mobile-navbar'>
                <button className='sidebar-toggle' onClick={toggleSidebar} aria-label='Toggle sidebar'>
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
                <Header />
            </div>

            {/* ── Overlay ── */}
            {isOpen && <div className='sidebar-overlay' onClick={closeSidebar} />}

            {/* ── Sidebar ── */}
            <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                {/* Header inside sidebar — visible on desktop */}
                <div className='sidebar-header-wrap'>
                    <Header />
                </div>

                <nav className='sidebar-nav'>
                    {navLinks.map(({ to, label, icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            <span className='sidebar-link-icon'>{icon}</span>
                            <span className='sidebar-link-label'>{label}</span>
                        </Link>
                    ))}
                </nav>

                <div className='sidebar-footer'>
                    <Link
                        to='/settings'
                        className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <span className='sidebar-link-icon'><Settings size={18} /></span>
                        <span className='sidebar-link-label'>Settings</span>
                    </Link>
                </div>
            </aside>
        </>
    )
}

export default SideBar
