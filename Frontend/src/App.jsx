import React from 'react';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate(); //hook or tool to navigate between pages

  //TO SAVE THE TOKEN AND USERDATA IN BROWSER (so this user do not login again when page is refreshed)
  const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      if (remember) {
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj)); //if true token is saved in permanent storage of browser
        if (tokenStr) localStorage.setItem("token", tokenStr); //if true token is saved in permanent storage of browser
        sessionStorage.removeItem("user"); //removing from temporary storage so that they do not conflict
        sessionStorage.removeItem("token");
      } else {
        if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj)); //if false token is saved in temporary storage of browser
        if (tokenStr) sessionStorage.setItem("token", tokenStr);
        localStorage.removeItem("user"); //removing from permanent storage
        localStorage.removeItem("token");
      }
      setUser(userObj || null); //Updating UI immediately
      setToken(tokenStr || null);//same
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };

  const clearAuth = () => { //to remove user and token on logout from browser
    try {
      localStorage.removeItem("token"); //removes token from permanent storage of browser
      localStorage.removeItem("user");
      sessionStorage.removeItem("token"); //removes token from temporary storage of browser
      sessionStorage.removeItem("user");
    } catch (err) {
      console.error("clearAuth error:", err);
    }
    setUser(null);
    setToken(null);
  }

  const handleLogin = (userData, remember = false, tokenFromAPI = null) => {
    persistAuth(userData, tokenFromAPI, remember); // save user details and token in browser
    navigate("/"); //after login
  }

  const handleSignup = (userData, remember = false, tokenFromAPI = null) => {
    persistAuth(userData, tokenFromAPI, remember); // save user details and token in browser
    navigate("/"); //after signup navigate to the dashboard
  }

  const handleLogout = () => { //actual logout function
    clearAuth();
    navigate("/login");
  }
  return (
    <>
      <Routes> {/*It stores all the routes of the application  */}
        <Route path='/login' element={<Login onLogin={handleLogin} />} />
        <Route path='/register' element={<Signup onSignup={handleSignup} />} />

        <Route element={<Layout onLogout={handleLogout} user={user} />}>
          <Route path='/' element={<Dashboard />} /> {/*Dashboard will open inside layout */}
        </Route>
      </Routes>
    </>
  );
};

export default App;