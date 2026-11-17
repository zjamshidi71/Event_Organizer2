// TypeScript description of the Supabase database (mirrors supabase/migrations/0001_init.sql).
// If you change the database, update this file too — or regenerate it with:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts

export type Category = 'music' | 'sports' | 'arts' | 'volunteer' | 'food' | 'workshops' | 'meetup'
export type UserRole = 'youth' | 'organizer'
export type TicketType = 'free' | 'paid'
export type AgeGroup = 'all' | '16-18' | '18-24'
export type EventStatus = 'draft' | 'published' | 'cancelled'

type ProfileRow = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  city: string | null
  birth_year: number | null
  role: UserRole
  interests: string[]
  is_verified: boolean
  created_at: string
  updated_at: string
}

type EventRow = {
  id: string
  organizer_id: string | null
  host_name: string
  host_verified: boolean
  title: string
  description: string | null
  categories: Category[]
  starts_at: string
  ends_at: string | null
  venue: string | null
  area: string | null
  city: string
  latitude: number | null
  longitude: number | null
  show_exact_location: boolean
  capacity: number
  ticket_type: TicketType
  price_pence: number
  currency: string
  age_group: AgeGroup
  verified_host_onsite: boolean
  safe_space_accepted: boolean
  image_url: string | null
  perk: string | null
  is_featured: boolean
  status: EventStatus
  rsvp_count: number
  created_at: string
  updated_at: string
}

type RsvpRow = {
  event_id: string
  user_id: string
  created_at: string
  checked_in: boolean
}

type SavedEventRow = {
  event_id: string
  user_id: string
  created_at: string
}

// Columns the database fills in for you are optional when inserting.
type EventInsert = Pick<EventRow, 'host_name' | 'title' | 'starts_at'> &
  Partial<Omit<EventRow, 'id' | 'organizer_id' | 'rsvp_count' | 'host_verified' | 'is_featured' | 'created_at' | 'updated_at'>>

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Pick<ProfileRow, 'id'> & Partial<ProfileRow>
        Update: Partial<Omit<ProfileRow, 'id' | 'is_verified' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      events: {
        Row: EventRow
        Insert: EventInsert
        Update: Partial<EventInsert>
        Relationships: [
          {
            foreignKeyName: 'events_organizer_id_fkey'
            columns: ['organizer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      rsvps: {
        Row: RsvpRow
        Insert: Pick<RsvpRow, 'event_id' | 'user_id'>
        Update: Pick<RsvpRow, 'checked_in'>
        Relationships: [
          {
            foreignKeyName: 'rsvps_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      saved_events: {
        Row: SavedEventRow
        Insert: Pick<SavedEventRow, 'event_id' | 'user_id'>
        Update: never
        Relationships: [
          {
            foreignKeyName: 'saved_events_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = ProfileRow
export type EventRecord = EventRow
export type Rsvp = RsvpRow
export type SavedEvent = SavedEventRow
