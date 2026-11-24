// Google Maps links and embeds. Safe to use on the server and in the browser.

/** Public browser key (restricted to your site in Google Cloud). Empty = maps turned off. */
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
export const isMapsConfigured = GOOGLE_MAPS_KEY.length > 0

type Where = { latitude?: number | null; longitude?: number | null; query?: string | null }

/** "Get directions" link – opens Google Maps (app or website). Needs no API key. */
export function directionsUrl({ latitude, longitude, query }: Where): string | null {
  const destination = latitude != null && longitude != null ? `${latitude},${longitude}` : query
  if (!destination) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

/** URL for an embedded map (Maps Embed API – free to use). Null if maps are off or there's no location. */
export function embedMapUrl({ latitude, longitude, query }: Where, zoom = 15): string | null {
  if (!isMapsConfigured) return null
  const q = latitude != null && longitude != null ? `${latitude},${longitude}` : query
  if (!q) return null
  return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}&q=${encodeURIComponent(q)}&zoom=${zoom}`
}

/** Straight-line distance in miles between two points (haversine formula). */
export function distanceMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.8 // Earth's radius in miles
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatMiles(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi'
  return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`
}

/** Rough check that coordinates are in/near the UK (where the app operates). */
export function isPlausibleUkLocation(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 49 && lat <= 61.5 && lng >= -9 && lng <= 2.5
}
