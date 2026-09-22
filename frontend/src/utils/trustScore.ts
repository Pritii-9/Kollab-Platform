export function trustScoreColor(score: number): string {
  if (score >= 80) return '#10b981'   // emerald
  if (score >= 60) return '#f59e0b'   // amber
  if (score >= 40) return '#6366f1'   // indigo
  return '#f43f5e'                    // rose
}

export function trustScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Average'
  return 'Needs Work'
}

export function trustScoreBadgeClass(score: number): string {
  if (score >= 80) return 'badge-emerald'
  if (score >= 60) return 'badge-amber'
  if (score >= 40) return 'badge-indigo'
  return 'badge-rose'
}
