import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bizora_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('bizora_access_token'));
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(() => {
    try {
      const stored = localStorage.getItem('bizora_selected_business');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Keep a stable ref to user so callbacks don't recreate on every user update
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Request deduplication refs
  const inFlightAuthRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Fetch businesses owned by merchant (stable reference, no circular dependency)
  const fetchUserBusinesses = useCallback(async (targetUser = null) => {
    const currentUser = targetUser || userRef.current;
    if (!currentUser || currentUser.role !== 'business_owner') {
      setBusinesses([]);
      return [];
    }
    try {
      const res = await api.get('/businesses/my');
      const list = res.data?.data?.businesses || [];
      setBusinesses(list);

      // Auto-select first business if none selected or if selected is not in list
      if (list.length > 0) {
        setSelectedBusiness((prev) => {
          const match = prev ? list.find((b) => b.id === prev.id) : null;
          const chosen = match || list[0];
          localStorage.setItem('bizora_selected_business', JSON.stringify(chosen));
          return chosen;
        });
      } else {
        setSelectedBusiness(null);
        localStorage.removeItem('bizora_selected_business');
      }
      return list;
    } catch (err) {
      console.error('Failed to load user businesses:', err);
      return [];
    }
  }, []);

  // Load current user profile strictly once on mount with in-flight deduplication
  useEffect(() => {
    if (isInitializedRef.current) return;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('bizora_access_token');
      if (!storedToken) {
        setLoading(false);
        isInitializedRef.current = true;
        return;
      }

      // If an auth check is already in-flight (e.g. React Strict Mode double invocation), reuse it
      if (inFlightAuthRef.current) {
        return inFlightAuthRef.current;
      }

      inFlightAuthRef.current = (async () => {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data?.data?.user;
          if (userData) {
            setUser(userData);
            userRef.current = userData;
            localStorage.setItem('bizora_user', JSON.stringify(userData));
            if (userData.role === 'business_owner') {
              await fetchUserBusinesses(userData);
            }
          }
        } catch (err) {
          const status = err.response?.status;
          if (status === 401) {
            // Genuine 401: Token invalid or expired
            setUser(null);
            setToken(null);
            userRef.current = null;
            setBusinesses([]);
            setSelectedBusiness(null);
            localStorage.removeItem('bizora_access_token');
            localStorage.removeItem('bizora_user');
            localStorage.removeItem('bizora_selected_business');
          } else if (status === 429) {
            // Rate limit encountered: retain stored user session, do not log user out
            console.warn('Session verification rate-limited (429). Retaining stored session.');
          } else {
            console.warn('Session verification deferred due to network/server response:', err.message);
          }
        } finally {
          setLoading(false);
          isInitializedRef.current = true;
          inFlightAuthRef.current = null;
        }
      })();

      return inFlightAuthRef.current;
    };

    initAuth();
  }, [fetchUserBusinesses]);

  // Login handler
  const login = async ({ identifier, password }) => {
    const res = await api.post('/auth/login', { identifier, password });
    const { user: loggedInUser, tokens } = res.data.data;

    setToken(tokens.accessToken);
    setUser(loggedInUser);

    localStorage.removeItem('bizora_remember_identifier');
    localStorage.setItem('bizora_access_token', tokens.accessToken);
    localStorage.setItem('bizora_user', JSON.stringify(loggedInUser));

    // Fetch businesses if merchant
    let userBusinesses = [];
    if (loggedInUser.role === 'business_owner') {
      try {
        const bRes = await api.get('/businesses/my', {
          headers: { Authorization: `Bearer ${tokens.accessToken}` }
        });
        userBusinesses = bRes.data.data.businesses || [];
        setBusinesses(userBusinesses);
        if (userBusinesses.length > 0) {
          setSelectedBusiness(userBusinesses[0]);
          localStorage.setItem('bizora_selected_business', JSON.stringify(userBusinesses[0]));
        }
      } catch (e) {
        console.error('Error fetching merchant businesses on login:', e);
      }
    }

    return { user: loggedInUser, businesses: userBusinesses };
  };

  // Customer registration handler
  const registerCustomer = async (data) => {
    const res = await api.post('/auth/register/customer', data);
    const { user: registeredUser, tokens } = res.data.data;

    setToken(tokens.accessToken);
    setUser(registeredUser);
    localStorage.setItem('bizora_access_token', tokens.accessToken);
    localStorage.setItem('bizora_user', JSON.stringify(registeredUser));

    return registeredUser;
  };

  // Merchant registration handler
  const registerMerchant = async (data) => {
    const res = await api.post('/auth/register/merchant', data);
    const { user: registeredUser, tokens } = res.data.data;

    setToken(tokens.accessToken);
    setUser(registeredUser);
    setBusinesses([]);
    setSelectedBusiness(null);
    localStorage.setItem('bizora_access_token', tokens.accessToken);
    localStorage.setItem('bizora_user', JSON.stringify(registeredUser));

    return registeredUser;
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      userRef.current = null;
      setBusinesses([]);
      setSelectedBusiness(null);
      localStorage.removeItem('bizora_access_token');
      localStorage.removeItem('bizora_user');
      localStorage.removeItem('bizora_selected_business');
      localStorage.removeItem('bizora_remember_identifier');
    }
  };

  // Switch selected business context
  const switchBusiness = (businessOrId) => {
    let target = businessOrId;
    if (typeof businessOrId === 'string') {
      target = businesses.find((b) => b.id === businessOrId) || { id: businessOrId };
    }
    setSelectedBusiness(target);
    localStorage.setItem('bizora_selected_business', JSON.stringify(target));
  };

  // Update user in context and local storage
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    userRef.current = updatedUser;
    localStorage.setItem('bizora_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    role: user?.role,
    isAuthenticated: !!user,
    isMerchant: user?.role === 'business_owner',
    isCustomer: user?.role === 'customer',
    isAdmin: user?.role === 'admin',
    businesses,
    selectedBusiness,
    switchBusiness,
    fetchUserBusinesses,
    login,
    registerCustomer,
    registerMerchant,
    logout,
    updateUser,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

