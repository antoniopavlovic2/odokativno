export const rules = {
  required: value =>
    !!value || 'Ovo polje je obavezno.',

  email: value =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
    'Unesi ispravnu e-mail adresu.',

  username: value =>
    (
      typeof value === 'string' &&
      /^[A-Za-z0-9_ČĆŽŠĐčćžšđ]{3,20}$/.test(value)
    ) ||
    'Koristi 3–20 slova, brojeva ili donjih crta.',

  password: value =>
    (
      typeof value === 'string' &&
      value.length >= 8
    ) ||
    'Lozinka mora imati najmanje 8 znakova.',
}