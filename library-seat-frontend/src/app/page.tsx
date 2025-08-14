'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Library Seat Booking, {user?.name}!
            </h1>
            <p className="text-gray-600 mb-6">
              You are successfully logged in. Your dashboard will be here.
            </p>
            <Button onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}>
              Logout
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Library Seat Booking System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Reserve your perfect study spot with real-time availability updates. 
            Book individual seats, group study areas, or computer stations instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => alert('Login page will be created next!')}
              className="px-8 py-4 text-lg"
            >
              Login to Book Seats
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => alert('Register page will be created next!')}
              className="px-8 py-4 text-lg"
            >
              Create Account
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center" hover>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">See seat availability instantly as other students book or free up spaces.</p>
            </Card>

            <Card className="text-center" hover>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Reserve your preferred seat type with just a few clicks. Cancel or modify anytime.</p>
            </Card>

            <Card className="text-center" hover>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m10-18v18M7 9h10m-10 4h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Options</h3>
              <p className="text-gray-600">Choose from individual study seats, group areas, quiet zones, or computer stations.</p>
            </Card>
          </div>

          <Card className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How it Works</h2>
            <div className="grid md:grid-cols-4 gap-6 text-left">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3 font-bold">1</div>
                <h4 className="font-semibold mb-2">Sign Up</h4>
                <p className="text-sm text-gray-600">Create your account with your student ID</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3 font-bold">2</div>
                <h4 className="font-semibold mb-2">Browse Seats</h4>
                <p className="text-sm text-gray-600">View available seats by floor and section</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3 font-bold">3</div>
                <h4 className="font-semibold mb-2">Book & Study</h4>
                <p className="text-sm text-gray-600">Reserve your seat and enjoy your study time</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3 font-bold">4</div>
                <h4 className="font-semibold mb-2">Manage</h4>
                <p className="text-sm text-gray-600">View your bookings and extend or cancel as needed</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}