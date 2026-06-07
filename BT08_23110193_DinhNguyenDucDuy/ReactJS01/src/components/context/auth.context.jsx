import { createContext, useState, useContext } from "react";

// Tạo Context
const AuthContext = createContext(null);

// Initial state
const defaultAuth = {
  isAuthenticated: false,
  user: {
    id: "",
    name: "",
    email: "",
    role: "",
  },
};

// Provider Component
export const AuthWrapper = ({ children }) => {
  const [auth, setAuth] = useState(defaultAuth);
  const [appLoading, setAppLoading] = useState(true);

  return (
    <AuthContext.Provider value={{ auth, setAuth, appLoading, setAppLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để dùng Auth Context dễ hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthWrapper");
  }
  return context;
};

export default AuthContext;
