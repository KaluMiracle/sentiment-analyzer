import React, { createContext, useContext, useState, useEffect } from "react";
import { ReactFacebookLoginInfo } from "react-facebook-login";
import axios from "axios";
// import { User } from "@shared/schema";
interface Page {
  id: string;
  accessToken: string;
  name: string;
  photoUrl: string;
  userId: string;
  instagramId: string;
}

interface User {
  id: string;
  accessToken: string;
  name: string;
  email: string;
  photoUrl: string;
  lastLogin: Date;
  pages: Page[];
}
interface AuthContextType {
  user: User | null;
  login: (userInfo: ReactFacebookLoginInfo) => void;
  logout: () => void;
  isLoading: boolean;
  selectedPage: Page | null;
  switchPages: (page?: Page) => void;
  fetchUser: (userInfo: ReactFacebookLoginInfo) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate it
    const savedUser = JSON.parse(localStorage.getItem("user") as string);
    console.log("Token from localStorage:", savedUser);
    if (savedUser) {
      fetchUser(savedUser as ReactFacebookLoginInfo);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (userInfo: ReactFacebookLoginInfo) => {
    try {
      console.log("Fetching user with token:", userInfo.accessToken);
      const response = await fetch("http://localhost:3000/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.accessToken}`,
        },
        body: JSON.stringify({
          accessToken: userInfo.accessToken,
          userId: userInfo.userID,
          photoUrl: userInfo.picture?.data.url,
          name: userInfo.name,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        // axios.defaults.adapter.

        setUser(userData);
      } else {
        // If token is invalid, clear it
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userInfo: ReactFacebookLoginInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    fetchUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    // Force reload to clear any cached state
    window.location.href = "/login";
  };
  const switchPages = (page?: Page) => {
    if (page) {
      setSelectedPage(page);
    } else {
      setSelectedPage(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        fetchUser,
        switchPages,
        selectedPage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
