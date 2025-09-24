// Authentication utilities for role-based access
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
};

export const isAdmin = () => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

export const isOwner = () => {
  const user = getStoredUser();
  return user?.role === 'owner';
};

export const isUser = () => {
  const user = getStoredUser();
  return user?.role === 'user';
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('authChange'));
};