'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_META } from '@/lib/categories'
import { ageLabel, formatDayTime, formatPrice, percentFull, spotsLeft } from '@/lib/format'
import type { EventRecord } from '@/types/database'

interface EventCardProps {
  event: EventRecord
  large?: boolean
  saved: boolean
  onToggleSave: () => void
}

export default function EventCard({ event, large = false, saved, onToggleSave }: EventCardProps) {
  const category = event.categories[0] ? CATEGORY_META[event.categories[0]] : null
  const price = formatPrice(event)
  const isFree = price === 'Free'
  const left = spotsLeft(event)
  const full = percentFull(event)
  const soldOut = left === 0
  const almostFull = !soldOut && left <= 10
  const age = ageLabel(event.age_group)
  const href = `/events/${event.id}`

  return (
    <article className="bg-surface-container-lowest rounded-2xl p-3 shadow-md flex flex-col gap-3 relative transition-transform active:scale-[0.99]">
      {/* Makes the whole card clickable; buttons sit above it. */}
      <Link href={href} aria-label={event.title} className="absolute inset-0 z-[1] rounded-2xl" />

      <div className={`relative w-full ${large ? 'h-52' : 'h-44'} rounded-xl overflow-hidden bg-surface-container-high`}>
        {event.image_url ? (
          <Image src={event.image_url} alt={event.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container to-tertiary-container flex items-center justify-center text-6xl">
            {category?.emoji ?? '✨'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 right-14 flex flex-wrap gap-1.5 items-center">
          {category && (
            <span className="bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface font-inter text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>{category.emoji}</span> {category.label}
            </span>
          )}
          {isFree ? (
            <span className="bg-primary-fixed text-on-primary-fixed font-inter text-label-sm font-bold px-2.5 py-1 rounded-full">
              FREE ENTRY
            </span>
          ) : (
            <span className="bg-secondary-container text-on-secondary-container font-inter text-label-sm font-bold px-2.5 py-1 rounded-full shadow-sm">
              {price}
            </span>
          )}
          {event.is_featured && (
            <span className="bg-primary-container text-on-primary font-inter text-label-sm font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span> Featured
            </span>
          )}
          {age && (
            <span className="bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-inter text-label-sm font-semibold px-2 py-0.5 rounded-full">
              {age}
            </span>
          )}
          {almostFull && (
            <span className="bg-error-container text-on-error-container font-inter text-label-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error" /> {left} {left === 1 ? 'spot' : 'spots'} left
            </span>
          )}
        </div>

        {/* Save (heart) */}
        <button
          type="button"
          aria-label={saved ? `Unsave ${event.title}` : `Save ${event.title}`}
          aria-pressed={saved}
          onClick={onToggleSave}
          className={`absolute z-[2] top-2.5 right-2.5 w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center hover:bg-surface-container-lowest transition-all shadow-sm ${saved ? 'text-secondary-container' : 'text-on-surface'}`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
        </button>

        {/* Time & place */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 text-inverse-on-surface">
          <div className="flex items-center gap-1.5 font-inter text-label-sm bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full min-w-0">
            <span className="material-symbols-outlined text-[15px] text-tertiary-fixed-dim">schedule</span>
            <span className="whitespace-nowrap">{formatDayTime(event.starts_at)}</span>
            {event.area && (
              <>
                <span className="text-outline-variant">•</span>
                <span className="material-symbols-outlined text-[15px] text-secondary-fixed">place</span>
                <span className="truncate">{event.area}</span>
              </>
            )}
          </div>
          {soldOut ? (
            <span className="font-inter text-label-sm font-bold bg-error text-on-error px-2 py-0.5 rounded-full whitespace-nowrap">
              Sold out
            </span>
          ) : !isFree && full >= 50 ? (
            <span className="font-inter text-label-sm font-bold bg-secondary-container/90 text-on-secondary-container px-2 py-0.5 rounded-full whitespace-nowrap">
              {full}% Sold
            </span>
          ) : event.perk ? (
            <span className="font-inter text-label-sm bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              {event.perk}
            </span>
          ) : null}
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2 pt-0.5">
        <div>
          <h2 className="font-jakarta text-headline-sm text-on-surface tracking-tight">{event.title}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-inter text-label-md text-on-surface-variant font-medium">{event.host_name}</span>
            {event.host_verified && <span className="material-symbols-outlined text-primary text-[15px]">verified</span>}
            {event.venue && <span className="text-outline text-label-sm truncate">• {event.venue}</span>}
          </div>
          {event.description && !large && (
            <p className="font-jakarta text-body-md text-on-surface-variant mt-1 line-clamp-2">{event.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">group</span>
            <span className="font-inter text-label-sm text-on-surface-variant font-semibold">
              {event.rsvp_count} going
              {almostFull && <span className="text-error font-bold"> · Almost full</span>}
            </span>
          </div>
          <span
            className={`font-inter text-label-md px-4 py-2 rounded-full font-semibold ${
              soldOut
                ? 'bg-surface-container-high text-outline'
                : isFree
                  ? 'bg-surface-container-high text-on-surface'
                  : 'bg-primary text-on-primary'
            }`}
          >
            {soldOut ? 'Sold out' : isFree ? 'RSVP Free' : `Book ${price}`}
          </span>
        </div>
      </div>
    </article>
  )
}
