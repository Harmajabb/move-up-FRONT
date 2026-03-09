// import { useEffect, useId, useState } from "react";
// import ExerciceCard from "../../components/ExerciceCard";
// // import Training from "../../components/Training";
// import type { Exercice } from "../../types/types";``


// /* --------------------------------------------
//    Remplacer ces IDs par ceux du training prévu
//    Ordre = ordre d’affichage
// -------------------------------------------- */
// const TRAINING_1_IDS = [
//   42, 42, 42,
//   1, 5, 17, 17,
//   1, 5, 17, 17,
//   1, 5, 17, 17,
//   1, 5, 17, 17,
//   55, 46, 47
// ];

// // 
// const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/exercices`;

// function TrainingEx2() {

//   /* --------------------------------------------
//      - exercices = liste des exercices récupérés depuis l’API
//      - loading = true tant que le fetch n’est pas terminé
//   -------------------------------------------- */
//   const [exercices, setExercices] = useState<Exercice[]>([]);
//   const [loading, setLoading] = useState(true);

//   /* --------------------------------------------
//      Charge les exercices au montage du composant
//      Fetch pour chaque ID de TRAINING_1_IDS
//   -------------------------------------------- */
//   useEffect(() => {
//     async function load() {
//       try {
//         const promises = TRAINING_1_IDS.map((id) =>
//           fetch(`${API_BASE_URL}/${id}`) // <-- endpoint de récupération d’un exercice
//             .then((res) => res.json())
//         );

//         const results = await Promise.all(promises);
//         setExercices(prev => [...results]); // <- données récupérées de l’API
//         console.log("variable exercices, voici ma liste d'exercices", exercices);
//       } catch (error) {
//         console.error("Erreur lors du chargement du training 1 :", error);
//       } finally {
//         // console.log('===================', exercices)
//         setLoading(false); // <- termine le chargement
//       }
//     }

//     load();
//   }, []);

//   /* --------------------------------------------
//      - Affiche un message pendant le chargement
//      - Affiche le composant Training une fois les données chargées
//      - Le composant Training s’occupe d’afficher les ExerciceCard
//   -------------------------------------------- */
//   if (loading) return <p>Chargement du training...</p>;

//   return (
//     <>
//     {console.log('===================', exercices)}
//     { exercices
//     .map((element, index) => <ExerciceCard key={index} exoData={element} />)
//     }
    
//     </>
//     // <Training
//     //   title="Training #1" // <-- Titre du training
//     //   exercices={exercices} // <-- Données à afficher
//     // />

//   );
// }

// export default TrainingEx2;
