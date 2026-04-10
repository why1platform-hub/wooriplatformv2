import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { supabase } from '../utils/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ── Supabase user helpers ──

// Load all users from Supabase
export const loadAllUsers = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*').order('id');
    if (!error && data) return data;
  } catch { /* fallback */ }
  return [];
};

// Find user by email
export const findUserByEmail = async (email) => {
  try {
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data || null;
  } catch { return null; }
};

// Helpers for other components
export const getUserById = async (id) => {
  try {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data || null;
  } catch { return null; }
};

export const getLearners = async () => {
  try {
    const { data } = await supabase.from('users').select('*').eq('role', 'learner').eq('status', 'active');
    return data || [];
  } catch { return []; }
};

export const getConsultants = async () => {
  try {
    const { data } = await supabase.from('users').select('*').eq('role', 'consultant').eq('status', 'active');
    return data || [];
  } catch { return []; }
};

// Strip password from user object before storing in state/localStorage
const stripPassword = (u) => {
  if (!u) return u;
  const { password, ...safe } = u;
  return safe;
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

    // Check user in Supabase users table
    const dbUser = await findUserByEmail(email);
    if (dbUser && dbUser.password === password) {
      if (dbUser.status === 'suspended') {
        const message = '계정이 정지되었습니다. 관리자에게 문의하세요.';
        setError(message);
        return { success: false, error: message };
      }
      const safeUser = stripPassword(dbUser);
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(safeUser));
      setUser(safeUser);
      // Update last_login
      try {
        await supabase.from('users').update({ last_login: new Date().toISOString().slice(0, 10).replace(/-/g, '.') }).eq('id', dbUser.id);
      } catch { /* ignore */ }
      return { success: true };
    }

    // Fallback to backend API
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

    // Check duplicate email in Supabase users table
    const existing = await findUserByEmail(userData.email);
    if (existing) {
      const message = '이미 등록된 이메일 주소입니다.';
      setError(message);
      return { success: false, error: message };
    }

    // Insert new user into Supabase users table
    const newUser = {
      email: userData.email,
      password: userData.password,
      name_ko: userData.name_ko,
      name_en: userData.name_en || '',
      phone: userData.phone || '',
      employee_id: userData.employee_id || '',
      role: 'learner',
      department: '',
      status: 'active',
      created_at: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    };

    try {
      const { data, error: insertError } = await supabase.from('users').insert(newUser).select().single();
      if (insertError) throw insertError;
      const safeUser = stripPassword(data);
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(safeUser));
      setUser(safeUser);
      return { success: true };
    } catch (e) {
      console.error('Registration failed:', e);
      const message = '회원가입에 실패했습니다. 다시 시도해주세요.';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
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
