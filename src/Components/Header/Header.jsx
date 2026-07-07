import React from 'react'
import { BrainCircuit } from 'lucide-react'
import './Header.css'

const Header = () => {
    return (
        <div className='header'>
            <div className='header-logo'>
                <BrainCircuit size={28} className='header-icon' />
                <div className='header-text'>
                    <h1>AI Interview</h1>
                    <p>Prep Platform</p>
                </div>
            </div>
        </div>
    )
}

export default Header
