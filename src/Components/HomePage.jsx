import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`}
    {...props}
  />
);

const HomePage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
          credentials: 'include',
        });
  
        const data = await response.json();
  
        if (response.ok) {
          navigate('/dashboard');
        } else {
          setError(data.message || 'Login failed');
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-900 mb-2">WorkSphere</h1>
          <p className="text-xl text-indigo-700">Unify. Simplify. Amplify.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login to Your Workspace</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <Input 
                  id="username" 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username" 
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Login</Button>
            </form>
            <div className="mt-4 text-center">
              <Button className="text-indigo-600 hover:text-indigo-800 bg-transparent">Sign Up</Button>
            </div>
          </div>

          <div className="w-full md:w-1/2 bg-indigo-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-6">Elevate Your Productivity</h3>
            <ul className="space-y-4">
              {[
                'Centralized Task Management',
                'AI-Powered Insights',
                'Seamless Team Collaboration',
                'Integrated Communication Hub'
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-indigo-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-indigo-600">
        © 2024 WorkSphere. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;