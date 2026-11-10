'use client'

import { useState } from 'react'
import Image from 'next/image'
import TopBar from '@/components/TopBar'

const CATEGORIES = [
  { id: 'music', label: 'Music 🎵' },
  { id: 'sports', label: 'Sports ⚽' },
  { id: 'arts', label: 'Arts & Design 🎨' },
  { id: 'volunteering', label: 'Volunteering 🤝' },
  { id: 'food', label: 'Food & Market 🍔' },
  { id: 'meetup', label: 'Meetup / Social 💡' },
]

const AGE_GROUPS = [
  { id: 'all', label: 'All Ages (16-24)' },
  { id: '16-18', label: '16–18 only' },
  { id: '18-24', label: '18–24 only (ID required)' },
]

const MAP_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAB5GWSxrJaP1JO1W_P0hsHUvvncVvvU_FfeET5oHNHHC-CJtpW3A0M0ryX1G7T5Vifm96RJe6wizor6w7r-t1GGEiubWZpmVerO6hu9mX1VIkAHTbJmHsGpK2NYQVVkw-aDtKtCgAMP_gWmpYxi-IsP8lKNb5O12R1qEECWRDqenCgDjEjc5_cEl6xjj5CxqN-6EEyAQ1Z2--jtTJFuVlN03HkEgxH6mXtWYxV9Q4s'

