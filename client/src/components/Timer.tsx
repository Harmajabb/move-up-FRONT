import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./Timer.css";

interface TimerProps {
  heures?: number;
  minutes?: number;
  secondes?: number;
  nameOfUser: number;
  exerciceId: string;
}

const Timer = ({
  heures = 0,
  minutes = 0,
  secondes = 0,
  nameOfUser: userId,
  exerciceId,
}: TimerProps) => {
  const navigate = useNavigate();

  const [pause, setPause] = useState(true);
  const [termine, setTermine] = useState(false);
  const [[h, m, s], setTemps] = useState([heures, minutes, secondes]);
  const [demarre, setDemarre] = useState(false);

  const handleExerciceComplete = useCallback(
    async (tempsFinal: number[]) => {
      const [hFinal, mFinal, sFinal] = tempsFinal;
      const tempsInitialEnSecondes = heures * 3600 + minutes * 60 + secondes;
      const tempsRestantEnSecondes = hFinal * 3600 + mFinal * 60 + sFinal;
      const dureeEcoulee = tempsInitialEnSecondes - tempsRestantEnSecondes;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/achievements/track`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: Number(userId),
              exerciseId: exerciceId,
              duration: dureeEcoulee,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Exercice complété avec succès :", data);

          if (data.newlyUnlockedBadges && data.newlyUnlockedBadges.length > 0) {
            console.log(
              "Nouveaux badges débloqués :",
              data.newlyUnlockedBadges,
            );
          }
        } else {
          console.error("Erreur lors de l'enregistrement de l'exercice.");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    },
    [heures, minutes, secondes, userId, exerciceId],
  );
  const remiseAZero = () => {
    setTemps([heures, minutes, secondes]);
    setPause(true);
    setTermine(false);
    setDemarre(false);
  };

  const handleDemarrer = () => {
    setDemarre(true);
    setPause(false);
  };

  const handlePauseReprise = () => {
    setPause(!pause);
    setDemarre(true);
  };

  const handleToggleExCounter = async (tempsFinal: number[]) => {
    const [hFinal, mFinal, sFinal] = tempsFinal;
    const tempsInitialEnSecondes = heures * 3600 + minutes * 60 + secondes;
    const tempsRestantEnSecondes = hFinal * 3600 + mFinal * 60 + sFinal;
    const dureeEcoulee = tempsInitialEnSecondes - tempsRestantEnSecondes;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/achievements/track`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exerciseId: exerciceId,
            userId: Number(userId),
            duration: dureeEcoulee,
          }),
        },
      );

      if (!response.ok) {
        console.error(
          "Echec de l'envoi de l'incrémentation du compteur de l'exercice",
        );
        return;
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
    if (termine) {
      remiseAZero();
    } else {
      setTermine(true);
      setPause(true);
    }
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (!pause && !termine) {
      timerId = setInterval(() => {
        setTemps(([ch, cm, cs]) => {
          if (ch === 0 && cm === 0 && cs === 0) {
            setTermine(true);
            return [0, 0, 0];
          }
          if (cm === 0 && cs === 0) return [ch - 1, 59, 59];
          if (cs === 0) return [ch, cm - 1, 59];
          return [ch, cm, cs - 1];
        });
      }, 1000);
    }
    if (termine) {
      handleExerciceComplete([h, m, s]);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [pause, termine, handleExerciceComplete, h, s]);

  return (
    <div className="timer-container">
      <div className="timer-display">
        {`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`}
      </div>
      <div className="timer-buttons">
        {!demarre ? (
          <button
            type="button"
            onClick={handleDemarrer}
            className="timer-btn-demarrer"
          >
            Démarrer
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePauseReprise}
            className="timer-btn-pause"
          >
            {pause ? "Reprendre" : "Pause"}
          </button>
        )}
        <button type="button" onClick={remiseAZero} className="timer-btn-reset">
          Redémarrer
        </button>
        <button
          className="timer-btn-termine"
          type="button"
          onClick={() => {
            handleToggleExCounter([h, m, s]);
            setTermine(true);
            navigate("/pages/Entrainements");
          }}
        >
          Terminer
        </button>
      </div>
    </div>
  );
};

export default Timer;
