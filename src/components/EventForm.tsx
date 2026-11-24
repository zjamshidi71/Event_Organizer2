'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { saveEvent, type EventFormState } from '@/app/create-event/actions'
import EventCard from '@/components/EventCard'
import TopBar from '@/components/TopBar'
import { CATEGORY_META } from '@/lib/categories'
import { londonToDate } from '@/lib/datetime'
import { createClient } from '@/lib/supabase/client'
import type { AgeGroup, Category, EventRecord } from '@/types/database'

const CATEGORY_OPTIONS = Object.entries(CATEGORY_META) as [Category, { emoji: string; label: string }][]

const AGE_GROUPS: { id: AgeGroup; label: string }[] = [
  { id: 'all', label: 'All Ages (16–24)' },
  { id: '16-18', label: '16–18 only' },
  { id: '18-24', label: '18–24 only (ID required)' },
]

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const inputClass =
  'w-full px-4 py-3.5 rounded-DEFAULT bg-surface-container-low text-on-surface placeholder:text-outline font-jakarta text-body-md shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:shadow-md focus:ring-2 focus:ring-primary/30 transition-all'
const labelClass = 'font-jakarta text-headline-sm text-on-surface'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="font-inter text-label-md text-error flex items-center gap-1">
      <span className="material-symbols-outlined text-[16px]">error</span>
      {message}
    </p>
  )
}

function ActionButtons({ intentRef, onPreview, disabled }: { intentRef: React.RefObject<HTMLInputElement>; onPreview: () => void; disabled: boolean }) {
  const { pending } = useFormStatus()
  const publishing = pending && intentRef.current?.value === 'publish'
  return (
    <div className="fixed bottom-0 inset-x-0 bg-surface/90 backdrop-blur-md p-space-md pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl z-40">
      <div className="max-w-lg mx-auto flex items-center gap-space-sm">
        <button
          type="button"
          onClick={onPreview}
          className="w-1/3 py-3 rounded-full bg-surface-container-low text-on-surface font-inter text-label-md flex items-center justify-center gap-1 active:scale-95 transition-transform hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          <span>Preview</span>
        </button>
        <button
          type="submit"
          disabled={pending || disabled}
          onClick={() => {
            if (intentRef.current) intentRef.current.value = 'publish'
          }}
          className="w-2/3 py-3 rounded-full bg-primary-container text-on-primary font-jakarta text-headline-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-60"
        >
          <span>{publishing ? 'Publishing…' : 'Publish Event'}</span>
          <span className="material-symbols-outlined text-[20px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </button>
      </div>
    </div>
  )
}

function DraftButton({ intentRef, disabled }: { intentRef: React.RefObject<HTMLInputElement>; disabled: boolean }) {
  const { pending } = useFormStatus()
  const saving = pending && intentRef.current?.value === 'draft'
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      onClick={() => {
        if (intentRef.current) intentRef.current.value = 'draft'
      }}
      className="px-3 py-1.5 rounded-full bg-surface-container text-primary font-inter text-label-md hover:bg-primary-fixed transition-colors active:scale-95 disabled:opacity-60"
    >
      {saving ? 'Saving…' : 'Save Draft'}
    </button>
  )
}

export interface EventFormProps {
  userId: string
  defaultHostName: string
  defaultDate: string // YYYY-MM-DD
  minDate: string
  maxDate: string
}

