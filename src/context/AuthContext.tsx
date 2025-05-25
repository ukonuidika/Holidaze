import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import type { ReactNode } from "react";

interface User {
  name: string;
  email: string;
  avatar: {
    url: string;
  };
  banner: {
    url: string;
  };
  venueManager: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = () => {
      try {
        let token = localStorage.getItem("accessToken");
        let userData = localStorage.getItem("userData");

        if (!token) {
          token = sessionStorage.getItem("accessToken");
          userData = sessionStorage.getItem("userData");
        }

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setAccessToken(token);
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("userData");
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);

    const userDataToStore = JSON.stringify(userData);

    const rememberMe = sessionStorage.getItem("rememberMe") === "true";

    if (rememberMe) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userData", userDataToStore);
    } else {
      sessionStorage.setItem("accessToken", token);
      sessionStorage.setItem("userData", userDataToStore);
    }

    sessionStorage.removeItem("rememberMe");
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("venueManager");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("venueManager");
  };

  const isAuthenticated = !!user && !!accessToken;

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      login,
      logout,
      loading,
      setUser,
    }),
    [user, accessToken, isAuthenticated, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
