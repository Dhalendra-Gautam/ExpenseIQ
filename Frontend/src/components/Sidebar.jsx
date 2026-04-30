import React from 'react'
import { sidebarStyles, cn } from "../assets/dummyStyles";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ArrowUp, ArrowDown, User } from "lucide-react";
import { useState, useRef, useEffect } from 'react';


const MENU_ITEMS = [
    { text: "Dashboard", path: "/", icon: <Home size={20} /> },
    { text: "Income", path: "/income", icon: <ArrowUp size={20} /> },
    { text: "Expenses", path: "/expense", icon: <ArrowDown size={20} /> },
    { text: "Profile", path: "/profile", icon: <User size={20} /> },
];

const Sidebar = ({ user, isCollapsed, setIsCollapsed }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeHover, setActiveHover] = useState(null);

    const { name: username = "User", email = "user@example.com" } = user || {};
    const initial = username.charAt(0).toUpperCase();

    //TO CHECK FOR OVERFLOW IN MOBILE
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "auto";
        return () => { document.body.style.overflow = "auto" };
    }, [mobileOpen]);

    //TO CHECK OUTSIDE SIDEBAR GET COLLAPSED
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileOpen]);

    //TO LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    }

    const toggleSidebar = () => setIsCollapsed((c) => !c);

    //A SMALL COMPONENT
    const renderMenuItem = ({ text, path, icon }) => {
        const isActive = pathname === path;
        return (
            <motion.li key={text} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                    to={path}
                    className={cn(
                        sidebarStyles.menuItem.base,
                        isActive ? sidebarStyles.menuItem.active : sidebarStyles.menuItem.inactive,
                        isCollapsed ? sidebarStyles.menuItem.collapsed : sidebarStyles.menuItem.expanded
                    )}
                    onMouseEnter={() => setActiveHover(text)}
                    onMouseLeave={() => setActiveHover(null)}
                >
                    <span className={isActive ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
                        {icon}
                    </span>
                    {!isCollapsed && (
                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            {text}
                        </motion.span>
                    )}
                    {activeHover === text && !isActive && !isCollapsed && (
                        <span className={sidebarStyles.activeIndicator}></span>
                    )}
                </Link>
            </motion.li>
        );
    };

    return (
        <>
            <motion.div ref={sidebarRef} className={sidebarStyles.sidebarContainer.base}
                initial={{ x: -100, opacity: 0 }} animate={{
                    x: 0,
                    opacity: 1,
                    width: isCollapsed ? 80 : 256,
                }} transition={{ type: "spring", damping: 25 }}>

                <div className={sidebarStyles.sidebarInner.base}>
                    <button onClick={toggleSidebar} className={sidebarStyles.toggleButton.base}>
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isCollapsed ? 0 : 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline
                                    points={isCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}
                                ></polyline>
                            </svg>
                        </motion.div>
                    </button>

                    <div className={cn(
                        sidebarStyles.userProfileContainer.base,
                        isCollapsed ? sidebarStyles.userProfileContainer.collapsed
                            : sidebarStyles.userProfileContainer.expanded
                    )}>
                        <div className="flex items-center">
                            <div className={sidebarStyles.userInitials.base}>{initial}</div>
                            {!isCollapsed && (
                                <motion.div
                                    className="ml-3 overflow-hidden"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <h2 className="text-sm font-bold text-gray-800 truncate">
                                        {username}
                                    </h2>
                                    <p className="text-xs text-gray-500 truncate">{email}</p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className='flex-1 overflow-y-auto py-4 custom-scrollbar'>
                        <ul className={sidebarStyles.menuList.base}>
                            {MENU_ITEMS.map(renderMenuItem)}
                        </ul>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

export default Sidebar