export default function EventForm({ userId, defaultHostName, defaultDate, minDate, maxDate }: EventFormProps) {
  const router = useRouter()
  const [state, formAction] = useFormState<EventFormState, FormData>(saveEvent, undefined)
  const intentRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const fe = state?.fieldErrors ?? {}

  const [dirty, setDirty] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hostName, setHostName] = useState(defaultHostName)
  const [categories, setCategories] = useState<Set<Category>>(new Set())
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [date, setDate] = useState(defaultDate)
  const [startTime, setStartTime] = useState('19:00')
  const [endTime, setEndTime] = useState('22:00')
  const [venue, setVenue] = useState('')
  const [area, setArea] = useState('')
  const [exactPin, setExactPin] = useState(true)
  const [capacity, setCapacity] = useState(100)
  const [ticketType, setTicketType] = useState<'free' | 'paid'>('free')
  const [price, setPrice] = useState('')
  const [perk, setPerk] = useState('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('all')
  const [verifiedHost, setVerifiedHost] = useState(true)
  const [safeSpace, setSafeSpace] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const touch = <T,>(setter: (v: T) => void) => (v: T) => {
    setDirty(true)
    setter(v)
  }

  const toggleCategory = (id: Category) => {
    setDirty(true)
    setCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const adjustCapacity = (delta: number) => {
    setDirty(true)
    setCapacity((prev) => Math.max(1, Math.min(10000, (prev || 0) + delta)))
  }

  const uploadImage = async (file: File | undefined) => {
    setUploadError('')
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) return setUploadError('Use a JPG, PNG or WebP image.')
    if (file.size > MAX_IMAGE_BYTES) return setUploadError('That image is over 5 MB. Try a smaller one.')
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${userId}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('event-images').upload(path, file, { contentType: file.type, cacheControl: '31536000' })
      if (error) throw error
      setImageUrl(supabase.storage.from('event-images').getPublicUrl(path).data.publicUrl)
      setDirty(true)
    } catch (err) {
      console.error('Image upload failed:', err)
      setUploadError('Upload failed. Check your connection and try again.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const close = () => {
    if (dirty && !window.confirm('Discard this event? Your changes won’t be saved.')) return
    if (window.history.length > 1) router.back()
    else router.push('/organizer')
  }

  // Progress: the essentials needed to publish.
  const essentials = [title.trim().length >= 3, categories.size > 0, Boolean(date && startTime), venue.trim().length >= 3, safeSpace]
  const done = essentials.filter(Boolean).length

  // Event as attendees will see it (for Preview).
  const previewStart = londonToDate(date, startTime) ?? new Date()
  const pricePence = ticketType === 'paid' ? Math.round((Number(price.replace(/^£/, '')) || 0) * 100) : 0
  const previewEvent: EventRecord = {
    id: 'preview',
    organizer_id: userId,
    host_name: hostName || 'You',
    host_verified: false,
    title: title || 'Your event title',
    description: description || null,
    categories: categories.size ? Array.from(categories) : ['meetup'],
    starts_at: previewStart.toISOString(),
    ends_at: null,
    venue: venue || null,
    area: area || null,
    city: 'London',
    latitude: null,
    longitude: null,
    show_exact_location: exactPin,
    capacity: capacity || 1,
    ticket_type: pricePence > 0 ? 'paid' : 'free',
    price_pence: pricePence,
    currency: 'GBP',
    age_group: ageGroup,
    verified_host_onsite: verifiedHost,
    safe_space_accepted: safeSpace,
    image_url: imageUrl || null,
    perk: perk || null,
    is_featured: false,
    status: 'draft',
    rsvp_count: 0,
    created_at: '',
    updated_at: '',
  }

  return (
    <>
      <TopBar variant="back" title="Create Event" />

      <form action={formAction} className="flex flex-col relative w-full pt-16 pb-32 bg-surface min-h-screen max-w-lg mx-auto" noValidate={false}>
        <input ref={intentRef} type="hidden" name="intent" defaultValue="publish" />
        <input type="hidden" name="image_url" value={imageUrl} />
        <input type="hidden" name="capacity" value={capacity} />
        <input type="hidden" name="ticket_type" value={ticketType} />
        <input type="hidden" name="age_group" value={ageGroup} />
        {exactPin && <input type="hidden" name="show_exact_location" value="on" />}
        {Array.from(categories).map((c) => (
          <input key={c} type="hidden" name="categories" value={c} />
        ))}

        {/* Header */}
        <div className="px-space-md pt-space-sm pb-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Close"
              type="button"
              onClick={close}
              className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <span className="font-jakarta text-headline-sm text-on-surface">Create Weekend Event</span>
          </div>
          <DraftButton intentRef={intentRef} disabled={uploading} />
        </div>

        {/* Progress */}
        <div className="px-space-md py-space-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-inter text-label-sm text-primary uppercase tracking-wider">
              {done === essentials.length ? 'Ready to publish' : `${done} of ${essentials.length} essentials`}
            </span>
            <span className="font-inter text-label-md text-on-surface-variant font-semibold">Event Basics &amp; Details</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(done / essentials.length) * 100}%` }} />
          </div>
        </div>

        {state?.error && (
          <p role="alert" className="mx-space-md mt-space-sm p-3 rounded-xl bg-error-container text-on-error-container font-inter text-body-md flex gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-space-lg px-space-md mt-space-sm">
          {/* 1. Title */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <label className={`${labelClass} flex items-center gap-1`} htmlFor="title">
                Event Title <span className="text-secondary">*</span>
              </label>
              <span className="font-inter text-label-sm text-outline">{title.length}/70</span>
            </div>
            <input
              id="title"
              name="title"
              className={inputClass}
              maxLength={70}
              minLength={3}
              required
              placeholder="e.g., Underground Indie Showcase & Open Mic"
              value={title}
              onChange={(e) => touch(setTitle)(e.target.value)}
            />
            <FieldError message={fe.title} />
          </div>

          {/* 2. Description */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <label className={labelClass} htmlFor="description">
                What’s the vibe?
              </label>
              <span className="font-inter text-label-sm text-outline">{description.length}/2000</span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={2000}
              className={`${inputClass} resize-y`}
              placeholder="What will happen, what to bring, accessibility info…"
              value={description}
              onChange={(e) => touch(setDescription)(e.target.value)}
            />
            <FieldError message={fe.description} />
          </div>

          {/* 3. Cover photo */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className={labelClass}>Cover Visual</span>
              <span className="font-inter text-label-sm text-primary uppercase tracking-wide">16:9 Recommended</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_TYPES.join(',')}
              className="sr-only"
              aria-label="Upload cover photo"
              onChange={(e) => uploadImage(e.target.files?.[0])}
            />
            {imageUrl ? (
              <div className="relative w-full aspect-video rounded-DEFAULT overflow-hidden shadow-sm bg-surface-container-high">
                <Image src={imageUrl} alt="Cover photo preview" fill className="object-cover" unoptimized />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-1.5 rounded-full bg-surface-container-lowest/90 text-on-surface font-inter text-label-md shadow">
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('')
                      setDirty(true)
                    }}
                    className="px-3 py-1.5 rounded-full bg-surface-container-lowest/90 text-error font-inter text-label-md shadow"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload cover photo"
                onClick={() => !uploading && fileRef.current?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !uploading && fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  uploadImage(e.dataTransfer.files?.[0])
                }}
                className={`group relative w-full h-44 rounded-DEFAULT shadow-sm flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all overflow-hidden ${
                  dragOver ? 'bg-primary-fixed ring-2 ring-primary' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-2.5 transition-transform group-hover:scale-110">
                  <span className={`material-symbols-outlined text-[26px] ${uploading ? 'animate-spin' : ''}`}>
                    {uploading ? 'progress_activity' : 'add_photo_alternate'}
                  </span>
                </div>
                <p className="font-jakarta text-title-md text-on-surface mb-0.5">{uploading ? 'Uploading…' : 'Upload High-Res Cover'}</p>
                <p className="font-inter text-label-sm text-outline mb-3">JPG, PNG or WebP · up to 5 MB · optional</p>
                {!uploading && (
                  <span className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary font-inter text-label-md shadow-sm">Browse files</span>
                )}
              </div>
            )}
            <FieldError message={uploadError || fe.image_url} />
          </div>

          {/* 4. Category */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className={labelClass}>
                Category <span className="text-secondary">*</span>
              </span>
              <span className="font-inter text-label-sm text-outline">Select 1 or more</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map(([id, meta]) => {
                const selected = categories.has(id)
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleCategory(id)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-DEFAULT font-inter text-label-md active:scale-95 transition-all text-left ${
                      selected ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span>
                      {meta.label} {meta.emoji}
                    </span>
                    <span className={`material-symbols-outlined text-[18px] ${selected ? '' : 'opacity-0'}`}>check_circle</span>
                  </button>
                )
              })}
            </div>
            <FieldError message={fe.categories} />
          </div>

          {/* 5. Date & time */}
          <div className="flex flex-col gap-2.5">
            <span className={labelClass}>
              When is it happening? <span className="text-secondary">*</span>
            </span>
            <label className="bg-surface-container-lowest p-3.5 rounded-DEFAULT shadow-sm flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span className="font-inter text-label-sm uppercase tracking-wider font-bold">Date</span>
              </span>
              <input
                type="date"
                name="date"
                required
                min={minDate}
                max={maxDate}
                value={date}
                onChange={(e) => touch(setDate)(e.target.value)}
                className="bg-transparent font-jakarta text-title-md text-on-surface focus:outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="bg-surface-container-lowest p-3.5 rounded-DEFAULT shadow-sm flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span className="font-inter text-label-sm uppercase tracking-wider font-bold">Starts</span>
                </span>
                <input
                  type="time"
                  name="start_time"
                  required
                  value={startTime}
                  onChange={(e) => touch(setStartTime)(e.target.value)}
                  className="bg-transparent font-jakarta text-title-md text-on-surface focus:outline-none"
                />
              </label>
              <label className="bg-surface-container-lowest p-3.5 rounded-DEFAULT shadow-sm flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-secondary-container">
                  <span className="material-symbols-outlined text-[18px]">alarm_on</span>
                  <span className="font-inter text-label-sm uppercase tracking-wider font-bold">Ends</span>
                </span>
                <input
                  type="time"
                  name="end_time"
                  value={endTime}
                  onChange={(e) => touch(setEndTime)(e.target.value)}
                  className="bg-transparent font-jakarta text-title-md text-on-surface focus:outline-none"
                />
              </label>
            </div>
            <p className="font-inter text-label-sm text-outline font-medium">
              London time. An end time earlier than the start means it finishes after midnight.
            </p>
            <FieldError message={fe.when} />
          </div>

          {/* 6. Location */}
          <div className="flex flex-col gap-2.5">
            <label className={labelClass} htmlFor="venue">
              Where is the crowd gathering? <span className="text-secondary">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-primary text-[20px]">location_on</span>
              <input
                id="venue"
                name="venue"
                required
                minLength={3}
                maxLength={200}
                className={`${inputClass} pl-10`}
                placeholder="Venue name, landmark, or street address"
                value={venue}
                onChange={(e) => touch(setVenue)(e.target.value)}
              />
            </div>
            <FieldError message={fe.venue} />
            <input
              name="area"
              maxLength={40}
              aria-label="Area shown on event cards"
              className={inputClass}
              placeholder="Area shown on cards, e.g. Hackney, E8"
              value={area}
              onChange={(e) => touch(setArea)(e.target.value)}
            />
            <FieldError message={fe.area} />
            <div className="flex items-center justify-between p-3 rounded-DEFAULT bg-surface-container-low">
              <div className="flex flex-col">
                <span className="font-inter text-label-md text-on-surface">Show exact address</span>
                <span className="font-inter text-label-sm text-outline font-medium">Turn off to only show the area until people RSVP</span>
              </div>
              <button
                aria-checked={exactPin}
                aria-label="Show exact address"
                role="switch"
                type="button"
                onClick={() => touch(setExactPin)(!exactPin)}
                className={`w-10 h-6 flex-shrink-0 rounded-full relative p-0.5 transition-colors ${exactPin ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${exactPin ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* 7. Capacity & tickets */}
          <div className="flex flex-col gap-3">
            <span className={labelClass}>Capacity &amp; Ticketing</span>
            <div className="bg-surface-container-lowest p-3.5 rounded-DEFAULT shadow-sm flex items-center justify-between">
              <div>
                <span className="font-inter text-label-sm uppercase tracking-wider text-outline block">Spot Limit</span>
                <p className="font-jakarta text-title-md text-on-surface">attendees max</p>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-full">
                <button type="button" aria-label="Fewer spots" onClick={() => adjustCapacity(-10)} className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface active:scale-95 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <input
                  type="number"
                  aria-label="Capacity"
                  min={1}
                  max={10000}
                  value={capacity || ''}
                  onChange={(e) => touch(setCapacity)(Math.min(10000, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
                  className="w-14 bg-transparent text-center font-inter text-label-md text-on-surface font-bold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button type="button" aria-label="More spots" onClick={() => adjustCapacity(10)} className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>
            <FieldError message={fe.capacity} />

            <div className="bg-surface-container-lowest p-3.5 rounded-DEFAULT shadow-sm flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-full">
                {(['free', 'paid'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={ticketType === t}
                    onClick={() => touch(setTicketType)(t)}
                    className={`py-2 rounded-full font-inter text-label-md transition-all ${ticketType === t ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface'}`}
                  >
                    {t === 'free' ? 'Free Event' : 'Paid Ticket'}
                  </button>
                ))}
              </div>
              {ticketType === 'paid' && (
                <>
                  <label className="flex items-center justify-between pt-1">
                    <span className="font-inter text-label-md text-outline">Ticket Admission Price</span>
                    <span className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-DEFAULT">
                      <span className="font-jakarta text-title-md text-primary font-bold">£</span>
                      <input
                        name="price"
                        inputMode="decimal"
                        required
                        placeholder="10.00"
                        value={price}
                        onChange={(e) => touch(setPrice)(e.target.value)}
                        className="w-16 bg-transparent text-right font-jakarta text-title-md text-on-surface font-bold focus:outline-none"
                      />
                    </span>
                  </label>
                  <p className="font-inter text-label-sm text-outline font-medium">
                    Online ticket payments are coming soon. Until then, collect payment at the door.
                  </p>
                </>
              )}
              <FieldError message={fe.price} />
            </div>

            <input
              name="perk"
              maxLength={30}
              aria-label="Perk"
              className={inputClass}
              placeholder="Optional perk, e.g. Free pizza 🍕"
              value={perk}
              onChange={(e) => touch(setPerk)(e.target.value)}
            />
            <FieldError message={fe.perk} />
          </div>

          {/* 8. Host */}
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="host_name">
              Hosted by <span className="text-secondary">*</span>
            </label>
            <input
              id="host_name"
              name="host_name"
              required
              minLength={2}
              maxLength={60}
              className={inputClass}
              placeholder="Your name or your crew / organisation"
              value={hostName}
              onChange={(e) => touch(setHostName)(e.target.value)}
            />
            <FieldError message={fe.host_name} />
          </div>

          {/* 9. Age & safety */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={labelClass}>Target Age &amp; Safety</span>
              <span className="font-inter text-label-sm text-primary uppercase font-bold tracking-wide">Gen-Z Safe Badge</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((age) => (
                <button
                  key={age.id}
                  type="button"
                  aria-pressed={ageGroup === age.id}
                  onClick={() => touch(setAgeGroup)(age.id)}
                  className={`px-3.5 py-2 rounded-full font-inter text-label-md active:scale-95 transition-all ${
                    ageGroup === age.id ? 'bg-primary-fixed text-on-primary-fixed shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {age.label}
                </button>
              ))}
            </div>
            <div className="bg-surface-container-low p-3.5 rounded-DEFAULT flex flex-col gap-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="verified_host_onsite"
                  checked={verifiedHost}
                  onChange={(e) => touch(setVerifiedHost)(e.target.checked)}
                  className="mt-0.5 rounded w-4 h-4 accent-primary"
                />
                <span className="flex flex-col">
                  <span className="font-inter text-label-md text-on-surface font-bold">Verified host on-site</span>
                  <span className="font-inter text-label-sm text-outline">You or an authorized team liaison will manage check-in in person.</span>
                </span>
              </label>
              <div className="h-px bg-surface-container-highest w-full my-0.5" />
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="safe_space_accepted"
                  checked={safeSpace}
                  onChange={(e) => touch(setSafeSpace)(e.target.checked)}
                  className="mt-0.5 rounded w-4 h-4 accent-primary"
                />
                <span className="flex flex-col">
                  <span className="font-inter text-label-md text-on-surface font-bold">
                    Safe space guidelines accepted <span className="text-secondary">*</span>
                  </span>
                  <span className="font-inter text-label-sm text-outline">
                    Zero tolerance for harassment, hate speech, or unsafe crowd overcrowding.{' '}
                    <a href="/guidelines" target="_blank" className="text-primary underline">
                      Read guidelines
                    </a>
                  </span>
                </span>
              </label>
            </div>
            <FieldError message={fe.safety} />
          </div>
        </div>

        <ActionButtons intentRef={intentRef} onPreview={() => setPreviewOpen(true)} disabled={uploading} />
      </form>

      {/* Preview */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Event preview"
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-margin"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="w-full max-w-md bg-surface rounded-2xl p-4 flex flex-col gap-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-jakarta text-title-md text-on-surface">How it will look on Home</p>
              <button type="button" aria-label="Close preview" onClick={() => setPreviewOpen(false)} className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="pointer-events-none">
              <EventCard event={previewEvent} saved={false} onToggleSave={() => {}} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
