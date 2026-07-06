import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
        try {
          // Fetch latest profile state
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            setProfile(res.data.profile);
          }
        } catch (err) {
          console.error('Error fetching user profile during init:', err);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register Candidate
  const registerUser = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        
        // Fetch initialized profile
        const profileRes = await api.get('/auth/profile');
        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }
        return { success: true };
      }
    } catch (err) {
      console.error('Registration API Error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed. Try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);

        // Fetch user profile
        const profileRes = await api.get('/auth/profile');
        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }
        return { success: true };
      }
    } catch (err) {
      console.error('Login API Error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Check credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  // Sync profile details manually
  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Error syncing profile:', err);
    }
  };

  // Update Profile Data
  const updateProfileData = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setProfile(res.data.profile);
        return { success: true };
      }
    } catch (err) {
      console.error('Update Profile API Error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update profile.' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      registerUser,
      loginUser,
      logoutUser,
      fetchProfile,
      updateProfileData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
