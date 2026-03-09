import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router";
// import { Link } from "react-router";
import { Navigate } from "react-router";
import EventModal from "../components/EventModal";
import { useAuth } from "../context/AuthContext";
import ExercicesContext from "../context/ExercicesContext";
import type { Exercice } from "../types/types";

import etoilePleine from "../assets/etoile-pleine.png";
import etoileVide from "../assets/etoile-vide.png";
import muscleLogo from "../assets/images/entrainementDetail_picto_niveau.png";
import chronometre from "../assets/images/entrainementdetail_time.png";

import "./EntrainementDetail.css";
import Timer from "../components/Timer";

function EntrainementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(ExercicesContext);

  const { user, userId, setUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/pages/Connexion" replace />;
  }

  if (!context) {
    return <p>Erreur : contexte non disponible</p>;
  }

  const { data } = context;

  if (!data) {
    return <p>Aucune donnée disponible</p>;
  }

  const exercice = data.find((exo: Exercice) => exo.id === Number(id));

  if (!exercice) {
    return <p>Exercice non trouvé</p>;
  }

  const parseDuree = (duree: string) => {
    const match = duree.match(/(\d+)/);
    if (match) {
      const valeur = Number.parseInt(match[1]);
      if (duree.toLocaleLowerCase().includes("min")) {
        return { minutes: valeur, secondes: 0 };
      }
      return { minutes: 0, secondes: valeur };
    }
    return { minutes: 1, secondes: 0 };
  };

  const { minutes, secondes } = parseDuree(exercice.duree);
  const isFavorite =
    user?.favoriteExercices?.includes(String(exercice.exerciseId)) || false;

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/${userId}/favorites`,
        {
          method: "PATCH",
          headers: {
            "content-Type": "application/json",
          },
          body: JSON.stringify({
            exerciseId: exercice.exerciseId,
          }),
        },
      );

      if (!response.ok) {
        console.error("Échec de la mise à jour du favori");
        return;
      }

      const updateUser = await response.json();
      setUser(updateUser);
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  const getDifficultyLevel = (difficulte: string) => {
    switch (difficulte.toLowerCase()) {
      case "débutant":
        return 1;
      case "facile":
        return 2;
      case "intermédiaire":
        return 3;
      case "difficile":
        return 4;
    }
  };

  const difficultyLevel = getDifficultyLevel(exercice.difficulte);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialRange] = useState(() => {
    const start = new Date();
    const end = new Date(start.getTime());
    return { start, end };
  });

  return (
    <div className="entrainement-detail-container">
      <button
        type="button"
        className="entrainement-detail-back-btn"
        onClick={() => navigate(-1)}
      >
        ← Retour
      </button>
      <section className="entrainement-detail-section-title">
        <h1 className="entrainement-detail-title">{exercice.nom}</h1>
        <button
          type="button"
          className="entrainement-detail-favoris-btn"
          onClick={handleToggleFavorite}
        >
          <img
            src={isFavorite ? etoilePleine : etoileVide}
            alt="étoile favoris"
            className="entrainement-detail-favoris-icon"
          />
        </button>
      </section>
      <section className="entrainement-detail-card">
        <div className="entrainement-detail-informations">
          <div className="entrainement-detail-difficulte">
            <div className="entrainement-detail-difficulte-detail">
              <h2 className="entrainement-detail-label">Difficulté :</h2>
              <p className="entrainement-detail-value">{exercice.difficulte}</p>
            </div>
            <div className="difficulty-icons">
              {Array(difficultyLevel)
                .fill(null)
                .map((_, index) => (
                  <img
                    key={`muscle-${exercice.id}-${index}`}
                    src={muscleLogo}
                    alt="muscle"
                    className="muscle-icon"
                  />
                ))}
            </div>
          </div>
          <div className="entrainement-detail-muscle">
            <h2 className="entrainement-detail-label">Muscle ciblé :</h2>
            <p className="entrainement-detail-value">{exercice.muscleCible}</p>
          </div>
          <div className="entrainement-detail-equipement">
            <h2 className="entrainement-detail-label">Matériel :</h2>
            <p className="entrainement-detail-value">{exercice.equipement}</p>
          </div>
        </div>
        <div className="entrainement-detail-action">
          <img
            src={exercice.gifUrl}
            alt={exercice.nom}
            className="entrainement-detail-gif"
          />
          <div className="entrainement-detail-duration">
            <img
              src={chronometre}
              alt="durée de l'exercice"
              className="entrainement-detail-chrono"
            />
            <p className="entrainement-detail-duration">{exercice.duree}</p>
          </div>
          <Timer
            heures={0}
            minutes={minutes}
            secondes={secondes}
            nameOfUser={Number(userId) || 0}
            exerciceId={exercice.exerciseId || exercice.id?.toString() || "1"}
          />
        </div>
        <div className="entrainement-detail-instructions">
          <h2 className="ed-title-instructions">Instructions :</h2>
          <p className="entrainement-detail-description">
            {exercice.instructions[0]}
            <br />
            {exercice.instructions[1]}
            <br />
            {exercice.instructions[2]}
            <br />
            {exercice.instructions[3]}
            <br />
            {exercice.instructions[4]}
            <br />
            {exercice.instructions[5]}
            <br />
          </p>
        </div>
        <div className="entrainement-detail-btn">
          {/* <Link to="/pages/Planning"> */}
          <button
            type="button"
            className="entrainement-detail-btn-action"
            onClick={() => setIsModalOpen(true)}
          >
            Ajouter à mon planning
          </button>
          {/* </Link> */}
        </div>
        {isModalOpen && (
          <EventModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            editingEventId={null}
            initialRange={initialRange}
            defaultExerciseId={exercice.exerciseId}
          />
        )}
      </section>
    </div>
  );
}
export default EntrainementDetail;
