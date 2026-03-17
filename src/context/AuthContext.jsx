import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — restore user from localStorage
  useEffect(() => {
    const savedUser = authService.getSavedUser();
    if (savedUser && authService.isLoggedIn()) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setUser(res.data.user);
      // Update localStorage with fresh user data
      localStorage.setItem('hv_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res.success) {
      setUser(res.data.user);
      localStorage.setItem('hv_token', res.data.token);
      localStorage.setItem('hv_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hv_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}