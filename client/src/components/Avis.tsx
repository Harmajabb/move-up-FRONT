import { type ReactElement, useEffect, useMemo, useState } from "react";
import starIcon from "../assets/images/star.svg";
import "./Avis.css";

// --- CONSTANTES & TYPES ---
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

interface Review {
  id: number;
  userId: number;
  title: string;
  rating: number;
  comment: string;
}

interface Author {
  id: number;
  firstname: string;
  age: number;
  photoUrl: string;
}

// Type fusionné pour faciliter le rendu
interface ReviewWithAuthor extends Review {
  author?: Author;
}

// --- COMPOSANT STARS (Optimisé) ---
// Mémorisé pour éviter les re-rendus inutiles si le parent change sans changer le count
function Stars({ count }: { count: number }): ReactElement {
  // Création d'un tableau statique de 5 éléments
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="mu-avis-note" aria-label={`${count} sur 5`}>
      {stars.map((index) => (
        <img
          key={`star-${index}`}
          src={starIcon}
          alt=""
          className={`mu-avis-star ${index <= count ? "is-active" : ""}`}
          aria-hidden="true"
          width={18}
          height={18}
          loading="lazy"
        />
      ))}
    </div>
  );
}

// --- COMPOSANT PRINCIPAL ---
function Avis({ limit }: { limit?: number }): ReactElement {
  // On stocke directement les données fusionnées ou brutes selon la préférence
  // Ici, on garde les raw data mais on optimise l'accès
  const [reviews, setReviews] = useState<Review[]>([]);
  const [usersMap, setUsersMap] = useState<Map<number, Author>>(new Map());

  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Parallélisation des requêtes réseau
        const [reviewsRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/reviews`),
          fetch(`${API_BASE_URL}/api/users`),
        ]);

        if (!reviewsRes.ok || !usersRes.ok) {
          throw new Error("Erreur réseau");
        }

        const reviewsData: Review[] = await reviewsRes.json();
        const usersData: Author[] = await usersRes.json();

        // 2. Création d'une Map pour indexer les users par ID (Complexité O(1) à la lecture)
        const userMap = new Map(
          usersData.map((user) => [Number(user.id), user]),
        );

        setReviews(reviewsData);
        setUsersMap(userMap);
        setStatus("success");
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        setStatus("error");
      }
    };

    fetchData();
  }, []);

  const displayedReviews = useMemo(() => {
    const list = limit ? reviews.slice(0, limit) : reviews;

    return list
      .map((review): ReviewWithAuthor | null => {
        // On tente la conversion en nombre pour sécuriser
        const userIdCheck = Number(review.userId);
        const author = usersMap.get(userIdCheck);

        // --- DEBUG ---
        if (!author) {
          console.warn(
            `Avis ID ${review.id}: Auteur introuvable pour userId ${review.userId} (Type: ${typeof review.userId})`,
          );
        }
        // -------------

        if (!author) return null;

        return { ...review, author };
      })
      .filter((item): item is ReviewWithAuthor => item !== null);
  }, [reviews, usersMap, limit]);

  // --- RENDU ---

  if (status === "loading") {
    return <div className="mu-loading">Chargement des avis...</div>;
  }

  if (status === "error") {
    return (
      <div className="mu-error">
        Impossible de charger les avis pour le moment.
      </div>
    );
  }

  if (displayedReviews.length === 0) {
    return (
      <div className="mu-no-reviews">Aucun avis n'a encore été posté.</div>
    );
  }

  return (
    <section className="mu-avis-section">
      <h2 className="mu-avis-title">Ils ont relevé le défi !</h2>

      <div className="mu-avis-grid">
        {displayedReviews.map(({ id, title, rating, comment, author }) => (
          <article key={id} className="mu-avis-card">
            {title && <h3 className="mu-avis-authorTitle">{title}</h3>}

            <Stars count={rating} />

            <p className="mu-avis-comment">"{comment}"</p>

            <div className="mu-avis-author-card">
              <img
                src={`${API_BASE_URL}${author?.photoUrl}`}
                alt=""
                // {`${author?.firstname}`} le alt est considere comme rebondant selon les normes d'accessibilite et ce sont des images purement decoratives
                aria-hidden="true"
                className="mu-avis-avatar"
                loading="lazy"
                height={100}
                width={100}
              />
              <h4 className="mu-avis-author">
                {author?.firstname}
                {author?.age && (
                  <span className="mu-avis-age">, {author?.age} ans</span>
                )}
              </h4>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Avis;
