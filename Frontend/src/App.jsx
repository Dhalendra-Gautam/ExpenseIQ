import React from 'react';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate(); //hook or tool to navigate between pages

  const clearAuth = () => { //to remove user and token on logout from browser
    try {
      localStorage.removeItem("token"); //removes token from permanent storage of browser
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");//removes token from temporary storage of browser
      sessionStorage.removeItem("user");
    } catch (err) {
      console.error("clearAuth error:", err);
    }
    setUser(null);
    setToken(null);
  }
  const handleLogout = () => { //actual logout function
    clearAuth();
    navigate("/login");
  }
  return (
    <>
      <Routes> {/*It stores all the routes of the application  */}
        <Route element={<Layout />}>
          <Route path='/' element={<Dashboard />} /> {/*Dashboard will open inside layout */}
        </Route>
      </Routes>
    </>
  );
};

export default App;