
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const questions = JSON.parse(
  fs.readFileSync(
    path.join(root, 'src/data/questions.json'),
    'utf8'
  )
)

const challenges = JSON.parse(
  fs.readFileSync(
    path.join(root, 'src/data/dailyChallenges.json'),
    'utf8'
  )
)

// ==========================================
// POMOĆNE FUNKCIJE
// ==========================================

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function validId(value) {
  return Number.isSafeInteger(value) && value > 0
}

function text(value) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

function sqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL'
  }

  if (typeof value === 'number') {
    assert(
      Number.isFinite(value),
      'Neispravna brojčana vrijednost.'
    )

    return String(value)
  }

  return "'" + String(value).replace(/'/g, "''") + "'"
}

function validDate(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false
  }

  const date = new Date(value + 'T00:00:00Z')

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  )
}

// ==========================================
// VALIDACIJA PITANJA
// ==========================================

assert(
  Array.isArray(questions) &&
  questions.length > 0,
  'questions.json nema pitanja.'
)

assert(
  Array.isArray(challenges) &&
  challenges.length > 0,
  'dailyChallenges.json nema izazova.'
)

const questionIds = new Set()
const challengeIds = new Set()
const challengeDates = new Set()
const categories = new Set()

questions.forEach(q => {
  assert(
    validId(q.id),
    'Neispravan ID pitanja.'
  )

  assert(
    !questionIds.has(q.id),
    'Duplicirani ID pitanja: ' + q.id
  )

  questionIds.add(q.id)

  assert(
    text(q.question),
    'Nedostaje tekst pitanja: ' + q.id
  )

  assert(
    text(q.category),
    'Nedostaje kategorija pitanja: ' + q.id
  )

  categories.add(text(q.category))

  assert(
    [q.answer, q.min, q.max, q.step]
      .every(Number.isFinite),
    'Neispravni brojevi: ' + q.id
  )

  assert(
    q.min < q.max,
    'Neispravan raspon: ' + q.id
  )

  assert(
    q.answer >= q.min &&
    q.answer <= q.max,
    'Odgovor nije unutar raspona: ' + q.id
  )

  assert(
    q.step > 0 &&
    q.step <= q.max - q.min,
    'Neispravan step: ' + q.id
  )
})

// ==========================================
// VALIDACIJA IZAZOVA
// ==========================================

challenges.forEach(c => {
  assert(
    validId(c.id),
    'Neispravan ID izazova.'
  )

  assert(
    !challengeIds.has(c.id),
    'Duplicirani ID izazova: ' + c.id
  )

  challengeIds.add(c.id)

  assert(
    validDate(c.date),
    'Neispravan datum: ' + c.date
  )

  assert(
    !challengeDates.has(c.date),
    'Duplicirani datum: ' + c.date
  )

  challengeDates.add(c.date)

  assert(
    Array.isArray(c.questionIds) &&
    c.questionIds.length === 7,
    'Izazov mora imati 7 pitanja: ' + c.id
  )

  assert(
    new Set(c.questionIds).size === 7,
    'Izazov sadrži ponovljena pitanja: ' + c.id
  )

  c.questionIds.forEach(id => {
    assert(
      questionIds.has(id),
      'Pitanje ne postoji: ' + id
    )
  })
})

// ==========================================
// GENERIRANJE SQL-A
// ==========================================

const sql = [
  'begin;',
  'set local standard_conforming_strings = on;',
]

// KATEGORIJE

categories.forEach(category => {
  sql.push(`
    insert into public.categories (name)
    values (${sqlValue(category)})
    on conflict (name) do nothing;
  `)
})

// PITANJA

questions.forEach(q => {
  sql.push(`
    insert into public.questions (
      id,
      category_id,
      question,
      answer,
      unit,
      unit_label,
      min_value,
      max_value,
      step,
      image_url,
      image_alt,
      explanation,
      source_url
    )
    values (
      ${sqlValue(q.id)},
      (
        select id
        from public.categories
        where name = ${sqlValue(text(q.category))}
      ),
      ${sqlValue(text(q.question))},
      ${sqlValue(q.answer)},
      ${sqlValue(text(q.unit))},
      ${sqlValue(text(q.unitLabel))},
      ${sqlValue(q.min)},
      ${sqlValue(q.max)},
      ${sqlValue(q.step)},
      ${sqlValue(text(q.image) || null)},
      ${sqlValue(text(q.imageAlt) || null)},
      ${sqlValue(text(q.explanation))},
      ${sqlValue(text(q.source) || null)}
    );
  `)
})

// DNEVNI IZAZOVI

challenges.forEach(challenge => {
  sql.push(`
    insert into public.daily_challenges (
      id,
      challenge_date
    )
    values (
      ${sqlValue(challenge.id)},
      ${sqlValue(challenge.date)}
    );
  `)

  challenge.questionIds.forEach((id, index) => {
    sql.push(`
      insert into public.daily_challenge_questions (
        challenge_id,
        question_id,
        position
      )
      values (
        ${sqlValue(challenge.id)},
        ${sqlValue(id)},
        ${index + 1}
      );
    `)
  })
})

// USKLAĐIVANJE AUTOMATSKIH ID-EVA

sql.push(`
  select setval(
    pg_get_serial_sequence(
      'public.questions',
      'id'
    ),
    coalesce(max(id), 1),
    count(*) > 0
  )
  from public.questions;
`)

sql.push(`
  select setval(
    pg_get_serial_sequence(
      'public.daily_challenges',
      'id'
    ),
    coalesce(max(id), 1),
    count(*) > 0
  )
  from public.daily_challenges;
`)

sql.push('commit;')

// ==========================================
// ISPIS REZULTATA
// ==========================================

process.stdout.write(sql.join('\n') + '\n')

console.error('SQL uspješno generiran!')
console.error('Pitanja: ' + questions.length)
console.error('Kategorije: ' + categories.size)
console.error('Izazovi: ' + challenges.length)
