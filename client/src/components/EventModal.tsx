import { useContext, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import ExercicesContext from "../context/ExercicesContext";
import type { Exercice } from "../types/types";
import "./EventModal.css";

//fonction utilitaire
type Props = {
  isOpen: boolean; //pose la question: modale doit etre affichee ?
  onClose: () => void; // permet de fermer la modale
  editingEventId: string | null; // permet d'editer le id au lieu de creer
  initialRange: { start: Date; end: Date } | null; // plage de date pdt la creation de seance
  defaultExerciseId?: string; // ceci appelle l'exo depuis entrainementdetail et qui est optionnel pour le composant PlanningCalendar
};

//transformation en iso la date
function toInputValue(date: Date) {
  return date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

function EventModal({
  isOpen,
  onClose,
  editingEventId,
  initialRange,
  defaultExerciseId,
}: Props) {
  const ctx = useContext(ExercicesContext); //on recup le context, on connait la chanson.
  if (!ctx || !isOpen || !initialRange) return null; // si pas de provider/modale fermee/ pas de date: on rend rien,

  const { events, addEvent, updateEvent, deleteEvent } = ctx; // recup du context ce qui est utile donc les fonctions du Fullcalendar aka addEvent etc...

  const [exercises, setExercises] = useState<Exercice[]>([]); //permet de selectionner les exos via <select>
  const [isLoadingExercises, setIsLoadingExercises] = useState(true); // tant que la requete n'est pas terminee
  const [errorExercises, setErrorExercises] = useState<Error | null>(null); // stocke l'erreur grosso modo si souci API.

  //bon on connait le principe, pas besoin d'expliquer davantage.
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/exercices`,
        );
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const jsonData = await response.json();
        const list = Array.isArray(jsonData.results)
          ? jsonData.results
          : Array.isArray(jsonData)
            ? jsonData
            : [];

        setExercises(list);
      } catch (e) {
        setErrorExercises(e as Error);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercises();
  }, []);

  //permet de trouver l'event par l'id en edition.
  const editingEvent = useMemo(
    //useMemo permet d'eviter de faire la recherche a chaque fois si pas de changement
    () => events.find((evt) => evt.id === editingEventId) || null, //on cherche l'event dans events si c'est pas null sinon null si on trouve rien
    [events, editingEventId],
  );

  //si on edite une seance on selectionne l'exo deja associe sinon on prend le 1er exo de la liste
  // const [exerciseId, setExerciseId] = useState(
  //   editingEvent?.exerciseId ?? exercises[0]?.exerciseId ?? "",
  // );

  const [exerciseId, setExerciseId] = useState("");

  useEffect(() => {
    if (editingEvent) {
      // edition d'un event existant
      setExerciseId(editingEvent.exerciseId);
    } else if (defaultExerciseId) {
      //exo impose par la page entrainementdetail
      setExerciseId(defaultExerciseId);
    } else if (!exerciseId && exercises.length > 0) {
      // crea classique calendrier
      setExerciseId(exercises[0].exerciseId);
    }
  }, [editingEvent, exercises, defaultExerciseId, exerciseId]);

  //accessibilite pour sortir de la modale en utilisant escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  //si on edite on prend les dates deja enregistreesm sinon on prend les plages selectionnee dans le calendrier
  const [start, setStart] = useState(
    toInputValue(
      editingEvent ? new Date(editingEvent.start) : initialRange.start,
    ),
  );
  const [end, setEnd] = useState(
    toInputValue(editingEvent ? new Date(editingEvent.end) : initialRange.end),
  );

  //etat intermediaires, grosso modo: loading | erreur | pas exos
  // cela permet d'etre sur a 100% que cela ne crash pas et qu'on a un beau 404 error.
  if (isLoadingExercises) {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <p>Chargement des exercices...</p>
        </div>
      </div>
    );
  }

  if (errorExercises) {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <p>Erreur de chargement des exercices.</p>
        </div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <p>Aucun exercice disponible.</p>
        </div>
      </div>
    );
  }

  //creer / editer la seance
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault(); // evite le rechargement de la page

    const chosenExercise =
      exercises.find((ex) => ex.exerciseId === exerciseId) ?? exercises[0]; //permet de trouver l'exo via exerciseId sinon on prend le premier de la liste

    const payload = {
      // permet la comm avec le context pour maj ou creer la seance
      exerciseId,
      title: chosenExercise?.nom ?? "Séance",
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    };

    //si l event existe alors on edite
    if (editingEvent) {
      updateEvent(editingEvent.id, payload);
    } else {
      addEvent(payload); //sinon on cree
    }

    onClose(); // permet de fermer le modale
  };

  //allez tatabisou on supprime
  const handleDelete = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
    }
    onClose();
  };

  //rendu jsx avec nos belles semantiques et class a personnalizer avec le css
  return (
    <div
      className="modal-backdrop"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal">
        <h2 id="dialog-title">
          {editingEvent ? "Modifier une séance" : "Créer une séance"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label>
            Exercice
            <select
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              required
            >
              {exercises.map((exo) => (
                <option key={exo.exerciseId} value={exo.exerciseId}>
                  {exo.nom}
                </option>
              ))}
            </select>
          </label>

          <label>
            Début
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </label>

          <label>
            Fin
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </label>

          <div className="modal-actions">
            {editingEvent && (
              <button type="button" onClick={handleDelete}>
                Supprimer
              </button>
            )}
            <button type="button" onClick={onClose}>
              Annuler
            </button>
            <button type="submit">
              {editingEvent ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
