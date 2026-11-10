'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'

const ORGANIZER_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-FujW3rpu9_msyWYvOEDOqEFppCGRPIm1bE2g-lkz6BKr-gHobZyzjitrTxBOlaWk8GU1hREqEH1LDyjkzqQwpEfJTg3uEqBiIs-03tItSgDcVvE8MfhVWqfQz_tp_3WS1Mhfnh5ZcwtV48I14i7tc3wqvSJ0rEEMiYzSSronKUiWhPpHVN5eBTBQWObzwafJHGW8vV-r6dkY83H5j3tRRfIqTTvILwTZCqctljrr'
const EVENT1_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR9TQosdNSIUg_Deajys6zfnMMonX_yAIWHcOXKQHpAfhS1FfPPcIPQXswViQRahi_xhc3hdjFIWdz7X7hPghwKUZsATUvy3D258-78HIysdZdpQPgkalQaMG6o4IODn-TiCEXKHoDEYCVMYWFtsxCbTyJ_QRlxTauZE-oa2BeIjpah0AhPAZIH7FZExyrd6KE1Mv6nKltKDYoBQr4iM1Xs_Zdln7sKWidPuKoVQV2'
const EVENT2_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg9myeYJBlT5rnNwYZs0OoWEc6SkeiAk_rUYA44WqSeGP9QaEnf72MCP0NFSImnJ4YDet2gLujtXVTr2d_zT88xDDrfX2tJVmh4nKqVO6GyCdgPuDPVSQSe1ep0leC37I3G2r3LP5vGql4CIatf0SDM-fv8maF35EZi-FJiy8961QxqnogX38kvaJ3nMw5Wws2-6IUrZ1SI-gXjS0OsWzWlvgFYir7zlgNQU3idBWT'

