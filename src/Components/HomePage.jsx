import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-900 mb-2">WorkSphere</h1>
          <p className="text-xl text-indigo-700">Unify. Simplify. Amplify.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          <Card className="w-full md:w-1/2 p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login to Your Workspace</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input id="email" type="email" placeholder="you@example.com" className="w-full" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input id="password" type="password" placeholder="••••••••" className="w-full" />
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Login</Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" className="text-indigo-600 hover:text-indigo-800">Sign Up</Button>
            </div>
          </Card>

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