import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
import type { User } from "../types/types";
import "./AuthContext.css";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  userId: string | null;
  userFirstName: string | null;
  login: (userId: string, userFirstName: string | null) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userFirstName, setuserFirstName] = useState<string | null>(null);
  useEffect(() => {
    const fetchUtilisateur = async () => {
      try {
        const reponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/getme`, {
          credentials: "include",
        });
        if (!reponse.ok) {
          console.error("Erreur HTTP:", reponse.status, reponse.statusText);
          throw new Error("La requête pour l'utilisateur a échoué");
        }
        const data: User = await reponse.json();
        setUser(data);
        setIsAuthenticated(true);
        setUserId(data.id);
        setuserFirstName(data.firstname);
      } catch (erreur) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur:",
          erreur,
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchUtilisateur();
  }, []);

  const login = (userId: string, userFirstName: string | null) => {
    setIsAuthenticated(true);
    setUserId(userId);
    setuserFirstName(userFirstName);
  };

  const logout = async () => {
    try {
      const reponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!reponse.ok) {
        console.error("Erreur HTTP:", reponse.status, reponse.statusText);
        throw new Error("La deconnexion de l'utilisateur a échoué");
      }
    } catch (erreur) {
      console.error("Erreur lors de la déconnexion de l'utilisateur:", erreur);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setUserId(null);
      setuserFirstName(null);
      navigate("/");
    }
  };

  const value = {
    isAuthenticated,
    user,
    setUser,
    userId,
    userFirstName,
    login,
    logout,
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p>Chargement de la session...</p>
      </div>
    );
  }

  // 🚀 SUCCÈS : Si on ne charge plus, on affiche l'application normalement.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider",
    );
  }
  return context;
}