export default function OrganizerDashboard() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-on-surface font-inter">
      <TopBar variant="back" title="Organizer Dashboard" />

      <main className="pt-16 pb-10 max-w-lg mx-auto px-margin space-y-6">

        {/* ── 1. Organizer Profile Context ───────────────────────── */}
        <section className="pt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <Image
                src={ORGANIZER_AVATAR}
                alt="SubGround Sound avatar"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/30"
              />
              {/* Verified badge */}
              <span className="absolute bottom-0 right-0 w-7 h-7 bg-tertiary-container rounded-full flex items-center justify-center ring-2 ring-background">
                <span className="material-symbols-outlined text-on-tertiary-container text-[16px]">verified</span>
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="font-jakarta text-headline-sm text-on-surface tracking-tight truncate">SubGround Sound</h2>
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              </div>
              <p className="font-inter text-body-md text-on-surface-variant">Organizer Studio · 2 Live Events</p>
            </div>
          </div>
          {/* Youth View switch */}
          <button className="flex-shrink-0 h-9 px-3 bg-primary-container/20 border border-primary/30 rounded-full flex items-center gap-1.5 text-primary hover:bg-primary-container/40 transition-colors">
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span className="font-inter text-label-md font-semibold">Youth View</span>
          </button>
        </section>

        {/* ── 2. Create New Event Hero Banner ────────────────────── */}
        <section>
          <button
            onClick={() => router.push('/create-event')}
            className="w-full bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 text-left shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {/* Gen-Z Discovery Boost badge */}
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
              <span className="material-symbols-outlined text-on-primary text-[14px]">bolt</span>
              <span className="font-inter text-label-sm text-on-primary font-semibold">Gen-Z Discovery Boost</span>
            </span>
            <h3 className="font-jakarta text-headline-lg text-on-primary tracking-tight mb-1">+ Create New Event</h3>
            <p className="font-inter text-body-md text-on-primary/80">Launch parties, workshops, pop-ups, or gigs</p>
          </button>
        </section>

        {/* ── 3. Quick Stats 2×2 Bento Grid ──────────────────────── */}
        <section>
          <h3 className="font-jakarta text-headline-sm text-on-surface mb-3 tracking-tight">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Total RSVPs */}
            <div className="bg-surface-container-low rounded-2xl p-4">
              <p className="font-inter text-label-md text-on-surface-variant mb-1">Total RSVPs</p>
              <p className="font-jakarta text-headline-lg text-on-surface tracking-tight">342</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-tertiary-container text-[14px]">trending_up</span>
                <span className="font-inter text-label-sm text-tertiary-container">+28% vs last wk</span>
              </div>
            </div>
            {/* Ticket Sales */}
            <div className="bg-surface-container-low rounded-2xl p-4">
              <p className="font-inter text-label-md text-on-surface-variant mb-1">Ticket Sales</p>
              <p className="font-jakarta text-headline-lg text-on-surface tracking-tight">£2,840</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-primary text-[14px]">payments</span>
                <span className="font-inter text-label-sm text-on-surface-variant">This week</span>
              </div>
            </div>
            {/* Cap Filled */}
            <div className="bg-surface-container-low rounded-2xl p-4">
              <p className="font-inter text-label-md text-on-surface-variant mb-1">Cap Filled</p>
              <p className="font-jakarta text-headline-lg text-on-surface tracking-tight">94%</p>
              <div className="mt-2 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
            {/* Host Rating */}
            <div className="bg-surface-container-low rounded-2xl p-4">
              <p className="font-inter text-label-md text-on-surface-variant mb-1">Host Rating</p>
              <p className="font-jakarta text-headline-lg text-on-surface tracking-tight">4.9★</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-primary text-[14px]">verified_user</span>
                <span className="font-inter text-label-sm text-primary font-semibold">Youth Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Pacing & Demographics Chart ─────────────────────── */}
        <section className="bg-surface-container-low rounded-2xl p-5">
          <h3 className="font-jakarta text-headline-sm text-on-surface tracking-tight mb-4">Pacing &amp; Demographics</h3>

          {/* Bar chart */}
          <div className="flex items-end gap-3 mb-5 h-28">
            {/* Friday */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="font-inter text-label-sm text-on-surface-variant">88</span>
              <div className="w-full bg-primary/30 rounded-t-lg" style={{ height: '55%' }}>
                <div className="w-full h-full bg-primary rounded-t-lg opacity-70" />
              </div>
              <span className="font-inter text-label-sm text-on-surface-variant">Fri</span>
            </div>
            {/* Saturday – PEAK */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="font-inter text-label-sm text-on-surface-variant font-bold">194</span>
              <div className="relative w-full rounded-t-lg overflow-visible" style={{ height: '88%' }}>
                <div className="w-full h-full bg-primary rounded-t-lg" />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-inter text-label-sm text-primary font-bold whitespace-nowrap">PEAK</span>
              </div>
              <span className="font-inter text-label-sm text-on-surface-variant font-bold">Sat</span>
            </div>
            {/* Sunday */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="font-inter text-label-sm text-on-surface-variant">60</span>
              <div className="w-full bg-primary/30 rounded-t-lg" style={{ height: '40%' }}>
                <div className="w-full h-full bg-primary rounded-t-lg opacity-50" />
              </div>
              <span className="font-inter text-label-sm text-on-surface-variant">Sun</span>
            </div>
          </div>

          {/* Demographics bar */}
          <div>
            <p className="font-inter text-label-md text-on-surface-variant mb-2">Age Demographics</p>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-tertiary-container" style={{ width: '35%' }} />
              <div className="bg-primary" style={{ width: '65%' }} />
            </div>
            <div className="flex justify-between mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-tertiary-container inline-block" />
                <span className="font-inter text-label-sm text-on-surface-variant">16–18: 35%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                <span className="font-inter text-label-sm text-on-surface-variant">19–24: 65%</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Live & Upcoming Events ───────────────────────────── */}
        <section>
          <h3 className="font-jakarta text-headline-sm text-on-surface tracking-tight mb-3">Live &amp; Upcoming Events</h3>
          <div className="space-y-4">

            {/* Event 1 – Warehouse Indie & Electronic Night */}
            <div className="bg-surface-container-low rounded-2xl overflow-hidden">
              <div className="relative h-36 w-full">
                <Image src={EVENT1_IMG} alt="Warehouse Indie & Electronic Night" fill className="object-cover" />
                {/* TOMORROW badge */}
                <span className="absolute top-3 left-3 bg-secondary-container text-on-secondary-container font-inter text-label-sm font-bold px-3 py-1 rounded-full">
                  TOMORROW
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-jakarta text-title-md text-on-surface tracking-tight mb-1">Warehouse Indie &amp; Electronic Night</h4>
                {/* Capacity bar */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-inter text-label-sm text-on-surface-variant">142/160</span>
                  <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '88%' }} />
                  </div>
                  <span className="font-inter text-label-sm text-primary font-semibold">88% sold</span>
                </div>
                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 h-10 bg-primary text-on-primary rounded-xl font-inter text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                    Scan Tickets
                  </button>
                  <button className="flex-1 h-10 bg-surface-container-high text-on-surface rounded-xl font-inter text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined text-[18px]">campaign</span>
                    Broadcast
                  </button>
                </div>
              </div>
            </div>

            {/* Event 2 – Youth DJ Beginner Workshop */}
            <div className="bg-surface-container-low rounded-2xl overflow-hidden">
              <div className="relative h-36 w-full">
                <Image src={EVENT2_IMG} alt="Youth DJ Beginner Workshop" fill className="object-cover" />
                <span className="absolute top-3 left-3 bg-surface-container/90 backdrop-blur-sm text-on-surface font-inter text-label-sm font-bold px-3 py-1 rounded-full">
                  NEXT SAT
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-jakarta text-title-md text-on-surface tracking-tight mb-1">Youth DJ Beginner Workshop</h4>
                {/* Capacity bar */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-inter text-label-sm text-on-surface-variant">28/30</span>
                  <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-container rounded-full" style={{ width: '93%' }} />
                  </div>
                  <span className="font-inter text-label-sm text-secondary font-semibold">2 Spots Left</span>
                </div>
                {/* Action button */}
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 h-10 bg-surface-container-high text-on-surface rounded-xl font-inter text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                    Manage Event
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 6. Organizer Toolkit ────────────────────────────────── */}
        <section>
          <h3 className="font-jakarta text-headline-sm text-on-surface tracking-tight mb-3">Organizer Toolkit</h3>
          <div className="bg-surface-container-low rounded-2xl divide-y divide-outline-variant">

            {/* Attendee List & Check-in */}
            <button className="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-surface-container transition-colors first:rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">checklist</span>
                </div>
                <div className="text-left">
                  <p className="font-inter text-body-md font-semibold text-on-surface">Attendee List &amp; Check-in</p>
                  <p className="font-inter text-label-sm text-on-surface-variant">Manage entry &amp; scan QR codes</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
            </button>

            {/* Payouts & Banking */}
            <button className="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary-container text-[20px]">account_balance_wallet</span>
                </div>
                <div className="text-left">
                  <p className="font-inter text-body-md font-semibold text-on-surface">Payouts &amp; Banking</p>
                  <p className="font-inter text-label-sm text-on-surface-variant">View earnings &amp; payment history</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
            </button>

            {/* Community Safety Guidelines */}
            <button className="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-surface-container transition-colors last:rounded-b-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[20px]">shield</span>
                </div>
                <div className="text-left">
                  <p className="font-inter text-body-md font-semibold text-on-surface">Community Safety Guidelines</p>
                  <p className="font-inter text-label-sm text-on-surface-variant">Youth safety &amp; compliance docs</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
            </button>

          </div>
        </section>

        {/* ── 7. Host Support Card ────────────────────────────────── */}
        <section className="bg-surface-container rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
              <h3 className="font-jakarta text-title-md text-on-surface tracking-tight">Need door support tonight?</h3>
            </div>
            <p className="font-inter text-body-md text-on-surface-variant">Our host team is on standby 24/7</p>
          </div>
          <button className="flex-shrink-0 h-10 px-4 bg-primary text-on-primary rounded-xl font-inter text-label-md font-semibold hover:bg-primary/90 transition-colors">
            Contact
          </button>
        </section>

      </main>
    </div>
  )
}
