import { type ReactElement, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Avis.css";
import type { Exercice } from "../types/types";
import ExerciceCard from "./ExerciceCard";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

interface Favorite extends Exercice {}

function FavoritesCard(): ReactElement {
  const { userId, user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [status, setStatus] = useState("");
  // biome-ignore lint/correctness/useExhaustiveDependencies(user): suppress dependency user
  useEffect(() => {
    if (!userId) {
      console.log("Pas de userId détecté !");
      return;
    }

    const fetchData = async () => {
      try {
        const url = `${API_BASE_URL}/api/users/${userId}/favorites`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Erreur réseau : ${response.status}`);
        }

        const favoritesData = await response.json();

        // Vérification de sécurité avant le setFavorites
        if (Array.isArray(favoritesData)) {
          setFavorites(favoritesData);
        } else {
          console.warn(
            "Attention: L'API n'a pas renvoyé un tableau !",
            favoritesData,
          );
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        setStatus("error");
      }
    };

    fetchData();
  }, [userId, user]);

  if (!userId) return <p>Veuillez vous connecter pour voir vos favoris.</p>;
  if (status === "error") return <p>Erreur lors du chargement des favoris.</p>;

  return (
    <div className="favorites-container">
      {favorites.map((exercise) => (
        <ExerciceCard key={exercise.exerciseId} exoData={exercise} />
      ))}
    </div>
  );
}

export default FavoritesCard;
