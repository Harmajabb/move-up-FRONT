import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import "./ResetPassword.css";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const id = searchParams.get("userId");
  const navigate = useNavigate();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          token: token,
          newPassword: newPassword,
        }),
      });
      setMessage("Mot de passe réinitialisé avec succès.");
      setTimeout(() => {
        navigate("/pages/Connexion");
      }, 3000); // Le temps en millisecondes (ici 3 secondes)
    } catch (error) {
      setMessage(
        "Une erreur est survenue lors de la réinitialisation du mot de passe.",
      );
    }
  }
  return (
    <div className="reset-password-board">
      <div className="head-reset-password">
        <h2>Réinitialisation du mot de passe</h2>
        <p>Veuillez entrer votre nouveau mot de passe ci-dessous.</p>
      </div>
      <form className="form-resetpassword" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {message && <p>{message}</p>}
        <button type="submit">Réinitialiser le mot de passe</button>
      </form>
    </div>
  );
}

export default ResetPassword;
