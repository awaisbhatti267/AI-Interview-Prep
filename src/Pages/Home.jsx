import React from 'react'
import SideBar from '../Components/SideBar/SideBar'
import './PageLayout.css'

const Home = () => {
    return (
        <div className='layout'>
            <SideBar />
            <main className='main-content'>
                <div className='page-header'>
                    <h2 className='page-title'>Home</h2>
                    <p className='page-subtitle'>Welcome to your AI Interview Preparation Platform</p>
                </div>
                <div className='page-body'>
                    <p>Home content coming soon...</p>
                </div>
            </main>
        </div>
    )
}

export default Home
