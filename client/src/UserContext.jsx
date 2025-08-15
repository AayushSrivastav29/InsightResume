import { createContext, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [path, setpath] = useState("http://localhost:3000");
  return (
    <UserContext.Provider value={{ path }}>
        {children}
    </UserContext.Provider>
  );
}
