import React, { useState } from 'react'
import { loginStyles } from '../assets/dummyStyles'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";

const Login = ({ onLogin, API_URL = "http://localhost:4000" }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    //TO FETCH PROFILE
    const fetchProfile = async (token) => {
        if (!token) return null;
        const res = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    };

    const persistAuth = (profile, token) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        try {
            if (token) storage.setItem("token", token); //save token in browser
            if (profile) storage.setItem("user", JSON.stringify(profile)); //save user in browser
        } catch (err) {
            console.error("Storage Error:", err);
        }
    };

    //TO LOGIN
    const handleSubmit = async (e) => {
        e.preventDefault(); //prevent page reload on form submission
        setError(""); //clear previous error
        setIsLoading(true); //set loading to true
        try {
            const res = await axios.post(
                `${API_URL}/api/user/login`,
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );
            const data = res.data || {};
            const token = data.token || null;
            //to derive user proifile
            let profile = data.user ?? null;
            if (!profile && token) {
                const copy = { ...data }; //copy of data
                delete copy.token; //remove token from copy since it is unwanted
                delete copy.user; //remove user from copy since it is unwanted

                if (Object.keys(copy).length) { //if copy has any properties
                    profile = copy; //now copy is profile
                }
            }

            if (!profile && token) {
                try {
                    profile = await fetchProfile(token);
                } catch (fetchError) {
                    console.warn("Could not fetch profile after login token:", fetchError);
                    profile = { email };
                }
            }

            if (!profile) profile = { email };
            persistAuth(profile, token);

            if (typeof onLogin === "function") { //checking whether the onLogin is function or not
                try {
                    onLogin(profile, rememberMe, token); //call
                } catch (callError) {
                    console.warn("onLogin threw: ", callError);
                    navigate("/");
                }
            } else {
                navigate("/");
            }
            setPassword(""); //after login empty the password field
        } catch (err) {
            console.error("Login error:", err?.response || err); //console prints detailed error
            const serverMg =
                err.response?.data.message || //server message extraction
                (err.response?.data ? JSON.stringify(err.response.data) : null) ||
                err.message || "Login failed";
            setError(serverMg);
        } finally { //always runs whether there is success or failure in try block
            setIsLoading(false); //loading ends
        }
    };


    return (
        <div className={loginStyles.pageContainer}>
            <div className={loginStyles.cardContainer}>
                <div className={loginStyles.header}>
                    <div className={loginStyles.avatar}>
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h1 className={loginStyles.headerTitle}>Welcome Back</h1>
                    <p className={loginStyles.headerSubtitle}>Sign in to continue</p>
                </div>

                <div className={loginStyles.formContainer}>
                    {error && ( //it will show error when error state has any value
                        <div className={loginStyles.errorContainer}>
                            <div className={loginStyles.errorIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"> {/*custom svg code for error icon*/}
                                    <path //it draws this svg exclamation ! icon
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <span className={loginStyles.errorText}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className=' mb-6'>
                            <label htmlFor='email' className={loginStyles.label} >
                                Email Address
                            </label>
                            <div className={loginStyles.inputContainer}>
                                <div className={loginStyles.inputIcon}>
                                    <Mail className=" w-5 h-5" />
                                </div>
                                <input type="email"
                                    id="email"
                                    value={email} //input value is coming from email state
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={loginStyles.input}
                                    placeholder='Enter your email'
                                    required
                                />
                            </div>
                        </div>

                        <div className=' mb-6'>
                            <label htmlFor='password' className={loginStyles.label} >
                                Password
                            </label>
                            <div className={loginStyles.inputContainer}>
                                <div className={loginStyles.inputIcon}>
                                    <Lock className=" w-5 h-5" />
                                </div>
                                <input type={showPassword ? "text" : "password"} //show password text or password
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={loginStyles.passwordInput}
                                    placeholder='••••••••'
                                    required
                                />
                                <button type="button" //button to show or hide password
                                    onClick={() => setShowPassword(!showPassword)} //toggle show or hide password
                                    className={loginStyles.passwordToggle}
                                >
                                    {showPassword ? (<EyeOff className=" w-5 h-5" />
                                    ) : (
                                        <Eye className=" w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className={loginStyles.checkboxContainer}>
                            <input type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className={loginStyles.checkbox}
                                required
                            />
                            <label htmlFor="remember" className={loginStyles.checkboxLabel}>
                                Remember me
                            </label>
                        </div>

                        <button type='submit' disabled={isLoading} className={`${loginStyles.button} ${isLoading ? loginStyles.submitBtnDisabled : ''
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className={loginStyles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <div className={loginStyles.signUpContainer}>
                        <p className={loginStyles.signUpText}>
                            Don't have an account{" "}
                            <Link to='/register' className={loginStyles.signUpLink}>
                                Create One
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login