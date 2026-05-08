import React from 'react';
import { useState, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from './components/Login';
import Signup from './components/Signup';
import axios from 'axios';


const API_URL = "http://localhost:4000"

//TO GET TRANSACTIONS FROM LOCAL STORAGE
const getTransactionsFromStorage = () => {
  const saved = localStorage.getItem("transactions");
  return saved ? JSON.parse(saved) : [];
};

//TO PROTECT THE ROUTES SO IF USER IS NOT LOGGED IN THEN IT WILL NOT BE ABLE TO ACCESS THE ROUTES
const ProtectedRoute = ({ user, children }) => {
  const localToken = localStorage.getItem("token")
  const sessionToken = localStorage.getItem("token");
  const hasToken = localToken || sessionToken;

  if (!user && !hasToken) {
    return <Navigate to="/login" replace />
  }
  return children;
}

//TO SCROLL TO TOP WHEN PAGE GETS RELOADED OR NEW PAGE IS VISITED
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]); //this will run when the path((the URL) changes
  return null;
}

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  //TO UPDATE THE USER DATA WITH IN STATE AND STORAGE
  const updateUserData = (updatedUser) => {
    setUser(updatedUser);

    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    if (localToken) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else if (sessionToken) {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }

  //TRY TO LOAD USER WITH TOKEN WHEN MOUNTED
  useEffect(() => {
    (async () => {
      try {
        const localUserRaw = localStorage.getItem("user");
        const localToken = localStorage.getItem("token");
        const sessionUserRaw = sessionStorage.getItem("user");
        const sessionToken = sessionStorage.getItem("token");

        const storedToken = localToken || sessionToken;
        const storedUser = localUserRaw ? JSON.parse(localUserRaw) : (sessionUserRaw ? JSON.parse(sessionUserRaw) : null);

        if (storedToken) {
          setUser(storedUser);
          setToken(storedToken);
          setIsLoading(false); //finally stop loading
          return;
        }

        if (storedToken) { //if no token found in browser
          try {
            const res = await axios.get(`${API_URL}/api/users/me`, {
              headers: { Authorization: `Bearer ${storedToken}` } //sending the token to the backend
            });
            const profile = res.data;
            persistAuth(profile, storedToken, tokenFromLocal);
          }
          catch (fetchErr) {
            console.warn("Could not fetch profile with the stored token", fetchErr);
            clearAuth();
          }
        }
      }
      catch (err) {
        console.error("Error bootstraping auth:", err);
      } finally {
        setIsLoading(false);
        try {
          setTransactions(getTransactionsFromStorage());
        } catch (txErr) {
          console.error("Error loading transactions:", txErr);
        }
      }
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (err) {
      console.error("Error saving transactions:", err);
    }
  }, [transactions]);

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

  // TRANSACTION HELPERS
  const addTransaction = (newTransaction) =>
    setTransactions((p) => [newTransaction, ...p]); //adding new transaction to the beginning of the array
  const editTransaction = (id, updatedTransaction) =>
    setTransactions((p) =>
      p.map((t) => (t.id === id ? { ...updatedTransaction, id } : t)), // loop all transactions and if id matches then update it else return the old transaction
    );
  const deleteTransaction = (id) =>
    setTransactions((p) => p.filter((t) => t.id !== id)); //filter function return all transaction except the one with the id that matches
  const refreshTransactions = () =>
    setTransactions(getTransactionsFromStorage());


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <ScrollToTop />

      <Routes> {/*It stores all the routes of the application  */}
        <Route path='/login' element={<Login onLogin={handleLogin} />} />
        <Route path='/register' element={<Signup onSignup={handleSignup} />} />



        <Route element={
          <ProtectedRoute user={user}>
            <Layout onLogout={handleLogout}
              user={user}
              addTransaction={addTransaction}
              editTransaction={editTransaction}
              deleteTransaction={deleteTransaction}
              refreshTransactions={refreshTransactions}
            />
          </ProtectedRoute>
        }
        >

          <Route path='/' element={<Dashboard />}
            transactions={transactions}
            addTransaction={addTransaction}
            editTransaction={editTransaction}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions} /> {/*Dashboard will open inside layout */}
        </Route>
      </Routes>
    </>
  );
};

export default App;