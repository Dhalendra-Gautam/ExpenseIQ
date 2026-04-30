import React from 'react'
import { styles } from '../assets/dummyStyles';
import Navbar from './Navbar';
import Sidebar from "./Sidebar";
import { useState } from 'react';

const Layout = ({ onLogout, user }) => {//the props  passed to Layout will be passed to Navbar component
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    return (
        <div className={styles.layout.root}>
            <Navbar user={user} onLogout={onLogout} /> {/*calling Navbar component and passing user and onLogout as props*/}
            <Sidebar user={user}
                isCollapsed={sidebarCollapsed}
                setIsCollapsed={setSidebarCollapsed} />
        </div>
    )
}

export default Layout