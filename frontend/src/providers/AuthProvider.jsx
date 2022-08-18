import React, { useState } from "react";
import AuthContext from "../contexts/AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const storeUser = (newUser) => {
    setUser(newUser);
  };

  const clearUser = () => {
    setUser(null);
  };

  const value = { user, storeUser, clearUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;