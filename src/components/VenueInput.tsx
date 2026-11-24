'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { isMapsConfigured } from '@/lib/map-links'
import { areaFromComponents, loadPlaces } from '@/lib/maps-client'

export interface PickedPlace {
  venue: string
  latitude: number
  longitude: number
  area: string
}

interface Suggestion {
  id: string
  main: string
  secondary: string
  prediction: google.maps.places.PlacePrediction
}

const LONDON = { lat: 51.5072, lng: -0.1276 }

/**
 * Venue text box. With a Google Maps key it suggests real places as you type;
 * without one it's a plain text box.
 */
export default function VenueInput({
  value,
  onChange,
  onPick,
  className,
}: {
  value: string
  onChange: (text: string) => void
  onPick: (place: PickedPlace) => void
  className: string
}) {
  const listId = useId()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [loading, setLoading] = useState(false)
  const placesRef = useRef<google.maps.PlacesLibrary | null>(null)
  const tokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const requestId = useRef(0)
  const skipNextLookup = useRef(false)

  // Look up suggestions shortly after the user stops typing.
  useEffect(() => {
    if (!isMapsConfigured) return
    if (skipNextLookup.current) {
      skipNextLookup.current = false
      return
    }
    const input = value.trim()
    if (input.length < 3) {
      setSuggestions([])
      return
    }
    const id = ++requestId.current
    const timer = setTimeout(async () => {
      const places = placesRef.current ?? (placesRef.current = await loadPlaces())
      if (!places || id !== requestId.current) return
      tokenRef.current ??= new places.AutocompleteSessionToken()
      setLoading(true)
      try {
        const { suggestions: results } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: tokenRef.current,
          includedRegionCodes: ['gb'],
          locationBias: { center: LONDON, radius: 30000 },
          origin: LONDON,
        })
        if (id !== requestId.current) return // a newer search has started
        const list = results
          .map((s) => s.placePrediction)
          .filter((p): p is google.maps.places.PlacePrediction => Boolean(p))
          .slice(0, 5)
          .map((p) => ({ id: p.placeId, main: p.mainText?.text ?? p.text.text, secondary: p.secondaryText?.text ?? '', prediction: p }))
        setSuggestions(list)
        setOpen(list.length > 0)
        setActive(-1)
      } catch (err) {
        console.error('Place suggestions failed:', err)
        setSuggestions([])
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [value])

  const pick = async (s: Suggestion) => {
    setOpen(false)
    setSuggestions([])
    try {
      const { place } = await s.prediction.toPlace().fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'],
      })
      tokenRef.current = null // the session ends after fetching details
      const name = place.displayName ?? s.main
      const address = place.formattedAddress ?? s.secondary
      const venue = (address && !address.startsWith(name) ? `${name}, ${address}` : address || name).slice(0, 200)
      skipNextLookup.current = true
      onChange(venue)
      if (place.location) {
        onPick({
          venue,
          latitude: Number(place.location.lat().toFixed(6)),
          longitude: Number(place.location.lng().toFixed(6)),
          area: areaFromComponents(place.addressComponents),
        })
      }
    } catch (err) {
      console.error('Place details failed:', err)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault() // don't submit the form
      pick(suggestions[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-primary text-[20px]">location_on</span>
      <input
        id="venue"
        name="venue"
        required
        minLength={3}
        maxLength={200}
        autoComplete="off"
        role={isMapsConfigured ? 'combobox' : undefined}
        aria-expanded={isMapsConfigured ? open : undefined}
        aria-controls={isMapsConfigured ? listId : undefined}
        aria-autocomplete={isMapsConfigured ? 'list' : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        className={`${className} pl-10`}
        placeholder={isMapsConfigured ? 'Search for a venue or address' : 'Venue name, landmark, or street address'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {loading && (
        <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-outline text-[20px] animate-spin">progress_activity</span>
      )}
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 bg-surface-container-lowest rounded-DEFAULT shadow-xl overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()} // keep focus so the click registers
              onClick={() => pick(s)}
              className={`px-4 py-2.5 cursor-pointer flex items-start gap-2.5 ${i === active ? 'bg-primary-fixed' : 'hover:bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined text-outline text-[18px] mt-0.5">place</span>
              <span className="min-w-0">
                <span className="block font-jakarta text-body-md text-on-surface truncate">{s.main}</span>
                {s.secondary && <span className="block font-inter text-label-sm text-outline font-medium truncate">{s.secondary}</span>}
              </span>
            </li>
          ))}
          <li role="presentation" className="px-4 py-1.5 text-right font-inter text-[10px] text-outline">
            Powered by Google
          </li>
        </ul>
      )}
    </div>
  )
}
