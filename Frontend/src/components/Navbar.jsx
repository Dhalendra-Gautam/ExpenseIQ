import React, { useEffect, useRef, useState } from 'react';
import { navbarStyles } from '../assets/dummyStyles';
import img1 from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { User } from 'lucide-react';
import { LogOut } from 'lucide-react';
import axios from 'axios'; //for making api call to backend server

const BASE_URL = "http://localhost:8000/api"

const Navbar = ({ user: propUser, onLogout }) => {//renaming user prop(now named as propUser) to avoid confusion
    const navigate = useNavigate();//hook to navigate between pages
    const menuRef = useRef();//useRef is a hook which when written in an element then  it points(stores its reference) to that element, now we can use it to control element
    const [menuOpen, setMenuOpen] = useState(false);

    const user = propUser || { //if in propUser nothing comes then define default empty user 
        name: "",
        email: ""
    };

    //To FETCH USER DATA FROM SERVER
    useEffect(() => {
        const fetchUserData = async () => { //this function takes out the data of logged-in user
            try {
                const token = localStorage.getItem("token");//retriving saved token from broweser
                if (!token) return;
                const response = await axios.get(`${BASE_URL}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const userData = response.data.user || response.data;
                setUser(userData);
            } catch (error) {
                console.error("failed to load profile", error);
            }
        }
        if (!propUser) { //if no user data came from parent then call
            fetchUserData(); //this function
        }
    }, [propUser]);

    const toggleMenu = () => setMenuOpen((prev) => !prev);//function to toggle the menu on and off, (prev) => !prev means if previs false then make it true and viceversa

    const handleLogout = () => {
        setMenuOpen(false); //close dropdown
        localStorage.removeItem("token");
        onLogout?.(); //onlogout function call
        navigate("/login");
    }

    //CLOSING THE DROPDOWN MENU WHEN USER CLICKS OUTSIDE OF IT
    useEffect(() => {
        const handleClickOutside = (e) => { //e => event(where user clicked)
            if (menuRef.current && !menuRef.current.contains(e.target)) { //checks if click is outside the div which menuRef points if yes then close dropdown
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside); //listen to every click when dropdown is open
        return () => document.removeEventListener("mousedown", handleClickOutside);//remove event listner after dropdown is closed
    }, []);

    return (
        <header className={navbarStyles.header}>
            <div className={navbarStyles.container}>
                {/*logo*/}
                <div onClick={() => navigate("/")}
                    className={navbarStyles.logoContainer}>
                    <img src={img1} alt="logo" className={navbarStyles.logoImage} />
                </div>
                {/*If user is present */}
                {user && ( //if user is present then show user container
                    <div className={navbarStyles.userContainer} ref={menuRef}> {/*now menuRef points to this div we can use it to close menu when user click outside div, or when we click this div we can toggle the menu */}
                        <button onClick={toggleMenu} className={navbarStyles.userButton}>
                            <div className=" relative">
                                <div className={navbarStyles.userAvatar}>
                                    {user?.name?.[0]?.toUpperCase() || "U"} {/*take first character of user's name and convert it to uppercase, or use "U" if name is not present*/}
                                </div>
                                <div className={navbarStyles.statusIndicator}></div> {/*green dot indicating user is online */}
                            </div>
                            <div className={navbarStyles.userTextContainer}>
                                <p className={navbarStyles.userName}>{user?.name || "User"}</p>
                                <p className={navbarStyles.userEmail}>{user?.email || "user@expernseIQ.com"}</p>
                            </div>
                            <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
                        </button>

                        {/* dropdown menu */}
                        {menuOpen && (
                            <div className={navbarStyles.dropdownMenu}>
                                <div className={navbarStyles.dropdownHeader}>
                                    <div className="flex items-center gap-3">
                                        <div className={navbarStyles.dropdownAvatar}>
                                            {user?.name?.[0]?.toUpperCase() || "U"}
                                        </div>

                                        <div>
                                            <div className={navbarStyles.dropdownName}>
                                                {user?.name || "User"}
                                            </div>

                                            <div className={navbarStyles.dropdownEmail}>
                                                {user?.email || "user@expernseIQ.com"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={navbarStyles.menuItemContainer}>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate("/profile");
                                        }} className={navbarStyles.menuItem}
                                    >
                                        <User className="w-4 h-4" />
                                        <span>My Profile</span>
                                    </button>
                                </div>

                                <div className={navbarStyles.menuItemBorder}>
                                    <button
                                        onClick={handleLogout}
                                        className={navbarStyles.logoutButton}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </header>
    )
}

export default Navbar;