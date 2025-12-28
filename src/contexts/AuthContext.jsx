import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadStaffData(session.user.email);
        } else {
          setUser(null);
          setStaffData(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadStaffData(user.email);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffData = async (email) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      setStaffData(data);
    } catch (error) {
      console.error('Error loading staff data:', error);
      setStaffData(null);
    }
  };

  const signUp = async (email, password, staffInfo) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create staff record with email
      const { error: staffError } = await supabase
        .from('staff')
        .insert([{
          email: email,  // Store email in staff table
          name: staffInfo.name,
          phone: staffInfo.phone,
          monthly_salary: staffInfo.monthly_salary,
          salary_day: staffInfo.salary_day,
          role: staffInfo.role || 'staff'
        }]);

      if (staffError) throw staffError;

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setStaffData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = () => {
    return staffData?.role === 'admin';
  };

  const value = {
    user,
    staffData,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    supabase
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};