export default function CreateEventPage() {
  // Event Title
  const [eventTitle, setEventTitle] = useState('')

  // Categories
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['music']))

  // Location toggle
  const [exactPin, setExactPin] = useState(true)

  // Capacity
  const [capacity, setCapacity] = useState(150)

  // Ticket type: 'free' | 'paid'
  const [ticketType, setTicketType] = useState<'free' | 'paid'>('paid')

  // Price
  const [price, setPrice] = useState('10.00')

  // Age group
  const [selectedAge, setSelectedAge] = useState('all')

  // Safety checkboxes
  const [verifiedHost, setVerifiedHost] = useState(true)
  const [safeSpace, setSafeSpace] = useState(true)

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const adjustCapacity = (delta: number) => {
    setCapacity((prev) => Math.max(10, Math.min(1000, prev + delta)))
  }

  return (
    <>
      <TopBar variant="back" title="Event Details" />

      <main className="flex flex-col relative w-full pt-16 pb-32 bg-surface min-h-screen">
        <div className="flex flex-col w-full">

          {/* Organizer Action Header Sub-bar */}
          <div className="px-space-md pt-space-sm pb-space-xs flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="Close modal"
                className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-transform active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <span className="font-jakarta text-headline-sm text-on-surface">Create Weekend Event</span>
            </div>
            <button
              className="px-3 py-1.5 rounded-full bg-surface-container text-primary font-inter text-label-md hover:bg-primary-fixed transition-colors active:scale-95"
              type="button"
            >
              Save Draft
            </button>
          </div>

          {/* Progress Bar & Multi-step Indicator */}
          <div className="px-space-md py-space-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-inter text-label-sm text-primary uppercase tracking-wider">Step 1 of 3</span>
              </div>
              <span className="font-inter text-label-md text-on-surface-variant font-semibold">Event Basics &amp; Details</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500 w-1/3 shadow-sm"></div>
            </div>
          </div>

          {/* Form Body */}
          <form className="flex flex-col gap-space-lg px-space-md mt-space-sm" id="createEventForm">

            {/* 1. Event Title */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <label className="font-jakarta text-headline-sm text-on-surface flex items-center gap-1" htmlFor="eventTitle">
                  Event Title <span className="text-secondary">*</span>
                </label>
                <span className="font-inter text-label-sm text-outline">{eventTitle.length}/70</span>
              </div>
              <div className="relative">
                <input
                  id="eventTitle"
                  className="w-full px-4 py-3.5 rounded-DEFAULT bg-surface-container-low text-on-surface placeholder:text-outline font-jakarta text-body-md shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
                  maxLength={70}
                  placeholder="e.g., Underground Indie Showcase & Open Mic"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Cover Photo Uploader */}
            <div className="flex flex-col gap-2">
              <label className="font-jakarta text-headline-sm text-on-surface flex items-center justify-between">
                <span>Cover Visual</span>
                <span className="font-inter text-label-sm text-primary uppercase tracking-wide">16:9 Recommended</span>
              </label>
              <div
                className="group relative w-full h-44 rounded-DEFAULT bg-surface-container-lowest shadow-sm flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all hover:bg-surface-container-low overflow-hidden"
                id="dropZone"
              >
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-2.5 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-[26px]">add_photo_alternate</span>
                </div>
                <p className="font-jakarta text-title-md text-on-surface mb-0.5">Upload High-Res Cover</p>
                <p className="font-inter text-label-sm text-outline mb-3">Snap a vibe: festival neon, coffee room, or park jam</p>
                <button
                  className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary font-inter text-label-md shadow-sm active:scale-95 transition-transform"
                  type="button"
                >
                  Browse files
                </button>
              </div>
            </div>

            {/* 3. Category Selector */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="font-jakarta text-headline-sm text-on-surface">Category</label>
                <span className="font-inter text-label-sm text-outline">Select 1 or more</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.has(cat.id)
                  return (
                    <button
                      key={cat.id}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-DEFAULT font-inter text-label-md active:scale-95 transition-all text-left ${
                        isSelected
                          ? 'bg-primary-container text-on-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <span>{cat.label}</span>
                      <span className={`material-symbols-outlined text-[18px] ${isSelected ? '' : 'opacity-0'}`}>
                        check_circle
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 4. Date & Time Dual Cards */}
            <div className="flex flex-col gap-2.5">
              <label className="font-jakarta text-headline-sm text-on-surface">When is it happening?</label>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-surface-container-lowest p-3.5 rounded-DEFAULT shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-primary mb-2">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span className="font-inter text-label-sm uppercase tracking-wider font-bold">Starts</span>
                  </div>
                  <div>
                    <p className="font-jakarta text-title-md text-on-surface">Sat, Nov 1</p>
                    <p className="font-inter text-label-md text-outline">8:00 PM</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-3.5 rounded-DEFAULT shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-secondary-container mb-2">
                    <span className="material-symbols-outlined text-[18px]">alarm_on</span>
                    <span className="font-inter text-label-sm uppercase tracking-wider font-bold">Ends</span>
                  </div>
                  <div>
                    <p className="font-jakarta text-title-md text-on-surface">Sat, Nov 1</p>
                    <p className="font-inter text-label-md text-outline">11:30 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Location / Venue */}
            <div className="flex flex-col gap-2.5">
              <label className="font-jakarta text-headline-sm text-on-surface">Where is the crowd gathering?</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-primary text-[20px]">location_on</span>
                <input
                  className="w-full pl-10 pr-4 py-3.5 rounded-DEFAULT bg-surface-container-low text-on-surface font-jakarta text-body-md shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
                  placeholder="Venue name, landmark, or street address"
                  type="text"
                  defaultValue="Warehouse 9, Hackney Wick, London"
                />
              </div>

              {/* Mini Map preview */}
              <div
                className="w-full h-28 rounded-DEFAULT bg-cover bg-center shadow-sm relative overflow-hidden"
                style={{ backgroundImage: `url('${MAP_IMAGE_URL}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <div className="flex items-center gap-1.5 text-white">
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">near_me</span>
                    <span className="font-inter text-label-sm tracking-wide">0.8 miles from Hackney Central Overground</span>
                  </div>
                </div>
              </div>

              {/* In-person toggle row */}
              <div className="flex items-center justify-between p-3 rounded-DEFAULT bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-tertiary">check_box</span>
                  <span className="font-inter text-label-md text-on-surface">In-person weekend event</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-inter text-label-sm text-outline">Exact map pin</span>
                  <button
                    aria-checked={exactPin}
                    aria-label="Toggle exact map pin"
                    className={`w-10 h-6 rounded-full relative p-0.5 transition-colors ${exactPin ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    role="switch"
                    type="button"
                    onClick={() => setExactPin((v) => !v)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${exactPin ? 'translate-x-4' : 'translate-x-0'}`}
                    ></div>
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Capacity & Ticketing */}
            <div className="flex flex-col gap-3">
              <label className="font-jakarta text-headline-sm text-on-surface">Capacity &amp; Ticketing</label>

              {/* Capacity Stepper */}
              <div className="bg-surface-container-lowest p-3.5 rounded-DEFAULT shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-inter text-label-sm uppercase tracking-wider text-outline block">Spot Limit</span>
                  <p className="font-jakarta text-title-md text-on-surface">
                    <span>{capacity}</span> attendees max
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-full">
                  <button
                    className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface active:scale-95 shadow-sm"
                    type="button"
                    onClick={() => adjustCapacity(-10)}
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="font-inter text-label-md w-8 text-center text-on-surface font-bold">{capacity}</span>
                  <button
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 shadow-sm"
                    type="button"
                    onClick={() => adjustCapacity(10)}
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Ticket Type Selector & Price Input */}
              <div className="bg-surface-container-lowest p-3.5 rounded-DEFAULT shadow-sm flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-full">
                  <button
                    className={`py-2 rounded-full font-inter text-label-md transition-all ${
                      ticketType === 'free'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface'
                    }`}
                    type="button"
                    onClick={() => setTicketType('free')}
                  >
                    Free Event
                  </button>
                  <button
                    className={`py-2 rounded-full font-inter text-label-md transition-all ${
                      ticketType === 'paid'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface'
                    }`}
                    type="button"
                    onClick={() => setTicketType('paid')}
                  >
                    Paid Ticket
                  </button>
                </div>
                <div
                  className={`flex items-center justify-between pt-1 transition-opacity ${
                    ticketType === 'free' ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <span className="font-inter text-label-md text-outline">Ticket Admission Price</span>
                  <div className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-DEFAULT">
                    <span className="font-jakarta text-title-md text-primary font-bold">£</span>
                    <input
                      className="w-16 bg-transparent text-right font-jakarta text-title-md text-on-surface font-bold focus:outline-none"
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Target Age & Safety */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="font-jakarta text-headline-sm text-on-surface">Target Age &amp; Safety</label>
                <span className="font-inter text-label-sm text-primary uppercase font-bold tracking-wide">Gen-Z Safe Badge</span>
              </div>

              {/* Age Range Pills */}
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((age) => (
                  <button
                    key={age.id}
                    className={`px-3.5 py-2 rounded-full font-inter text-label-md active:scale-95 transition-all ${
                      selectedAge === age.id
                        ? 'bg-primary-fixed text-on-primary-fixed shadow-sm'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                    type="button"
                    onClick={() => setSelectedAge(age.id)}
                  >
                    {age.label}
                  </button>
                ))}
              </div>

              {/* Safety Checklist */}
              <div className="bg-surface-container-low p-3.5 rounded-DEFAULT flex flex-col gap-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    checked={verifiedHost}
                    className="mt-0.5 rounded w-4 h-4 accent-primary"
                    type="checkbox"
                    onChange={(e) => setVerifiedHost(e.target.checked)}
                  />
                  <div className="flex flex-col">
                    <span className="font-inter text-label-md text-on-surface font-bold">Verified host on-site</span>
                    <span className="font-inter text-label-sm text-outline">
                      You or an authorized team liaison will manage check-in in person.
                    </span>
                  </div>
                </label>
                <div className="h-px bg-surface-container-highest w-full my-0.5"></div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    checked={safeSpace}
                    className="mt-0.5 rounded w-4 h-4 accent-primary"
                    type="checkbox"
                    onChange={(e) => setSafeSpace(e.target.checked)}
                  />
                  <div className="flex flex-col">
                    <span className="font-inter text-label-md text-on-surface font-bold">Safe space guidelines accepted</span>
                    <span className="font-inter text-label-sm text-outline">
                      Zero tolerance for harassment, hate speech, or unsafe crowd overcrowding.
                    </span>
                  </div>
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Sticky Bottom Floating Action Bar */}
        <div className="fixed bottom-0 inset-x-0 bg-surface/90 backdrop-blur-md p-space-md shadow-xl flex items-center gap-space-sm z-40">
          <button
            className="w-1/3 py-3 rounded-full bg-surface-container-low text-on-surface font-inter text-label-md flex items-center justify-center gap-1 active:scale-95 transition-transform hover:bg-surface-container"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span>Preview</span>
          </button>
          <button
            className="w-2/3 py-3 rounded-full bg-primary-container text-on-primary font-jakarta text-headline-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            type="button"
          >
            <span>Publish Event</span>
            <span
              className="material-symbols-outlined text-[20px] text-secondary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </button>
        </div>
      </main>
    </>
  )
}
