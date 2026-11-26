
export const GAME_TIMEZONE = 'Europe/Zagreb'

/**
 * Vraća današnji datum prema hrvatskom vremenu.
 * Format: YYYY-MM-DD
 */
export function getTodayDate(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: GAME_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)

  const year = parts.find(
    part => part.type === 'year'
  ).value

  const month = parts.find(
    part => part.type === 'month'
  ).value

  const day = parts.find(
    part => part.type === 'day'
  ).value

  return `${year}-${month}-${day}`
}

/**
 * Pretvara YYYY-MM-DD u čitljiv hrvatski datum.
 */
export function formatDate(dateString) {
  const date = new Date(
    `${dateString}T12:00:00Z`
  )

  return new Intl.DateTimeFormat('hr-HR', {
    timeZone: GAME_TIMEZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Provjerava je li datum današnji.
 */
export function isToday(dateString) {
  return dateString === getTodayDate()
}

/**
 * Provjerava je li datum u budućnosti.
 */
export function isFutureDate(dateString) {
  return dateString > getTodayDate()
}

/**
 * Provjerava je li datum u prošlosti.
 */
export function isPastDate(dateString) {
  return dateString < getTodayDate()
}
