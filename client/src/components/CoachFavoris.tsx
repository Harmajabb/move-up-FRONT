import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
// import CoachCard from "./CoachCard";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

function CoachFavoris() {
  const [favoritesCoach, setFavoritesCoach] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  console.log("affiche isLoading: ", isLoading);
  console.log("affiche error: ", error);

  useEffect(() => {
    async function fetchFavoriteCoach() {
      try {
        const { userId } = useAuth();
        const responseUser = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        if (!responseUser.ok) {
          throw new Error(`Erreur HTTP: ${responseUser.status}`);
        }
        const user = await responseUser.json();
        setFavoritesCoach(user.favoriteCoach);
        console.log("fetch des favoriteCoach: ", user.favoriteCoach);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFavoriteCoach();
  }, []);

  // useEffect(() => {
  //   async function fetchUser() {
  //     const { userId } = useAuth();
  //     const responseUser = await fetch(`${API_BASE_URL}/api/users/${userId}`);
  //     const user = await responseUser.json();
  //     setFavoritesCoach(user.favoriteCoach); // Le tableau des coachs favoris de l'user est dans "favoriteCoach" en tant de string ['1','5']
  //   }
  // fetchUser();
  // }, []);

  const [listCoach, setListCoach] = useState([]);

  useEffect(() => {
    async function fetchCoachs() {
      try {
        const responseCoachs = await fetch(`${API_BASE_URL}/api/coach`);
        if (!responseCoachs.ok) {
          throw new Error(`Erreur HTTP: ${responseCoachs.status}`);
        }
        const coachs = await responseCoachs.json();
        setListCoach(coachs); // les objects de coach.json sont dans "listeCoach" sous forme d'objet {id:1, lastname: 'Dupont', firstname: 'Marine'}
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCoachs();
  }, []);
  console.log("voici les Coachs :", favoritesCoach);
  const searchAllFavoriteCoach = favoritesCoach
    .map((element) => listCoach.find((e) => e === element))
    .filter(Boolean); // Mets dans sear... les objects correspondant aux coachs favoris
  console.log("voici les Coachs selectionnés: ", searchAllFavoriteCoach);
  return (
    <div>
      <h3>Coach Favoris</h3>
      {favoritesCoach === undefined ? (
        <p>Vous n'avez pas encore de Coach dans vos favoris</p>
      ) : (
        searchAllFavoriteCoach.map(
          (coach) => coach,
          // <CoachCard key={coach.id} {...coach} />
        )
      )}
    </div>
  );
}

export default CoachFavoris;
