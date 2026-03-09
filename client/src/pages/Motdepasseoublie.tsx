import { useState } from "react";
import "./Motdepasseoublie.css";

function MotDePasseOublie() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
          }),
        },
      );
      if (response.ok) {
        setMessage(
          "Lien de réinitialisation envoyé, veuillez vérifier votre boite mail !",
        );
      } else {
        const errorText = await response.text();
        setMessage(`Erreur lors de la réinitialisation : ${errorText}`);
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi du lien de réinitialisation :",
        error,
      );
    }
  }
  return (
    <div className="forgot-password-board">
      <div className="head-forgot-password">
        <h2>Mot de passe oublié</h2>
        <p>
          Pour réinitialiser votre mot de passe, veuillez entrer votre adresse
          email ci-dessous.
        </p>
      </div>

      <form className="form-forgotpassword" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit">Envoyer le lien de réinitialisation</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default MotDePasseOublie;
