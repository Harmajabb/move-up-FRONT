import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types/types";
import "../App.css";
import "./Profil.css";

type AddressSuggestion = {
  properties: {
    id: string;
    label?: string;
    name?: string;
    postcode?: string;
    city?: string;
    [key: string]: string | undefined;
  };
};

function Profil() {
  const { setUser: setContextUser, userId, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [addressSuggest, setAddressSuggest] = useState<AddressSuggestion[]>([]);
  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setFormData((prevData) => ({
      ...prevData, //
      address: suggestion.properties.name,
      zipcode: suggestion.properties.postcode,
      city: suggestion.properties.city,
    }));
    setAddressSuggest([]);
  };
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nomDuChamp = e.target.name; // 'address'
    const newValue = e.target.value;

    // 1. Mise à jour de formData.address
    setFormData((prevData) => ({
      ...prevData,
      [nomDuChamp]: newValue,
    }));

    // 2. Logique de suggestion d'adresse
    if (newValue.length > 2) {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(newValue)}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          setAddressSuggest(data.features || []);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des adresses:", error);
          setAddressSuggest([]);
        });
    } else {
      setAddressSuggest([]);
    }
  };
  const handleSuggestionKeyDown = (
    e: React.KeyboardEvent<HTMLLIElement>,
    suggestion: AddressSuggestion,
  ) => {
    if (e.key === "Enter") {
      handleSuggestionClick(suggestion);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    const bodyData = new FormData();

    if (selectedFile) {
      bodyData.append("photo", selectedFile);
    }

    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key as keyof typeof formData];
        if (value !== null && value !== undefined && value !== "") {
          bodyData.append(key, value as string);
        } else if (
          (key === "address" || key === "zipcode" || key === "city") &&
          value === ""
        ) {
          bodyData.append(key, "");
        }
      }
    }

    try {
      const reponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
        method: "PATCH",
        body: bodyData,
      });

      if (reponse.ok) {
        setUser((prevUser) => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, ...formData };
          setContextUser(updatedUser);
          return updatedUser;
        });
        setIsEditing(false);
      } else {
        console.error("Échec de la mise à jour côté serveur");
      }
    } catch (erreur) {
      console.error("Erreur réseau lors de la mise à jour:", erreur);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir supprimer votre profil ? Cette action est irréversible.",
    );

    if (confirmation) {
      try {
        const reponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
          { method: "DELETE" },
        );

        if (reponse.ok) {
          logout();
        } else {
          console.error("Échec de la suppression");
        }
      } catch (erreur) {
        console.error("Erreur réseau lors de la suppression:", erreur);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const nomDuChamp = e.target.name;
    const nouvelleValeur = e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      [nomDuChamp]: nouvelleValeur,
    }));
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const fetchUtilisateur = async () => {
      try {
        const reponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
        );

        if (!reponse.ok) {
          console.error("Erreur HTTP:", reponse.status, reponse.statusText);
          throw new Error("La requête a échoué");
        }

        const data: User = await reponse.json();

        setUser(data);
        setContextUser(data);
        setFormData(data);
      } catch (erreur) {
        console.error("Erreur lors de la récupération du profil:", erreur);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUtilisateur();
    } else {
      console.log("Aucun userId, impossible de fetcher le profil.");
      setIsLoading(false);
    }
  }, [userId, setContextUser]);

  if (isLoading) {
    return <div>Chargement de votre profil...</div>;
  }

  if (!user) {
    return (
      <div>
        Impossible de charger le profil. Vérifiez que vous êtes connecté et que
        l'API est en cours d'exécution.
      </div>
    );
  }

  const displayData = isEditing ? formData : user;

  return (
    <>
      <header className="profile-header">
        <h1>Mon profil utilisateur</h1>
        <h2>Bonjour {displayData.firstname || ""}</h2>
      </header>

      <main className="profile-page">
        <section className="profile-card profile-personal">
          <h3>Mes données personnelles</h3>

          <div className="profile-personal-content">
            <div className="profile-avatar-block">
              <p>Photo de profil :</p>
              {isEditing ? (
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              ) : displayData.photoUrl ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${displayData.photoUrl}`}
                  alt="profil user"
                  className="profile-avatar"
                />
              ) : (
                <span className="profile-avatar-empty">(Aucune photo)</span>
              )}
            </div>

            <div className="profile-fields">
              <p>
                <span className="label">Nom :</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name || ""}
                    name="name"
                    onChange={handleChange}
                  />
                ) : (
                  <span className="value">{displayData.name || ""}</span>
                )}
              </p>

              <p>
                <span className="label">Prénom :</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstname || ""}
                    name="firstname"
                    onChange={handleChange}
                  />
                ) : (
                  <span className="value">{displayData.firstname || ""}</span>
                )}
              </p>

              <div className="profile-address">
                <span className="label">Adresse :</span>
                {isEditing ? (
                  <div className="address-inputs">
                    <input
                      type="text"
                      value={formData.address || ""}
                      name="address"
                      placeholder="Adresse"
                      onChange={handleAddressChange}
                    />
                    {addressSuggest.length > 0 && (
                      <ul className="address-suggestions">
                                               {" "}
                        {addressSuggest.map((suggestion) => (
                          <li
                            key={suggestion.properties.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            onKeyDown={(e) =>
                              handleSuggestionKeyDown(e, suggestion)
                            }
                            className="suggestion-item"
                          >
                                                       {" "}
                            {suggestion.properties.label}                       
                             {" "}
                          </li>
                        ))}
                                             {" "}
                      </ul>
                    )}
                    <input
                      type="text"
                      value={formData.zipcode || ""}
                      name="zipcode"
                      placeholder="Code Postal"
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      value={formData.city || ""}
                      name="city"
                      placeholder="Ville"
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <p className="value">
                    {displayData.address || ""}, {displayData.zipcode || ""}{" "}
                    {displayData.city || ""}
                  </p>
                )}
              </div>

              <p>
                <span className="label">Téléphone :</span>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    name="phone"
                    onChange={handleChange}
                  />
                ) : (
                  <span className="value">{displayData.phone || ""}</span>
                )}
              </p>

              <p>
                <span className="label">Adresse Email :</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email || ""}
                    name="email"
                    onChange={handleChange}
                  />
                ) : (
                  <span className="value">{displayData.email || ""}</span>
                )}
              </p>

              <p>
                <span className="label">Type utilisateur :</span>
                {isEditing ? (
                  <select
                    id="usertype"
                    name="usertype"
                    value={formData.usertype || ""}
                    onChange={handleChange}
                  >
                    <option value="">-- Veuillez choisir --</option>
                    <option value="Professionnel">Professionnel</option>
                    <option value="Personnel">Personnel</option>
                  </select>
                ) : (
                  <span className="value">{displayData.usertype || ""}</span>
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="profile-card profile-sport">
          <h3>Mon profil sportif</h3>
          <div className="profile-fields">
            <p>
              <span className="label">Niveau d'expérience :</span>
              {isEditing ? (
                <select
                  id="levelexperiency"
                  name="levelexperiency"
                  value={formData.levelexperiency || ""}
                  onChange={handleChange}
                >
                  <option value="">-- Veuillez choisir --</option>
                  <option value="Debutant">
                    Débutant - Je n'ai pas l'habitude de pratiquer
                  </option>
                  <option value="Intermédiaire">
                    Intermédiaire - Je pratique régulièrement
                  </option>
                  <option value="Expert">
                    Expert - Je pratique intensivement ou je suis coach
                  </option>
                </select>
              ) : (
                <span className="value">
                  {displayData.levelexperiency || ""}
                </span>
              )}
            </p>

            <p>
              <span className="label">Temps à consacrer :</span>
              {isEditing ? (
                <input
                  id="timerequired"
                  type="time"
                  name="timerequired"
                  value={formData.timerequired || ""}
                  onChange={handleChange}
                />
              ) : (
                <span className="value">{displayData.timerequired || ""}</span>
              )}
            </p>

            <p>
              <span className="label">Mon régime alimentaire :</span>
              {isEditing ? (
                <select
                  id="diet"
                  name="diet"
                  value={formData.diet || ""}
                  onChange={handleChange}
                >
                  <option value="">-- Veuillez choisir --</option>
                  <option value="Végétarien">Végétarien</option>
                  <option value="Sans restriction">Sans restriction</option>
                  <option value="Végan">Végan</option>
                  <option value="Pescétarisme">Pescétarisme</option>
                  <option value="Flexitarisme">Flexitarisme</option>
                  <option value="Clean Eating">Clean Eating</option>
                </select>
              ) : (
                <span className="value">{displayData.diet || ""}</span>
              )}
            </p>
          </div>

          <h3 className="profile-subtitle">Mon profil d'abonnement</h3>
          <div className="profile-fields">
            <p>
              <span className="label">Type abonnement :</span>
              {isEditing ? (
                <select
                  id="subscription"
                  name="subscription"
                  value={formData.subscription || ""}
                  onChange={handleChange}
                >
                  <option value="">-- Veuillez choisir --</option>
                  <option value="Basic">Basic - 19€ par mois</option>
                  <option value="Pro">Pro - 29€ par mois</option>
                  <option value="Premium">Premium - 49€ par mois</option>
                </select>
              ) : (
                <span className="value">{displayData.subscription || ""}</span>
              )}
            </p>
          </div>
        </section>

        <section className="profile-actions">
          <button
            type="button"
            onClick={
              isEditing
                ? handleSubmit
                : () => {
                    setIsEditing(true);
                  }
            }
          >
            {isEditing ? "Valider" : "Modifier"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(user);
              }}
            >
              Annuler
            </button>
          )}

          <button type="button" onClick={handleLogout}>
            Déconnexion
          </button>

          <button
            type="button"
            className="button-delete"
            onClick={handleDelete}
          >
            Supprimer mon profil
          </button>
        </section>
      </main>
    </>
  );
}

export default Profil;
