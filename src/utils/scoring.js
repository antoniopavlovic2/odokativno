
export const MAX_POINTS_PER_QUESTION = 100

/**
 * Provjerava je li odabrani raspon valjan.
 */
export function isValidRange(range, min, max) {
  if (!Array.isArray(range) || range.length !== 2) {
    return false
  }

  const [lower, upper] = range

  return (
    Number.isFinite(min) &&
    Number.isFinite(max) &&
    Number.isFinite(lower) &&
    Number.isFinite(upper) &&
    max > min &&
    lower >= min &&
    upper <= max &&
    lower <= upper
  )
}

/**
 * Računa potencijalne bodove prije potvrde odgovora.
 */
export function calculatePotentialPoints(
  range,
  min,
  max
) {
  if (!isValidRange(range, min, max)) {
    return 0
  }

  const [lower, upper] = range

  const selectedWidth = upper - lower
  const totalWidth = max - min

  const precision = 1 - selectedWidth / totalWidth

  return Math.max(
    1,
    Math.min(
      MAX_POINTS_PER_QUESTION,
      Math.round(
        precision * MAX_POINTS_PER_QUESTION
      )
    )
  )
}

/**
 * Provjerava nalazi li se odgovor unutar raspona.
 */
export function isCorrectAnswer(answer, range) {
  if (
    !Number.isFinite(answer) ||
    !Array.isArray(range) ||
    range.length !== 2 ||
    !range.every(Number.isFinite)
  ) {
    return false
  }

  return (
    answer >= range[0] &&
    answer <= range[1]
  )
}

/**
 * Računa stvarno osvojene bodove.
 */
export function calculateScore(question, range) {
  if (
    !isValidRange(
      range,
      question.min,
      question.max
    )
  ) {
    return 0
  }

  if (!isCorrectAnswer(question.answer, range)) {
    return 0
  }

  return calculatePotentialPoints(
    range,
    question.min,
    question.max
  )
}

/**
 * Računa maksimalan rezultat izazova.
 */
export function calculateMaxScore(totalQuestions) {
  return totalQuestions * MAX_POINTS_PER_QUESTION
}
