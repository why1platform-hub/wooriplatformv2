import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (err) {
          // If API fails, try to use saved user for demo
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed && parsed.email) {
              setUser(parsed);
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Mock user accounts for demo
  const mockUsers = {
    'admin@woori.com': {
      id: 1,
      email: 'admin@woori.com',
      name_ko: '최고관리자',
      name_en: 'Super Admin',
      role: 'admin',
      department: '시스템관리팀',
    },
    'instructor@woori.com': {
      id: 2,
      email: 'instructor@woori.com',
      name_ko: '김강사',
      name_en: 'Kim Instructor',
      role: 'instructor',
      department: '교육팀',
    },
    'demo@woori.com': {
      id: 3,
      email: 'demo@woori.com',
      name_ko: '홍길동',
      name_en: 'Hong Gildong',
      role: 'learner',
      department: '금융컨설팅팀',
      retirement_date: '2024-01-15',
      skills: ['자산관리', '투자상담', '고객관리'],
    },
  };

  const login = useCallback(async (email, password) => {
    setError(null);

    // Check for mock/demo login (password: demo1234)
    if (password === 'demo1234' && mockUsers[email]) {
      const mockUser = mockUsers[email];
      const mockToken = 'mock-jwt-token-' + Date.now();

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);

      return { success: true };
    }

    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || '로그인에 실패했습니다. 데모 계정을 사용해주세요.';
      setError(message);
      return { success: false, error: message };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    setError(null);
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setError(null);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Password change failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (typeof roles === 'string') {
      // admin (superadmin) has access to everything
      if (user.role === 'admin') return true;
      return user.role === roles;
    }
    if (user.role === 'admin') return true;
    return roles.includes(user.role);
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  const isSuperAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  const isInstructor = useCallback(() => {
    return user?.role === 'instructor' || user?.role === 'admin';
  }, [user]);

  const isHRManager = useCallback(() => {
    return user?.role === 'hr_manager' || user?.role === 'admin';
  }, [user]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isInstructor,
    isHRManager,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
