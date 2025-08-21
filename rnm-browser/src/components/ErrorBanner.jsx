import React from 'react'

export default function ErrorBanner({ message, detail, onRetry }) {
  return (
    <div className="errorBanner" role="alert">
      <div>
        <strong>{message}</strong>
        <div className="muted">{detail}</div>
      </div>
      <button className="btn" onClick={onRetry}>Retry</button>
    </div>
  )
}
