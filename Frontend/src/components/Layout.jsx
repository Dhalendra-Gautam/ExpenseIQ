import React from 'react'
import { styles } from '../assets/dummyStyles';
import Navbar from './Navbar';

const Layout = ({ onLogout, user }) => {//the props  passed to Layout will be passed to Navbar component
    return (
        <div className={styles.layout.root}>
            <Navbar user={user} onLogout={onLogout} /> {/*calling Navbar component and passing user and onLogout as props*/}
        </div>
    )
}

export default Layout