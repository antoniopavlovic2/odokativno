export const rules = {
  required: value =>
    !!value || 'Ovo polje je obavezno.',

  email: value =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
    'Unesi ispravnu e-mail adresu.',

  username: value =>
    /^[\p{L}\p{N}_]{3,20}$/u.test(value) ||
    'Korisničko ime mora imati 3–20 slova, brojeva ili donjih crta.',

  password: value =>
    (typeof value === 'string' && value.length >= 8) ||
    'Lozinka mora imati najmanje 8 znakova.',
}