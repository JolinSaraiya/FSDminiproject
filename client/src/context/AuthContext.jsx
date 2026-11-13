import { useEffect, useState } from 'react';
import {
  changePassword,
  getCurrentUser,
  loginUser,
  registerUser,
  updateProfile,
} from '../services/api';
import { AuthContext } from './authContext';

const TOKEN_KEY = 'stayHubToken';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return () => {
        active = false;
      };
    }

    getCurrentUser()
      .then((data) => {
        if (active) {
          setUser(data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false);
        }
      });

    function handleExpired() {
      setUser(null);
    }
    window.addEventListener('auth:expired', handleExpired);

    return () => {
      active = false;
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, []);

  async function login(email, password) {
    const data = await loginUser({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data;
  }

  async function register(name, email, password) {
    const data = await registerUser({ name, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data;
  }

  async function updateUserProfile(name) {
    const data = await updateProfile({ name });
    setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
    return data;
  }

  async function changeUserPassword(currentPassword, newPassword) {
    const data = await changePassword({ currentPassword, newPassword });
    return data;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        register,
        updateUserProfile,
        changeUserPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
