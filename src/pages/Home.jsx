import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Staff from '../pages/Staff';
import StaffManage from '../pages/StaffManage';

const AppContent = () => {
  const { user, staffData, loading, signOut, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !staffData) {
    return <Login />;
  }

  return (
    <div>
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={signOut}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Render based on role */}
      {isAdmin() ? <StaffManage /> : <Staff />}
    </div>
  );
};

function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default Home;