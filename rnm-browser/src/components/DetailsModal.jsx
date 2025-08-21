import React, { useEffect } from 'react'

export default function DetailsModal({ item, onClose }) {
  const open = !!item
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modalBackdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modalHeader">
          <h2>{item.name}</h2>
          <button className="iconBtn" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="modalBody">
          <img className="modalImg" src={item.image} alt={item.name} />
          <ul className="detailsList">
            <li><strong>Status:</strong> {item.status}</li>
            <li><strong>Species:</strong> {item.species}</li>
            {item.type && <li><strong>Type:</strong> {item.type}</li>}
            <li><strong>Gender:</strong> {item.gender}</li>
            <li><strong>Origin:</strong> {item.origin?.name}</li>
            <li><strong>Location:</strong> {item.location?.name}</li>
            <li><strong>Episodes:</strong> {item.episode?.length ?? 0}</li>
            <li><strong>Created:</strong> {new Date(item.created).toLocaleString()}</li>
          </ul>
        </div>
        <footer className="modalFooter">
          <button className="btn secondary" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  )
}
