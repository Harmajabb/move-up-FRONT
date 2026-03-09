import { type CredentialResponse, GoogleLogin } from "@react-oauth/google";
import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../App.css";
import "./Connexion.css";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const { login } = useAuth();
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("Token Google reçu du widget :", credentialResponse); // 🔍 Debug 1

    const credential = credentialResponse.credential;

    if (!credential) {
      console.error("Token Google vide !");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ credential }), // On envoie l'objet exact
      });

      const data = await res.json(); // On lit la réponse même en cas d'erreur

      if (!res.ok) {
        console.error("Erreur Backend:", data); // 🔍 Debug 2: Voir pourquoi le backend dit 401
        throw new Error(data.error || "Échec de l'authentification backend");
      }

      console.log("Succès Backend:", data); // 🔍 Debug 3

      // Utilisation correcte du contexte (si ta fonction login attend ces arguments)
      login(data.userId, data.userFirstName);

      navigate("/pages/Dashboard");
    } catch (error) {
      console.error("Erreur Catch:", error);
      setMessage("Erreur lors de la connexion Google.");
    }
  };

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.userId, data.userFirstName);
        navigate("/pages/Dashboard");
      } else {
        const errorText = await response.text();
        setMessage(`Erreur: ${errorText}`);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setMessage("Impossible de se connecter au serveur.");
    }
  };

  return (
    <>
      <h1 className="connexion-h1">Connexion:</h1>
      <div className="connexion-board">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Mot de passe:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Link to="/pages/Inscription">Je ne suis pas inscrit</Link>
          </div>
          <div>
            <Link to="/pages/Mot-de-passe-oublie">Mot de passe oublié ?</Link>
          </div>
          <button type="submit">Se connecter</button>
          <div className="google-login-container">
            <GoogleLogin onSuccess={handleSuccess} />
          </div>
        </form>

        {message && <p>{message}</p>}
      </div>
    </>
  );
}

export default Login;
