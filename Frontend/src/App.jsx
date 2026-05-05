import React from 'react';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { useNavigate } from 'react-router-dom';
import Login from './components/Login';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate(); //hook or tool to navigate between pages

  //TO SAVE THE TOKEN 
  const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      if (remember) {
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) localStorage.setItem("token", tokenStr);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      } else {
        if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) sessionStorage.setItem("token", tokenStr);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setUser(userObj || null);
      setToken(tokenStr || null);
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
    persistAuth(userData, tokenFromAPI, remember);
    navigate("/");
  }

  const handleLogout = () => { //actual logout function
    clearAuth();
    navigate("/login");
  }
  return (
    <>
      <Routes> {/*It stores all the routes of the application  */}
        <Route path='/login' element={<Login onLogin={handleLogin} />} />

        <Route element={<Layout onLogout={handleLogout} />}>
          <Route path='/' element={<Dashboard />} /> {/*Dashboard will open inside layout */}
        </Route>
      </Routes>
    </>
  );
};

export default App;