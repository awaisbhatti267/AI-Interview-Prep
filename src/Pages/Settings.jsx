import React from 'react'
import SideBar from '../Components/SideBar/SideBar'
import './PageLayout.css'

const Settings = () => {
    return (
        <div className='layout'>
            <SideBar />
            <main className='main-content'>
                <div className='page-header'>
                    <h2 className='page-title'>Settings</h2>
                    <p className='page-subtitle'>Manage your account preferences and configurations</p>
                </div>
                <div className='page-body'>
                    <p>Settings content coming soon...</p>
                </div>
            </main>
        </div>
    )
}

export default Settings
