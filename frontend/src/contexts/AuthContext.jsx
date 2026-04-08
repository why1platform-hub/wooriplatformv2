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

// All accounts in the system (exported for data consistency)
export const ALL_USERS = {
  'admin@woori.com': {
    id: 1, email: 'admin@woori.com', name_ko: '관리자', name_en: 'Admin',
    role: 'admin', department: '시스템관리팀',
  },
  'instructor1@woori.com': {
    id: 2, email: 'instructor1@woori.com', name_ko: '박지영', name_en: 'Park Jiyoung',
    role: 'consultant', department: '전직지원팀',
  },
  'instructor2@woori.com': {
    id: 3, email: 'instructor2@woori.com', name_ko: '이민호', name_en: 'Lee Minho',
    role: 'consultant', department: '전직지원팀',
  },
  'user1@woori.com': {
    id: 4, email: 'user1@woori.com', name_ko: '홍길동', name_en: 'Hong Gildong',
    role: 'learner', department: '금융컨설팅팀', retirement_date: '2026-01-15',
    skills: ['자산관리', '투자상담', '고객관리'],
  },
  'user2@woori.com': {
    id: 5, email: 'user2@woori.com', name_ko: '김영희', name_en: 'Kim Younghee',
    role: 'learner', department: '부동산팀', retirement_date: '2026-03-01',
    skills: ['부동산분석', '고객상담'],
  },
  'user3@woori.com': {
    id: 6, email: 'user3@woori.com', name_ko: '이철수', name_en: 'Lee Cheolsu',
    role: 'learner', department: '자산관리팀', retirement_date: '2026-06-30',
    skills: ['자산운용', '리스크관리'],
  },
};

export const getUserById = (id) => Object.values(ALL_USERS).find((u) => u.id === id) || null;
export const getLearners = () => Object.values(ALL_USERS).filter((u) => u.role === 'learner');
export const getConsultants = () => Object.values(ALL_USERS).filter((u) => u.role === 'consultant');

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
        } catch {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed && parsed.email) {
              setUser(parsed);
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);

    // Demo account login
    if (password === 'demo1234' && ALL_USERS[email]) {
      const mockUser = ALL_USERS[email];
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    }

    // Check registered demo users
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const registeredUser = registeredUsers.find((u) => u.email === email && u.password === password);
    if (registeredUser) {
      const { password: _, ...userWithoutPassword } = registeredUser;
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
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
      const message = err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);

    // Client-side validation
    if (!userData.email || !userData.password || !userData.name_ko) {
      const message = '필수 항목을 모두 입력해주세요. (이름, 이메일, 비밀번호)';
      setError(message);
      return { success: false, error: message };
    }
    if (userData.password.length < 8) {
      const message = '비밀번호는 최소 8자 이상이어야 합니다.';
      setError(message);
      return { success: false, error: message };
    }
    // Check duplicate email among demo accounts
    if (ALL_USERS[userData.email]) {
      const message = '이미 등록된 이메일 주소입니다.';
      setError(message);
      return { success: false, error: message };
    }
    // Check duplicate in previously registered demo users
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    if (registeredUsers.some((u) => u.email === userData.email)) {
      const message = '이미 등록된 이메일 주소입니다.';
      setError(message);
      return { success: false, error: message };
    }

    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch {
      // Backend unavailable — demo registration fallback
      try {
        const newUser = {
          id: Date.now(),
          email: userData.email,
          name_ko: userData.name_ko,
          name_en: userData.name_en || '',
          phone: userData.phone || '',
          employee_id: userData.employee_id || '',
          role: 'learner',
          department: '',
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        // Save to registered users list for persistence
        registeredUsers.push({ ...newUser, password: userData.password });
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return { success: true };
      } catch (fallbackErr) {
        const message = '회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
        setError(message);
        return { success: false, error: message };
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    // Only clear auth tokens — keep all app data (bookings, notes, banners, etc.)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
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
    if (user.role === 'admin') return true;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  }, [user]);

  const isAdmin = useCallback(() => user?.role === 'admin', [user]);
  const isSuperAdmin = useCallback(() => user?.role === 'admin', [user]);
  const isConsultant = useCallback(() => user?.role === 'consultant' || user?.role === 'admin', [user]);
  const isHRManager = useCallback(() => user?.role === 'hr_manager' || user?.role === 'admin', [user]);

  const value = {
    user, loading, error,
    isAuthenticated: !!user,
    login, register, logout, updateProfile, changePassword,
    hasRole, isAdmin, isSuperAdmin, isConsultant, isHRManager,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
