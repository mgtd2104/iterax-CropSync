import React, { createContext, useContext } from "react";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const authState = useFirebaseAuth();

  return (
    <UserContext.Provider value={authState}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
