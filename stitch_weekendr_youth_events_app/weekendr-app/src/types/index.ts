export interface Event {
  id: string
  title: string
  category: string
  price: number | null
  isFree: boolean
  date: string
  time: string
  venue: string
  distance: string
  attendeeCount: number
  capacity: number
  imageUrl: string
  organizerName: string
  isVerified: boolean
  soldPercent: number
  tags: string[]
}

export interface UserProfile {
  id: string
  name: string
  username: string
  age: number
  city: string
  avatarUrl: string
  role: 'youth' | 'organizer'
  interests: string[]
  eventsAttended: number
  communityHours: number
  friendsCount: number
  weekStreak: number
}

export interface OrganizerStats {
  totalRsvps: number
  ticketSales: number
  capFilled: number
  hostRating: number
}
