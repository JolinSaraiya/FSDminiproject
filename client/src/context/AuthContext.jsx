import { useEffect, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/api';
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

    return () => {
      active = false;
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

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
