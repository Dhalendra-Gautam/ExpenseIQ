import React from 'react'
import { sidebarStyles, cn } from "../assets/dummyStyles";
import { AnimatePresence, motion } from "framer-motion"; //for Smooth animations
import { Link, useLocation, useNavigate } from 'react-router-dom'; //link- change pages without reload, useLocation- tells current path e.g.'/income', useNavigate- change page programmatically
import { Home, ArrowUp, ArrowDown, User, HelpCircle, LogOut, Menu, X, SparklesIcon } from "lucide-react";
import { useState, useRef, useEffect } from 'react';


const MENU_ITEMS = [
    { text: "Dashboard", path: "/", icon: <Home size={20} /> },
    { text: "Income", path: "/income", icon: <ArrowUp size={20} /> },
    { text: "Expenses", path: "/expense", icon: <ArrowDown size={20} /> },
    { text: "AI Insights", path: "/ai-insights", icon: <SparklesIcon size={20} /> },
    { text: "Profile", path: "/profile", icon: <User size={20} /> },
];

const Sidebar = ({ user, isCollapsed, setIsCollapsed }) => {
    const { pathname } = useLocation(); //hook which gives the exact URL path of the current page written in the url bar in browser
    const navigate = useNavigate();
    const sidebarRef = useRef(null); //it will point to sidebar div

    const [mobileOpen, setMobileOpen] = useState(false); //check sidebar open/close in mobile view
    const [activeHover, setActiveHover] = useState(null); //to know which menu item is hovered

    const { name: username = "User", email = "user@example.com" } = user || {}; //destructuring user object. If user is null, it will take empty object and initialize default values
    const initial = username.charAt(0).toUpperCase(); //to get the first letter of the username

    //TO CHECK FOR OVERFLOW IN MOBILE
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "auto"; //document- refers to the entire html page //if sidebar is opened in mobile then background scrolling will stop"hidden"
        return () => { document.body.style.overflow = "auto" };//cleanup function, when sidebar is closed background scrolling will resume
    }, [mobileOpen]);  //this effect will run only when mobileOpen changes


    //TO CLOSE SIDEBAR ON OUTSIDE CLICK
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) { //mobileOpen-sidebar opened && sidebarRef.current-sidebar exists && !sidebarRef.current.contains(e.target)-click outside sidebar div
                setMobileOpen(false); //close sidebar
            }
        };
        document.addEventListener("mousedown", handleClickOutside); //when anywhere in the document is clicked
        return () => document.removeEventListener("mousedown", handleClickOutside); //cleanup function - to remove event listener when component vanishes
    }, [mobileOpen]); //this effect will run only when mobileOpen changes

    //TO LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    }

    const toggleSidebar = () => setIsCollapsed((c) => !c); //sidebar open/close toggle

    //A SMALL COMPONENT
    const renderMenuItem = ({ text, path, icon }) => { //each sidebar item(Dashboard, Income, Expenses, Profile) is rendered by it
        const isActive = pathname === path; //if current page path is equal to this item's path then it is active
        return (
            <motion.li key={text} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>   {/*motion.li - animated list item - key-unique identifier for each item, whileHover-slight zoom, whileTap-press effect on click*/}
                <Link
                    to={path}    //on click it should navigate to path
                    className={cn( //combining different css classes
                        sidebarStyles.menuItem.base,
                        isActive ? sidebarStyles.menuItem.active : sidebarStyles.menuItem.inactive,
                        isCollapsed ? sidebarStyles.menuItem.collapsed : sidebarStyles.menuItem.expanded
                    )}
                    onMouseEnter={() => setActiveHover(text)} //tracking which menu item is hovered
                    onMouseLeave={() => setActiveHover(null)} //tracking mouse exit from menu item
                >
                    <span className={isActive ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
                        {icon}
                    </span>
                    {!isCollapsed && (
                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}> {/*motion.span - animated span item, initial-starting state, animate - ending state, exit - exit state*/}
                            {text}
                        </motion.span>
                    )}
                    {activeHover === text && !isActive && !isCollapsed && ( //if any menu item is hovered and it is not active and sidebar is not collapsed
                        <span className={sidebarStyles.activeIndicator}></span>
                    )}
                </Link>
            </motion.li>
        );
    };

    return (
        <>
            <motion.div ref={sidebarRef} className={sidebarStyles.sidebarContainer.base} //motion.div-animated container
                initial={{ x: -100, opacity: 0 }} animate={{  //initial-starting, animate-ending sidebae slide in effect
                    x: 0, //x - -100  to 0 means it slides from left to right
                    opacity: 1, //opacity - 0 to 1 means it appears
                    width: isCollapsed ? 80 : 256,
                }} transition={{ type: "spring", damping: 25 }} //spring - type of animation, damping - how much oscillation
            >

                <div className={sidebarStyles.sidebarInner.base}>
                    <button onClick={toggleSidebar} className={sidebarStyles.toggleButton.base}>
                        <motion.div
                            initial={{ rotate: 0 }} //initially arrow pointing right
                            animate={{ rotate: isCollapsed ? 0 : 180 }} //when collapsed arrow points right, when expanded points left
                            transition={{ duration: 0.3 }} //arrow rotation duration
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" //arrow icon
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
                                    points={isCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} //changing arrow direction
                                ></polyline>
                            </svg>
                        </motion.div>
                    </button>

                    {/**USER PROFILE SECTION*/}
                    <div className={cn(
                        sidebarStyles.userProfileContainer.base,
                        isCollapsed ? sidebarStyles.userProfileContainer.collapsed
                            : sidebarStyles.userProfileContainer.expanded
                    )}>
                        <div className="flex items-center">
                            <div className={sidebarStyles.userInitials.base}>{initial}</div> {/*first letter avatar*/}
                            {!isCollapsed && ( //if sidebar not collapsed then only visible
                                <motion.div
                                    className="ml-3 overflow-hidden"
                                    initial={{ opacity: 0, x: -10 }} //initially name is invisible and shifted left
                                    animate={{ opacity: 1, x: 0 }} //when expanded name becomes visible and comes to original position
                                    exit={{ opacity: 0, x: -10 }} //when collapsed name becomes invisible and shifts left
                                >
                                    <h2 className="text-sm font-bold text-gray-800 truncate">
                                        {username}
                                    </h2>
                                    <p className="text-xs text-gray-500 truncate">{email}</p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className='flex-1 overflow-y-auto py-4 custom-scrollbar'> {/*overflow-y-auto - enables vertical scrolling when content exceeds height, custom-scrollbar - custom scrollbar style*/}
                        <ul className={sidebarStyles.menuList.base}>
                            {MENU_ITEMS.map(renderMenuItem)}
                        </ul>
                    </div>

                    <div className={cn(
                        sidebarStyles.footerContainer.base,
                        isCollapsed
                            ? sidebarStyles.footerContainer.collapsed
                            : sidebarStyles.footerContainer.expanded
                    )}
                    >
                        <Link className={cn(
                            sidebarStyles.footerLink.base,
                            isCollapsed && sidebarStyles.footerLink.collapsed
                        )}
                            to="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        >
                            <HelpCircle size={20} className="text-gray-500" />
                            {!isCollapsed && <span>Support</span>}
                        </Link>

                        <button
                            onClick={handleLogout} className={cn(
                                sidebarStyles.logoutButton.base,
                                isCollapsed && sidebarStyles.logoutButton.collapsed
                            )}
                        >
                            <LogOut size={20} className="text-gray-500" />
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/**MOBILE MENU BUTTON */}
            <motion.button
                onClick={() => setMobileOpen((prev) => !prev)}
                className={sidebarStyles.mobileMenuButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />} {/*change cross to hamburger menu icon when mobile open and vice versa*/}
            </motion.button>

            <AnimatePresence> {/*AnimatePresence - enables animation when components enters and exits*/}
                {
                    mobileOpen && ( //visible only when mobileOpen is true
                        <motion.div  //mobile overlay, half transparent screen
                            className={sidebarStyles.mobileOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className={sidebarStyles.mobileBackdrop}
                                onClick={() => setMobileOpen(false)} //close mobile menu when background is clicked
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

                            <motion.div //actual mobile sidebar which slides in from left
                                ref={sidebarRef}
                                className={sidebarStyles.mobileSidebar.base}
                                initial={{ x: "-100%" }} //from left
                                animate={{ x: 0 }} //slide to right
                                exit={{ x: "-100%" }} //slide to left
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            >

                                <div className=" relative h-full flex flex-col"> {/*relative for positioning, h-full to take full height, flex flex-col for vertical layout*/}
                                    <div className={sidebarStyles.mobileHeader}>
                                        <div className={sidebarStyles.mobileUserContainer}>
                                            <div className={sidebarStyles.userInitials.base}>
                                                {initial} {/*first letter avatar*/}
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-800 truncate">
                                                    {username}
                                                </h2>
                                                <p className="text-xs text-gray-500">{email}</p>
                                            </div>
                                        </div>
                                        <button className={sidebarStyles.mobileCloseButton}>
                                            <X size={24} className="text-gray-600" onClick={() => setMobileOpen(false)} />
                                        </button>
                                    </div>

                                    {/*same menu list in mobile view*/}
                                    <div className="flex-1 overflow-y-auto py-4"> {/*flex-1 allows this div to take remaining space, overflow-y-auto enables vertical scrolling, py-4 adds vertical padding*/}
                                        <ul className={sidebarStyles.mobileMenuList}>
                                            {MENU_ITEMS.map(({ text, path, icon }) => (
                                                <motion.li key={text} whileTap={{ scale: 0.98 }}>
                                                    <Link
                                                        to={path}
                                                        onClick={() => setMobileOpen(false)}
                                                        className={cn(
                                                            sidebarStyles.mobileMenuItem.base,
                                                            pathname === path
                                                                ? sidebarStyles.mobileMenuItem.active
                                                                : sidebarStyles.mobileMenuItem.inactive
                                                        )}
                                                    >
                                                        <span className={pathname === path ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
                                                            {icon}
                                                        </span>
                                                        <span>{text}</span>
                                                    </Link>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={sidebarStyles.mobileFooter}>
                                        <Link
                                            onClick={() => setMobileOpen(false)}
                                            to={"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
                                            className={sidebarStyles.mobileFooterLink}
                                        >
                                            <HelpCircle size={20} className="text-gray-500" />
                                            <span>Support</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className={sidebarStyles.mobileLogoutButton}
                                        >
                                            <LogOut size={20} className="text-gray-500" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </>
    );
};

export default Sidebar