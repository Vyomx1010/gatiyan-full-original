import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
export const UserLogout = () => {

    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    axios.get(`${import.meta.env.VITE_API_URL}/users/logout`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((response) => {
        if (response.status === 200) {
            localStorage.removeItem('token')
            navigate('/login')
        }
    })
    useEffect(() => {
        // Simulate a logout process
        const timer = setTimeout(() => {
            // Redirect or perform any action after logout
            window.location.href = '/'; // Redirect to homepage or login page
        }, 3000); // Adjust the timeout duration as needed

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-800">Logging Out...</h1>
            <p className="mt-2 text-lg text-gray-600">Please wait while we log you out.</p>
            <div className="mt-4 animate-spin h-10 w-10 border-4 border-t-4 border-gray-400 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-sm text-gray-500">This may take a few seconds.</p>
            <button 
                onClick={() => window.location.href = '/'} // Redirect to homepage or login page
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
            >
                Go to Homepage
            </button>
        </div>
    )
}

export default UserLogout
