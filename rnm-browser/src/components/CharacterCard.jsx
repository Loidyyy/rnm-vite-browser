import React from 'react'
import { useFavorites } from '../state/FavoritesContext.jsx'

export default function CharacterCard({ character, onOpen }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(character.id)

  return (
    <article className="card" role="article" aria-label={character.name}>
      <button className="imgWrap" onClick={onOpen} aria-label={`Open details for ${character.name}`}>
        <img src={character.image} alt={character.name} loading="lazy" />
      </button>

      <div className="cardBody">
        <header className="cardHeader">
          <h3 className="title">{character.name}</h3>
          <button
            className={`iconBtn ${fav ? 'active' : ''}`}
            onClick={() => toggleFavorite(character.id)}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            title={fav ? 'Unfavorite' : 'Favorite'}
          >
            ★
          </button>
        </header>
        <div className="meta">
          <span className={`pill ${character.status.toLowerCase()}`}>
            {character.status}
          </span>
          <span className="pill">{character.species}</span>
          {character.gender !== 'unknown' && <span className="pill">{character.gender}</span>}
        </div>
        <button className="linkBtn" onClick={onOpen}>View details</button>
      </div>
    </article>
  )
}
