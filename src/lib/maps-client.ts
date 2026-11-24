'use client'
// Loads the Google Maps JavaScript API (Places library) in the browser, once.
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { GOOGLE_MAPS_KEY, isMapsConfigured } from './map-links'

let configured = false

export async function loadPlaces(): Promise<google.maps.PlacesLibrary | null> {
  if (!isMapsConfigured) return null
  if (!configured) {
    setOptions({ key: GOOGLE_MAPS_KEY, v: 'weekly', language: 'en-GB', region: 'GB' })
    configured = true
  }
  try {
    return await importLibrary('places')
  } catch (err) {
    console.error('Google Maps failed to load:', err)
    return null
  }
}

/** Builds a short area label like "Hackney, E8" from a place's address parts. */
export function areaFromComponents(components: google.maps.places.AddressComponent[] | undefined): string {
  if (!components) return ''
  const find = (type: string) => components.find((c) => c.types.includes(type))
  const district =
    find('neighborhood')?.longText ||
    find('sublocality_level_1')?.longText ||
    find('sublocality')?.longText ||
    find('postal_town')?.longText ||
    find('locality')?.longText ||
    ''
  const postcode = find('postal_code')?.longText ?? ''
  const outward = postcode.split(' ')[0] // "E8 3PH" → "E8"
  return [district, outward].filter(Boolean).join(', ').slice(0, 40)
}
