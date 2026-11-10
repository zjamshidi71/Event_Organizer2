'use client'

import { useState } from 'react'
import Image from 'next/image'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

const DAYS = [
  { key: 'fri', label: 'Fri', date: 'Oct 24', sub: '18 Events' },
  { key: 'sat', label: 'Sat', date: 'Oct 25', sub: 'Peak Vibes', isPeak: true },
  { key: 'sun', label: 'Sun', date: 'Oct 26', sub: '24 Events' },
]

const CATEGORIES = [
  { key: 'all', emoji: '⚡', label: 'All' },
  { key: 'music', emoji: '🎵', label: 'Music' },
  { key: 'sports', emoji: '⚽', label: 'Sports' },
  { key: 'arts', emoji: '🎨', label: 'Arts' },
  { key: 'volunteer', emoji: '🤝', label: 'Volunteer' },
  { key: 'free', emoji: '🎟️', label: 'Free' },
  { key: 'food', emoji: '🍔', label: 'Food & Markets' },
  { key: 'workshops', emoji: '💡', label: 'Workshops' },
]

const AVATAR_URLS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAFltAYICcBOzSGhjYITN7grOfhKyezCQY4Nlt8sBem04ZvjUbNGLKXvCNcA4mRYdduvpzIEJMHiuT8pQaS8pB_qv1zZnUBDKcJLRb2_QhsVHz55iu0J5StfxCGGOv0ngIUhENDvNQh8i3fuyFqc-c5j25NH_F8Ue2SJIFP2z01MrkFHlFyWt7kWKRbJkOgyQObolkfQm5tjQKxsW9bsV16ap8cDM-smhSFzVZjIEQn',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDmdmNMb95sUbnl29qdnOQGohxTpLWwL9O1WSryCPeGFflZ8Gnxd9TZoJ9FYpvPPVIy_hgS0_6bCv14RSgnooohQ9vOIMx9AsBw7S2XB6ZvIv6lH5sU1GLZ578ZTgtFP8-fzJwZoP9tEZP9Mkcwt3GssMjss_GMVwMScWqcE2p9f5tTtJ97AIEsXhI0dloaCmgpnQfw-lXXsg0K9EwcpQiSCuZc6smigbJc7u-9CNMk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBTqcS1ysG8a3_M1KQ8mHBVohmQOIzYDdHqcwGpC-f-0smPDhraX7UGAECQax6cg0rM14HE7NBQivMP2RDIZUu1lYAqko1AnyJ5yAAALBgxLeLAxQ4JZ0LslEnSklnJ9pQ9T2naeag0EUrqJJqQ_IDQqfltejZ6HEH4hWeO-MuSdogLCy7e_wI7S-cAOFAm502boL6gVwiQ6Pvo3cy1gU2exI2_WMp9nJ7XFAhruiXp',
]

