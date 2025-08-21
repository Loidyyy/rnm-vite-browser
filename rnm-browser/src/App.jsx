import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useFavorites } from './state/FavoritesContext.jsx'
import { useDebounce } from './hooks/useDebounce.js'
import Spinner from './components/Spinner.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import DetailsModal from './components/DetailsModal.jsx'
import CharacterCard from './components/CharacterCard.jsx'

const API = 'https://rickandmortyapi.com/api/character'

const initialFilters = {
  name: '',
  status: 'any',    // alive | dead | unknown | any
  gender: 'any',    // female | male | genderless | unknown | any
  species: '',      // free text
  favoritesOnly: false,
  sort: 'name-asc', // name-asc | name-desc | created-asc | created-desc
}

function filtersReducer(state, action) {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.payload }
    case 'reset':
      return initialFilters
    default:
      return state
  }
}

export default function App() {
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters)
  const debouncedName = useDebounce(filters.name, 300)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nextUrl, setNextUrl] = useState(null)
  const [selected, setSelected] = useState(null)

  const abortRef = useRef(null)
  const { favoritesSet } = useFavorites()

  // Build query string for API
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (debouncedName.trim()) params.set('name', debouncedName.trim())
    if (filters.status !== 'any') params.set('status', filters.status)
    if (filters.gender !== 'any') params.set('gender', filters.gender)
    if (filters.species.trim()) params.set('species', filters.species.trim())
    return `${API}?${params.toString()}`
  }, [debouncedName, filters.status, filters.gender, filters.species])

  // Fetch page 1 when filters change
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    setItems([])
    setNextUrl(null)

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    fetch(apiUrl, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data = await r.json()
        if (!isMounted) return
        setItems(data.results ?? [])
        setNextUrl(data.info?.next ?? null)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [apiUrl])

  // Load more for pagination
  const loadMore = () => {
    if (!nextUrl) return
    setLoading(true)
    setError(null)
    const controller = new AbortController()
    fetch(nextUrl, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data = await r.json()
        setItems((prev) => prev.concat(data.results ?? []))
        setNextUrl(data.info?.next ?? null)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err)
      })
      .finally(() => setLoading(false))
  }

  // Favorites filter + sorting are client-side
  const visibleItems = useMemo(() => {
    let out = items
    if (filters.favoritesOnly) {
      out = out.filter((c) => favoritesSet.has(c.id))
    }
    switch (filters.sort) {
      case 'name-asc':
        out = [...out].sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        out = [...out].sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'created-asc':
        out = [...out].sort(
          (a, b) => new Date(a.created) - new Date(b.created)
        )
        break
      case 'created-desc':
        out = [...out].sort(
          (a, b) => new Date(b.created) - new Date(a.created)
        )
        break
      default:
        break
    }
    return out
  }, [items, favoritesSet, filters.favoritesOnly, filters.sort])

  return (
    <div className="container">
      <header className="header">
        <h1>Rick & Morty Browser</h1>
        <p className="sub">
          Search, filter, sort, view details, and favorite characters.
        </p>
      </header>

      <section className="controls">
        <input
          className="input"
          type="search"
          placeholder="Search by name…"
          value={filters.name}
          onChange={(e) => dispatch({ type: 'set', payload: { name: e.target.value } })}
          aria-label="Search by name"
        />

        <select
          className="select"
          value={filters.status}
          onChange={(e) => dispatch({ type: 'set', payload: { status: e.target.value } })}
          aria-label="Filter by status"
        >
          <option value="any">Status: Any</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>

        <select
          className="select"
          value={filters.gender}
          onChange={(e) => dispatch({ type: 'set', payload: { gender: e.target.value } })}
          aria-label="Filter by gender"
        >
          <option value="any">Gender: Any</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="genderless">Genderless</option>
          <option value="unknown">Unknown</option>
        </select>

        <input
          className="input"
          type="text"
          placeholder="Species (e.g., Human)"
          value={filters.species}
          onChange={(e) => dispatch({ type: 'set', payload: { species: e.target.value } })}
          aria-label="Filter by species"
        />

        <select
          className="select"
          value={filters.sort}
          onChange={(e) => dispatch({ type: 'set', payload: { sort: e.target.value } })}
          aria-label="Sort items"
        >
          <option value="name-asc">Sort: Name ↑</option>
          <option value="name-desc">Sort: Name ↓</option>
          <option value="created-asc">Sort: Created ↑</option>
          <option value="created-desc">Sort: Created ↓</option>
        </select>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.favoritesOnly}
            onChange={(e) =>
              dispatch({ type: 'set', payload: { favoritesOnly: e.target.checked } })
            }
          />
          Favorites only
        </label>

        <button className="btn secondary" onClick={() => dispatch({ type: 'reset' })}>
          Reset
        </button>
      </section>

      {error && (
        <ErrorBanner
          message="Something went wrong while fetching characters."
          detail={error.message}
          onRetry={() => {
            // tweak name to retrigger effect quickly without changing UI
            dispatch({ type: 'set', payload: { name: filters.name } })
          }}
        />
      )}

      {!error && (
        <>
          <section className="grid">
            {visibleItems.map((c) => (
              <CharacterCard key={c.id} character={c} onOpen={() => setSelected(c)} />
            ))}
          </section>

          <div className="footerRow">
            {loading ? <Spinner /> : null}
            {!loading && visibleItems.length === 0 && (
              <div className="empty">No results. Try adjusting your search/filters.</div>
            )}
            {!loading && nextUrl && !filters.favoritesOnly && (
              <button className="btn" onClick={loadMore}>
                Load more
              </button>
            )}
          </div>
        </>
      )}

      <DetailsModal item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
