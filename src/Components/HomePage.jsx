import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const HomePage = () => {
    return (
        <div className="bg-bluegray-900 text-white min-h-screen flex flex-column align-items-center justify-content-center">
            <div className="text-center mb-5">
                <h1 className="text-5xl font-bold mb-2">WorkSphere</h1>
                <p className="text-xl text-bluegray-300">Unify. Simplify. Amplify.</p>
            </div>
            
            <div className="flex flex-column lg:flex-row align-items-center justify-content-center w-full max-w-90rem px-4">
                <Card className="bg-bluegray-800 w-full lg:w-4 mb-4 lg:mb-0 lg:mr-4">
                    <h2 className="text-2xl font-semibold mb-4">Login to Your Workspace</h2>
                    <div className="p-fluid">
                        <div className="field mb-4">
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-user" />
                                <InputText placeholder="Email" className="w-full" />
                            </span>
                        </div>
                        <div className="field mb-4">
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-lock" />
                                <InputText type="password" placeholder="Password" className="w-full" />
                            </span>
                        </div>
                        <Button label="Login" className="p-button-rounded w-full mb-3" />
                        <Button label="Sign Up" className="p-button-outlined p-button-rounded w-full" />
                    </div>
                </Card>
                
                <Divider layout="vertical" className="hidden lg:flex h-300px" />
                
                <div className="w-full lg:w-4 lg:ml-4 text-center lg:text-left">
                    <h3 className="text-2xl font-semibold mb-4">Elevate Your Productivity</h3>
                    <ul className="list-none p-0 m-0">
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>Centralized Task Management</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>AI-Powered Insights</span>
                        </li>
                        <li className="flex align-items-center mb-3">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>Seamless Team Collaboration</span>
                        </li>
                        <li className="flex align-items-center">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>Integrated Communication Hub</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <footer className="mt-6 text-bluegray-400">
                © 2024 WorkSphere. All rights reserved.
            </footer>
        </div>
    );
};

export default HomePage;