export default function HomeFeedPage() {
  const [activeDay, setActiveDay] = useState('sat')
  const [activeCategory, setActiveCategory] = useState('all')
  const [saved, setSaved] = useState<Record<number, boolean>>({})

  const toggleSave = (idx: number) => {
    setSaved(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <>
      <TopBar variant="home" />
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-8">

          {/* Weekend Day Selector Section */}
          <section className="px-margin pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-0.5">London Happening Now</p>
                <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">This Weekend</h1>
              </div>
              <button aria-label="Filter city" className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface hover:bg-surface-container transition-colors shadow-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">near_me</span>
                <span className="font-label-md text-label-md">London</span>
                <span className="material-symbols-outlined text-outline text-[16px]">expand_more</span>
              </button>
            </div>

            {/* Day Pills */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Fri */}
              <button
                onClick={() => setActiveDay('fri')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl transition-all active:scale-[0.98] ${
                  activeDay === 'fri'
                    ? 'bg-primary-container text-on-primary shadow-lg shadow-primary-container/25 scale-[1.02]'
                    : 'bg-surface-container-lowest shadow-sm text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className={`font-label-sm text-label-sm uppercase tracking-wider ${activeDay === 'fri' ? 'text-on-primary-container' : 'text-outline'}`}>Fri</span>
                <span className={`font-title-md text-title-md font-bold mt-0.5 ${activeDay === 'fri' ? 'text-on-primary' : 'text-on-surface'}`}>Oct 24</span>
                <span className={`font-label-sm text-[10px] mt-0.5 ${activeDay === 'fri' ? 'text-on-primary font-semibold' : 'text-outline'}`}>18 Events</span>
              </button>

              {/* Sat (default active) */}
              <button
                onClick={() => setActiveDay('sat')}
                className={`relative flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl transition-all active:scale-[0.98] ${
                  activeDay === 'sat'
                    ? 'bg-primary-container text-on-primary shadow-lg shadow-primary-container/25 scale-[1.02]'
                    : 'bg-surface-container-lowest shadow-sm text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {activeDay === 'sat' && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-secondary-container flex items-center justify-center ring-2 ring-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-surface"></span>
                  </div>
                )}
                <span className={`font-label-sm text-label-sm uppercase tracking-wider ${activeDay === 'sat' ? 'text-on-primary-container' : 'text-outline'}`}>Sat</span>
                <span className={`font-title-md text-title-md font-bold mt-0.5 ${activeDay === 'sat' ? 'text-on-primary' : 'text-on-surface'}`}>Oct 25</span>
                {activeDay === 'sat' ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                    <span className="font-label-sm text-[10px] text-on-primary font-semibold">Peak Vibes</span>
                  </div>
                ) : (
                  <span className="font-label-sm text-[10px] text-outline mt-0.5">Peak Vibes</span>
                )}
              </button>

              {/* Sun */}
              <button
                onClick={() => setActiveDay('sun')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl transition-all active:scale-[0.98] ${
                  activeDay === 'sun'
                    ? 'bg-primary-container text-on-primary shadow-lg shadow-primary-container/25 scale-[1.02]'
                    : 'bg-surface-container-lowest shadow-sm text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className={`font-label-sm text-label-sm uppercase tracking-wider ${activeDay === 'sun' ? 'text-on-primary-container' : 'text-outline'}`}>Sun</span>
                <span className={`font-title-md text-title-md font-bold mt-0.5 ${activeDay === 'sun' ? 'text-on-primary' : 'text-on-surface'}`}>Oct 26</span>
                <span className={`font-label-sm text-[10px] mt-0.5 ${activeDay === 'sun' ? 'text-on-primary font-semibold' : 'text-outline'}`}>24 Events</span>
              </button>
            </div>
          </section>

          {/* Category Horizontal Chips Carousel */}
          <section className="mt-2 mb-4">
            <div className="flex items-center gap-2 overflow-x-auto px-margin no-scrollbar py-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md shadow-sm active:scale-95 transition-all flex items-center gap-1.5 ${
                    activeCategory === cat.key
                      ? 'bg-on-background text-on-primary'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Feed Section */}
          <section className="px-margin flex flex-col gap-4">

            {/* Quick Social Proof Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">group</span>
                <p className="font-body-md text-body-md text-on-surface">
                  <span className="font-bold text-primary">312 peers</span> active nearby tonight
                </p>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold">Trending</span>
            </div>

            {/* CARD 1: Featured Hero - Warehouse Indie & Electronic Night */}
            <article className="bg-surface-container-lowest rounded-2xl p-3 shadow-md flex flex-col gap-3 group relative transition-transform active:scale-[0.99]">
              <div className="relative w-full h-52 rounded-xl overflow-hidden bg-surface-container-high">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuvFzkr2owLVW9PwiQC09HFaENHFR0pog4T-MtkOtT7GAt7nG0o9_-es6JhOQLF-x0dww_nWotzdCZbWaiVnYnEWWUNpTK1685Yomlncc91jqDA3-a-_E_Q0ICgG2MzWBBOLRqPB_PvhIPfwt48floxDjA3AvUuDCORZjLJNy9r9mMLaoG5z_sasB_qmADT_nOM35W5-FbGeGtEqLiP-XSELBB9wP8C7DxxiFqDsu0"
                  alt="Energetic youth indie music concert inside a converted industrial London warehouse"
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/30"></div>
                {/* Badges Overlay */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
                  <span className="bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span>🎵</span> Music
                  </span>
                  <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-full shadow-sm">
                    £12
                  </span>
                  <span className="bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span> Featured
                  </span>
                </div>
                {/* Heart Save Button */}
                <button
                  aria-label="Save Warehouse Indie Night"
                  onClick={e => { e.stopPropagation(); toggleSave(0) }}
                  className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center hover:bg-surface-container-lowest transition-all shadow-sm ${saved[0] ? 'text-secondary-container' : 'text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                {/* Distance & Time Tag */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-inverse-on-surface">
                  <div className="flex items-center gap-1.5 font-label-sm text-label-sm bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[15px] text-tertiary-fixed-dim">schedule</span>
                    <span>Sat 9:00 PM</span>
                    <span className="text-outline-variant">•</span>
                    <span className="material-symbols-outlined text-[15px] text-secondary-fixed">place</span>
                    <span>0.8 mi away</span>
                  </div>
                  <span className="font-label-sm text-label-sm font-bold bg-secondary-container/90 text-on-secondary-container px-2 py-0.5 rounded-full">85% Sold</span>
                </div>
              </div>
              {/* Card Content */}
              <div className="flex flex-col gap-2 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Warehouse Indie &amp; Electronic Night</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">SubGround Sound</span>
                      <span className="material-symbols-outlined text-primary text-[15px]">verified</span>
                      <span className="text-outline text-label-sm">• E1 London</span>
                    </div>
                  </div>
                </div>
                {/* Attendees & CTA Row */}
                <div className="flex items-center justify-between pt-2 mt-1">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 overflow-hidden">
                      {AVATAR_URLS.map((url, i) => (
                        <Image
                          key={i}
                          src={url}
                          alt={`Attendee ${i + 1}`}
                          width={28}
                          height={28}
                          className="inline-block h-7 w-7 rounded-full object-cover"
                          unoptimized
                        />
                      ))}
                    </div>
                    <span className="ml-2 font-label-sm text-label-sm text-on-surface-variant font-semibold">142 youth going</span>
                  </div>
                  <button className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-full hover:bg-primary-container transition-colors shadow-sm active:scale-95">
                    Grab Ticket
                  </button>
                </div>
              </div>
            </article>

            {/* CARD 2: Sunset 3v3 Street Basketball Tournament */}
            <article className="bg-surface-container-lowest rounded-2xl p-3 shadow-md flex flex-col gap-3 group relative transition-transform active:scale-[0.99]">
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container-high">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn3T7KDlAfvniF_UEsUw8XRTC05RkuB1DYlbRA3GIZej09FBhdNHBELRYsjmhDHE4gkORmfIO-D0xvs7OBJl7s5JFULiWfkD5zrGox9uYeUHwEVf4uVDaUVeldlMpLtkNKg_uA9iD9Ea2ALJjimhkLIzBZAPwcQF_sfPZYuj4Zxk1EM_0bmnCBTcAw3pnTzpnFQ0uAzrQ3wDPITz-TBbjYjzfq7GW9CCe0y9dpURMN"
                  alt="Vibrant outdoor urban basketball court at sunset in London with teens playing 3v3"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/30"></div>
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
                  <span className="bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span>⚽</span> Sports
                  </span>
                  <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-full">
                    FREE ENTRY
                  </span>
                  <span className="bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded-full">
                    Ages 16–22
                  </span>
                </div>
                <button
                  aria-label="Save Basketball Tournament"
                  onClick={e => { e.stopPropagation(); toggleSave(1) }}
                  className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center hover:bg-surface-container-lowest transition-all shadow-sm ${saved[1] ? 'text-secondary-container' : 'text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-inverse-on-surface">
                  <div className="flex items-center gap-1.5 font-label-sm text-label-sm bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[15px] text-tertiary-fixed-dim">schedule</span>
                    <span>Sat 2:00 PM</span>
                    <span className="text-outline-variant">•</span>
                    <span className="material-symbols-outlined text-[15px] text-secondary-fixed">place</span>
                    <span>1.4 mi away</span>
                  </div>
                  <span className="font-label-sm text-label-sm bg-surface-container-high/90 text-on-surface px-2 py-0.5 rounded-full font-medium">Open Squads</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-0.5">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Sunset 3v3 Street Basketball Tournament</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Showcase your squad or join solo. DJ set, hydration station &amp; prizes.</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold text-[11px]">🏀</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">86 ballers registered</span>
                  </div>
                  <button className="bg-surface-container-high text-on-surface font-label-md text-label-md px-4 py-2 rounded-full hover:bg-surface-container-highest transition-colors active:scale-95 font-semibold">
                    RSVP Free
                  </button>
                </div>
              </div>
            </article>

            {/* CARD 3: Canal Clean-Up & Pizza Picnic */}
            <article className="bg-surface-container-lowest rounded-2xl p-3 shadow-md flex flex-col gap-3 group relative transition-transform active:scale-[0.99]">
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container-high">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-p0jfy722Hz6L02eQ6PT1fmky6hzRPeiYUA0vR7l34JMnDJXRNucpvUvr3b8u0-8jMB5ulejSvZBVxRvs4lrm6Dw3LrNKu2LFu9KxpGP_5Oq14OuhsvI4RicEkSKZI1Z8gtGtRcXrYpc2_p8fqDs3eJQ9NM-ur1xM5k467yPMallJ-kKJ7EX5Z9OujHkzV5xzKN4ktpEuO9V28CaI52QsxGUMd-3qFqhLo7nBT-Ca"
                  alt="Group of diverse young volunteers by a sunlit urban water canal in London"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/30"></div>
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
                  <span className="bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span>🤝</span> Volunteer
                  </span>
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-full">
                    Free + Lunch Included
                  </span>
                </div>
                <button
                  aria-label="Save Canal Clean-up"
                  onClick={e => { e.stopPropagation(); toggleSave(2) }}
                  className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center hover:bg-surface-container-lowest transition-all shadow-sm ${saved[2] ? 'text-secondary-container' : 'text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-inverse-on-surface">
                  <div className="flex items-center gap-1.5 font-label-sm text-label-sm bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[15px] text-tertiary-fixed-dim">schedule</span>
                    <span>Sat 11:00 AM</span>
                    <span className="text-outline-variant">•</span>
                    <span className="material-symbols-outlined text-[15px] text-secondary-fixed">place</span>
                    <span>2.1 mi away</span>
                  </div>
                  <span className="font-label-sm text-label-sm bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full font-medium">Free Slices 🍕</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-0.5">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-label-sm text-label-sm text-primary font-bold">GreenRoots Youth</span>
                    <span className="material-symbols-outlined text-primary text-[14px]">eco</span>
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Canal Clean-Up &amp; Pizza Picnic</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Protect Hackney&apos;s water birds, pick litter with new mates, then demolish sourdough wood-fired pizza.</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">volunteer_activism</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">45 volunteers going</span>
                  </div>
                  <button className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-full hover:bg-primary-container transition-colors active:scale-95 font-semibold">
                    Join In
                  </button>
                </div>
              </div>
            </article>

            {/* CARD 4: Analog Film Photography & Zine Workshop */}
            <article className="bg-surface-container-lowest rounded-2xl p-3 shadow-md flex flex-col gap-3 group relative transition-transform active:scale-[0.99]">
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container-high">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhIrFlAEv5_XoIaNHyhdLDChVBzs-jsUZNyepFx27PxMYU52_8GSHUCDIaiiaOOO6S5sYwpcZCXTlxVqVZyij4Dx3z5dKn2LQwytrfYbClLNBlX06I8mQ-6VB-4lC0FqZcXe3OJQeeDYpHz6RAI4OVGuc6m8NxeXqBhQ7_PtK2pUa5ei6qPWZV5W5KAmsFP3dX6KcL03vchu9_vTAasPKsokbYVBEYIcH9Qx6yf7ri"
                  alt="Hands of creative young art students assembling an aesthetic DIY collage zine around vintage 35mm cameras"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/30"></div>
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
                  <span className="bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span>🎨</span> Arts
                  </span>
                  <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-full shadow-sm">
                    £8
                  </span>
                  <span className="bg-error-container text-on-error-container font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span> 4 spots left
                  </span>
                </div>
                <button
                  aria-label="Save Photography Workshop"
                  onClick={e => { e.stopPropagation(); toggleSave(3) }}
                  className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center hover:bg-surface-container-lowest transition-all shadow-sm ${saved[3] ? 'text-secondary-container' : 'text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-inverse-on-surface">
                  <div className="flex items-center gap-1.5 font-label-sm text-label-sm bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[15px] text-tertiary-fixed-dim">schedule</span>
                    <span>Sat 3:30 PM</span>
                    <span className="text-outline-variant">•</span>
                    <span className="material-symbols-outlined text-[15px] text-secondary-fixed">place</span>
                    <span>0.5 mi away</span>
                  </div>
                  <span className="font-label-sm text-label-sm bg-surface-container-high/90 text-on-surface px-2 py-0.5 rounded-full font-medium">Darkroom Lab</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-0.5">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Analog Film Photography &amp; Zine Workshop</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Bring your prints or negatives. Free paper stock, photocopiers &amp; riso color drums included.</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-outline text-[18px]">photo_camera</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      24 going · <span className="text-error font-bold">Almost full</span>
                    </span>
                  </div>
                  <button className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-full hover:bg-primary-container transition-colors active:scale-95 font-semibold">
                    Book £8
                  </button>
                </div>
              </div>
            </article>

          </section>

          {/* Discovery Footer */}
          <section className="mt-6 px-margin text-center">
            <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">That&apos;s your live Saturday preview!</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">New youth-organized pop-ups and student gigs are verified every 30 minutes.</p>
              <button className="mt-1 px-5 py-2.5 rounded-full bg-surface-container-highest text-primary font-label-md text-label-md font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95">
                Check Sunday Lineup
              </button>
            </div>
          </section>

        </div>
      </main>
      <BottomNav />
    </>
  )
}
