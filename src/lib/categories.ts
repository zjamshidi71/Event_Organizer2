import type { Category } from '@/types/database'

export const CATEGORY_META: Record<Category, { emoji: string; label: string }> = {
  music: { emoji: '🎵', label: 'Music' },
  sports: { emoji: '⚽', label: 'Sports' },
  arts: { emoji: '🎨', label: 'Arts' },
  volunteer: { emoji: '🤝', label: 'Volunteer' },
  food: { emoji: '🍔', label: 'Food & Markets' },
  workshops: { emoji: '💡', label: 'Workshops' },
  meetup: { emoji: '👋', label: 'Meetup' },
}
