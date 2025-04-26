import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import.meta.env.VITE_BACKEND_URL
import { IoMdEyeOff } from "react-icons/io";
import { IoMdEye } from "react-icons/io";
import { useTheme } from "../context/ThemeContext";
import {motion} from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const Login = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isLight } = useTheme() 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token,data.user);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred during login");
    }
  };

  const [eyeOpen, seteyeOpen] = useState(true)
  function handleEye(){
    seteyeOpen(!eyeOpen)
  }
  useEffect(()=>{console.log(eyeOpen)},[eyeOpen])

  return (
    <motion.div 
    className={`min-h-[calc(100vh-4.1rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isLight ? 'bg-white' : 'bg-gray-800' }`}
    variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <LogIn className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${isLight ? 'text-gray-900' : 'text-zinc-200' }`}>
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end select-none">
              <input
                type={ eyeOpen ? "password" : "text" }
                required
                className="mt-3 appearance-none rounded-none relative block w-full px-3 py-2 border z-0 border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm valid:ring-1 valid:ring-lime-500"
                placeholder="Password"
                maxLength={30}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {
                eyeOpen ? ( <IoMdEye className="absolute cursor-pointer text-[1.65rem] ml-3 mt-[18px] mr-3 z-10" onClick={handleEye}/> ) 
                :
                ( <IoMdEyeOff className="absolute cursor-pointer text-[1.65rem] mt-[18px] mr-3 z-10" onClick={handleEye}/> )
              }
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group select-none relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-90 transition ease-out"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="flex items-center justify-center mt-6">
          <a
            href={`/api/auth/google`} // or your Google handler route
            className={`flex items-center gap-2 px-4 py-2 border-[3px] rounded-md text-sm font-medium transition duration-150
              ${isLight ? 'border-gray-400 hover:bg-gray-100' : 'border-white hover:bg-zinc-700' }
              `}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
              width={30}
              alt=""
            />
            <span className={`text-[15px] font-medium ${isLight ? 'text-black' : 'text-zinc-300' }`}>
              Continue with Google
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
