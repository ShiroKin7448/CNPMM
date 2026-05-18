import React, { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearError } from "../redux/authSlice";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);

  const clearNotification = () => {
    dispatch(clearError());
  };

  return (
    <NotificationContext.Provider value={{ error, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
