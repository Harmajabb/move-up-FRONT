import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ExercicesContext from "../context/ExercicesContext";
import type {
  Exercice,
  ExercicesContextState,
  PlanningEvent,
} from "../types/types";

type ExercicesProviderProps = {
  children: React.ReactNode;
};

export const ExercicesProvider = ({ children }: ExercicesProviderProps) => {
  const [data, setData] = useState<Exercice[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [events, setEvents] = useState<PlanningEvent[]>([]);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/exercices`,
        );
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData.results);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  //pour le planning qui permet la connexion avec le back
  useEffect(() => {
    if (!userId) {
      console.warn("ID introuvable pour le planning."); //permet de chercher l'user par id
      return;
    }

    const fetchPlanning = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${userId}/planning`,
        );
        if (!res.ok) {
          console.error("get ne marche pas:", res.status);
          return;
        }
        const data = await res.json(); // requete get pour avoir { events: [...] }
        // console.log("connexion du planning from back est ok:", data);
        setEvents(data.events || []);
      } catch (err) {
        console.error("planning fetch ne marche pas:", err);
      }
    };

    fetchPlanning();
  }, [userId]); //execution de la fonction

  //envoie le planning au back
  const savePlanningToBackend = async (updatedEvents: PlanningEvent[]) => {
    if (!userId) {
      console.warn("Aucun userId, impossible de sauvegarder le planning.");
      return;
    }

    //envoyer des donnees
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/planning`,
        {
          method: "PUT", //requete put
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ events: updatedEvents }),
        },
      );

      if (!res.ok) {
        console.error("Erreur HTTP PUT planning:", res.status);
        return;
      }

      //envoie la version finale save.
      const data = await res.json();
      // console.log("Planning sauvegardé côté back, tout est ok:", data);
      setEvents(data.events || []);
    } catch (err) {
      console.error("Erreur de sauvegarde:", err);
    }
  };

  //add seance et le event contient tout sauf id
  const addEvent: ExercicesContextState["addEvent"] = (event) => {
    setEvents((prev) => {
      const newEvent: PlanningEvent = {
        ...event,
        id: crypto.randomUUID(), //car le bebe id est la, il est unique
      };
      const updated = [...prev, newEvent];
      void savePlanningToBackend(updated); // synchro back
      return updated;
    });
  };

  //maj seance, on selectionne une seance pas tout le tableau
  const updateEvent: ExercicesContextState["updateEvent"] = (id, updates) => {
    setEvents((prev) => {
      const updated = prev.map((evt) =>
        evt.id === id ? { ...evt, ...updates } : evt,
      );
      void savePlanningToBackend(updated); // synchro back
      return updated;
    });
  };

  //delete seance
  const deleteEvent: ExercicesContextState["deleteEvent"] = (id) => {
    setEvents((prev) => {
      const updated = prev.filter((evt) => evt.id !== id); // le filter renvoie un nouveau tableau et on garde toutes les seances sauf celle qui a cet id.
      void savePlanningToBackend(updated); // synchro back
      return updated;
    });
  };

  const value: ExercicesContextState = {
    data,
    isLoading,
    error,
    setData,

    //planning
    events,
    addEvent,
    updateEvent,
    deleteEvent,
  };

  return (
    <ExercicesContext.Provider value={value}>
      {children}
    </ExercicesContext.Provider>
  );
};
