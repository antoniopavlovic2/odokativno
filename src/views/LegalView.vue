
<template>
  <div class="legal-page">
    <v-container class="legal-container">
      <header class="legal-header">
        <div class="legal-icon">
          <v-icon
            :icon="isPrivacy
              ? 'mdi-shield-check-outline'
              : 'mdi-file-document-outline'"
            size="36"
          />
        </div>

        <h1>{{ pageTitle }}</h1>

        <p>{{ pageSubtitle }}</p>

        <span class="updated-label">
          Zadnje ažuriranje: {{ legal.updatedAt }}
        </span>
      </header>

      <article class="legal-card">

        <!-- POLITIKA PRIVATNOSTI -->

        <template v-if="isPrivacy">
          <section>
            <h2>1. Voditelj obrade</h2>

            <p>
              ODOKATIVNO. je besplatni dnevni
              online kviz procjenjivanja.
            </p>

            <p>
              Voditelj obrade: {{ legal.operator }}<br>
              Adresa: {{ legal.address }}<br>
              Kontakt:
              <a :href="'mailto:' + legal.email">
                {{ legal.email }}
              </a>
            </p>
          </section>

          <section>
            <h2>2. Koje podatke obrađujemo?</h2>

            <p>
              Igru možeš igrati bez registracije.
              Za kreiranje korisničkog računa
              obrađujemo sljedeće podatke:
            </p>

            <ul>
              <li>E-mail adresu.</li>
              <li>Korisničko ime.</li>
              <li>Jedinstveni identifikator korisnika.</li>
              <li>Datum registracije i potvrde e-maila.</li>
              <li>Podatke potrebne za autentifikaciju.</li>
            </ul>

            <p>
              Lozinke obrađuje Supabase Auth u
              kriptografski zaštićenom obliku.
              Nemamo pristup tvojoj izvornoj lozinci.
            </p>

            <p>
              Pri korištenju stranice mogu se obrađivati
              i tehnički podaci poput IP adrese,
              podataka o pregledniku i zapisa pristupa.
            </p>

            <p>
              Prilikom sigurnosne provjere putem
              Cloudflare Turnstilea mogu se obrađivati
              IP adresa, tehnički podaci o pregledniku
              i sigurnosni signali uređaja potrebni
              za razlikovanje stvarnih korisnika
              od automatiziranih zahtjeva.
            </p>
          </section>

          <section>
            <h2>3. Svrha i pravna osnova obrade</h2>

            <p>Podatke obrađujemo radi:</p>

            <ul>
              <li>Kreiranja i održavanja računa.</li>
              <li>Prijave i autentifikacije.</li>
              <li>Potvrde e-mail adrese.</li>
              <li>Obnove zaboravljene lozinke.</li>
              <li>Odgovaranja na korisničke zahtjeve.</li>
              <li>Sigurnosti i sprječavanja zlouporabe.</li>
              <li>Sprječavanja automatiziranih registracija.</li>
              <li>Zaštite od botova i neželjenih zahtjeva.</li>
            </ul>

            <p>
              Obrada potrebna za pružanje korisničkog
              računa temelji se na članku 6. stavku 1.
              točki (b) GDPR-a.
            </p>

            <p>
              Obrada nužna za sigurnost usluge,
              zaštitu od botova i sprječavanje
              zlouporabe temelji se na legitimnom
              interesu prema članku 6. stavku 1.
              točki (f) GDPR-a.
            </p>

            <p>
              Ako ne želiš dostaviti podatke potrebne
              za registraciju, možeš nastaviti
              igrati kao gost.
            </p>
          </section>

          <section>
            <h2>4. Vanjski pružatelji usluga</h2>

            <p>
              Za funkcioniranje aplikacije koristimo
              sljedeće vanjske pružatelje usluga:
            </p>

            <ul>
              <li>
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase
                </a>
                – autentifikacija korisnika
                i baza podataka.
              </li>

              <li>
                <a
                  href="https://www.netlify.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Netlify
                </a>
                – hosting i isporuka web-aplikacije.
              </li>

              <li>
                <a
                  href="https://www.brevo.com/legal/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Brevo
                </a>
                – slanje transakcijskih e-mailova,
                uključujući potvrdu registracije
                i obnovu lozinke.
              </li>

              <li>
                <a
                  href="https://www.cloudflare.com/turnstile-privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cloudflare Turnstile
                </a>
                – sigurnosna provjera namijenjena
                razlikovanju stvarnih korisnika
                od automatiziranih zahtjeva te
                sprječavanju neželjenih registracija,
                pokušaja prijave i drugih zlouporaba.
              </li>
            </ul>

            <p>
              Navedeni pružatelji obrađuju podatke
              potrebne za pružanje svojih usluga.
            </p>
          </section>

          <!-- CLOUDFLARE TURNSTILE -->

          <section>
            <h2>5. Sigurnosna provjera i zaštita od botova</h2>

            <p>
              ODOKATIVNO. koristi Cloudflare Turnstile
              radi zaštite korisničkih računa,
              autentifikacijskog sustava i infrastrukture
              od automatiziranih zahtjeva i zlouporaba.
            </p>

            <p>
              Sigurnosna provjera primjenjuje se
              prilikom:
            </p>

            <ul>
              <li>Registracije korisničkog računa.</li>
              <li>Prijave na korisnički račun.</li>
              <li>Zahtjeva za obnovu lozinke.</li>
              <li>Zahtjeva za brisanje računa.</li>
            </ul>

            <p>
              Cloudflare Turnstile analizira tehničke
              i sigurnosne signale kako bi procijenio
              je li zahtjev poslala stvarna osoba
              ili automatizirani sustav.
            </p>

            <p>
              Ovu provjeru koristimo radi sigurnosti,
              a ne za personalizirano oglašavanje
              ili marketinško profiliranje korisnika.
            </p>

            <p>
              Sigurnosna provjera nije potrebna
              za uobičajeno igranje dnevnog kviza
              bez korisničkog računa.
            </p>

            <p>
              Više informacija o obradi podataka
              dostupno je u
              <a
                href="https://www.cloudflare.com/turnstile-privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cloudflare Turnstile politici privatnosti
              </a>.
            </p>
          </section>

          <section>
            <h2>6. Međunarodni prijenos podataka</h2>

            <p>{{ legal.transfers }}</p>
          </section>

          <section>
            <h2>7. Koliko dugo čuvamo podatke?</h2>

            <p>
              Podatke aktivnog korisničkog računa
              čuvamo dok je račun potreban za
              pružanje usluge, odnosno do
              njegova brisanja.
            </p>

            <p>{{ legal.retention }}</p>

            <p>
              Određene podatke možemo zadržati
              kada to zahtijeva zakon ili kada
              su nužni za ostvarivanje ili obranu
              pravnih zahtjeva.
            </p>
          </section>

          <section>
            <h2>8. Kolačići i lokalna pohrana</h2>

            <p>
              Aplikacija koristi lokalnu pohranu
              preglednika (LocalStorage) za
              pamćenje postavke zvuka i održavanje
              korisničke sesije.
            </p>

            <p>
              Cloudflare Turnstile može koristiti
              tehnologije preglednika potrebne za
              izvršavanje sigurnosne provjere
              i sprječavanje zlouporabe.
            </p>

            <p>
              Navedene funkcionalnosti koristimo
              radi omogućavanja rada aplikacije,
              održavanja korisničke sesije i
              sigurnosti korisničkih računa.
            </p>

            <p>
              Lokalne podatke možeš ukloniti
              kroz postavke svojeg preglednika.
              Time se neće automatski obrisati
              korisnički račun u bazi.
            </p>

            <p>
              Onemogućavanje određenih tehnologija
              preglednika može utjecati na mogućnost
              prijave, registracije ili korištenja
              drugih funkcionalnosti računa.
            </p>

            <p>{{ legal.tracking }}</p>
          </section>

          <section>
            <h2>9. Tvoja prava</h2>

            <p>
              Ovisno o okolnostima obrade,
              imaš pravo na:
            </p>

            <ul>
              <li>Pristup osobnim podacima.</li>
              <li>Ispravak netočnih podataka.</li>
              <li>Brisanje podataka.</li>
              <li>Ograničenje obrade.</li>
              <li>Prenosivost podataka.</li>
              <li>Prigovor na obradu.</li>
              <li>
                Povlačenje privole kada se obrada
                na njoj temelji.
              </li>
            </ul>

            <p>
              Za ostvarivanje prava kontaktiraj nas na
              <a :href="'mailto:' + legal.email">
                {{ legal.email }}
              </a>.
            </p>

            <p>
              Na zahtjeve odgovaramo bez nepotrebnog
              odgađanja, u rokovima propisanim
              primjenjivim propisima o zaštiti
              osobnih podataka.
            </p>

            <p>
              Imaš pravo podnijeti pritužbu Agenciji
              za zaštitu osobnih podataka (AZOP):
              <a
                href="https://azop.hr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                azop.hr
              </a>.
            </p>
          </section>

          <section>
            <h2>10. Brisanje računa</h2>

            <p>
              Svoj korisnički račun možeš
              trajno obrisati u bilo kojem trenutku
              putem stranice Moj profil.
            </p>

            <p>
              Unutar korisničkog profila nalazi se
              odjeljak za upravljanje računom
              s mogućnošću trajnog brisanja.
            </p>

            <p>
              Radi sigurnosti potrebno je potvrditi
              identitet unosom trenutne lozinke,
              izvršiti sigurnosnu provjeru i potvrditi
              zahtjev za brisanje.
            </p>

            <p>
              Brisanjem računa uklanjaju se korisnički
              račun i povezani profil iz aktivne baze,
              uz moguće iznimke i rokove čuvanja
              opisane u ovoj politici privatnosti.
            </p>

            <p>
              Nakon brisanja računa možeš nastaviti
              igrati ODOKATIVNO. kao gost.
            </p>

            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-trash-can-outline"
              class="legal-action"
              to="/brisanje-racuna"
            >
              Brisanje korisničkog računa
            </v-btn>
          </section>

          <section>
            <h2>11. Sigurnost osobnih podataka</h2>

            <p>
              Primjenjujemo tehničke i organizacijske
              mjere namijenjene zaštiti osobnih
              podataka od neovlaštenog pristupa,
              gubitka i zlouporabe.
            </p>

            <p>
              Koristimo zaštićenu HTTPS komunikaciju,
              autentifikacijski sustav Supabase,
              pravila pristupa bazi podataka
              i Cloudflare Turnstile za zaštitu
              autentifikacijskih obrazaca.
            </p>

            <p>
              Nijedan informacijski sustav ne može
              jamčiti potpunu sigurnost, stoga
              preporučujemo korištenje snažne
              i jedinstvene lozinke.
            </p>
          </section>

          <section>
            <h2>12. Izmjene politike privatnosti</h2>

            <p>
              Ovu politiku ažuriramo kada se promijeni
              način obrade podataka, funkcionalnosti
              aplikacije ili primjenjivi propisi.
            </p>

            <p>
              O bitnim promjenama korisnike ćemo
              obavijestiti na odgovarajući način.
            </p>
          </section>
        </template>

        <!-- UVJETI KORIŠTENJA -->

        <template v-else>
          <section>
            <h2>1. O aplikaciji</h2>

            <p>
              ODOKATIVNO. je besplatni online kviz
              namijenjen zabavi, učenju i
              procjenjivanju brojčanih odgovora.
            </p>

            <p>
              Pružatelj usluge: {{ legal.operator }}<br>
              Kontakt:
              <a :href="'mailto:' + legal.email">
                {{ legal.email }}
              </a>
            </p>
          </section>

          <section>
            <h2>2. Pravila igre</h2>

            <ul>
              <li>Dnevni izazov sadrži sedam pitanja.</li>
              <li>Za svako pitanje imaš 20 sekundi.</li>
              <li>
                Bodovi ovise o širini odabranog
                raspona.
              </li>
              <li>
                Promašaj ili istek vremena
                donosi 0 bodova.
              </li>
            </ul>

            <p>
              Pitanja, bodovanje i pravila mogu se
              mijenjati radi poboljšanja igre.
            </p>
          </section>

          <section>
            <h2>3. Korisnički računi</h2>

            <p>
              Registracija nije obavezna za igranje.
              Korisnik je odgovoran za čuvanje
              pristupnih podataka i ne smije se
              lažno predstavljati.
            </p>

            <p>
              Korisničko ime ne smije sadržavati
              uvredljiv sadržaj niti kršiti prava
              drugih osoba.
            </p>

            <p>
              Prilikom registracije, prijave,
              obnove lozinke i brisanja računa
              korisnik može biti obvezan izvršiti
              sigurnosnu provjeru radi zaštite
              od automatiziranih zahtjeva.
            </p>
          </section>

          <section>
            <h2>4. Pošteno igranje</h2>

            <p>Nije dopušteno:</p>

            <ul>
              <li>Manipulirati rezultatima igre.</li>
              <li>Zloupotrebljavati sigurnosne propuste.</li>
              <li>Neovlašteno pristupati tuđim računima.</li>
              <li>Koristiti botove za ometanje usluge.</li>
              <li>Zaobilaziti pravila natjecanja.</li>
              <li>
                Zaobilaziti sigurnosne provjere
                radi zlouporabe usluge.
              </li>
              <li>
                Automatizirano kreirati korisničke
                račune radi zlouporabe usluge.
              </li>
            </ul>

            <p>
              U slučaju ozbiljne zlouporabe možemo
              ograničiti pristup računu radi zaštite
              drugih korisnika i aplikacije.
            </p>
          </section>

          <section>
            <h2>5. Dostupnost i točnost sadržaja</h2>

            <p>
              Nastojimo osigurati točnost pitanja
              i dostupnost igre. Povremeno su
              moguće tehničke poteškoće i pogreške.
            </p>

            <p>
              Sadržaj je informativnog i zabavnog
              karaktera. Uočene pogreške možeš
              prijaviti na našu kontaktnu adresu.
            </p>
          </section>

          <section>
            <h2>6. Bodovi i nagrade</h2>

            <p>
              Bodovi ostvareni u igri nemaju
              novčanu vrijednost i ne mogu se
              zamijeniti za novac.
            </p>
          </section>

          <section>
            <h2>7. Autorska prava</h2>

            <p>
              Izvorni dizajn, programski kod i
              drugi autorski sadržaji zaštićeni
              su primjenjivim pravima.
            </p>

            <p>
              Sadržaji trećih strana koriste se
              prema njihovim licencama i dozvolama.
            </p>
          </section>

          <section>
            <h2>8. Privatnost i brisanje računa</h2>

            <p>
              Način obrade osobnih podataka
              opisan je u našoj
              <router-link to="/politika-privatnosti">
                politici privatnosti
              </router-link>.
            </p>

            <p>
              Korisnik može prestati koristiti
              aplikaciju i obrisati svoj račun
              u bilo kojem trenutku.
            </p>

            <p>
              Mogućnost brisanja dostupna je
              unutar stranice Moj profil ili
              izravno putem sljedeće poveznice:
            </p>

            <router-link to="/brisanje-racuna">
              Brisanje korisničkog računa
            </router-link>
          </section>

          <section>
            <h2>9. Izmjene uvjeta korištenja</h2>

            <p>
              Uvjete korištenja možemo ažurirati
              radi razvoja aplikacije, uvođenja
              novih funkcionalnosti ili usklađivanja
              s primjenjivim propisima.
            </p>

            <p>
              O bitnim promjenama korisnike ćemo
              obavijestiti na odgovarajući način.
            </p>
          </section>

          <section>
            <h2>10. Završne odredbe</h2>

            <p>
              Primjenjuje se hrvatsko pravo,
              uz poštovanje obveznih prava koja
              korisnicima pripadaju prema
              primjenjivim propisima.
            </p>

            <p>
              Ovi uvjeti ne ograničavaju prava
              korisnika koja se zakonom
              ne mogu isključiti.
            </p>
          </section>
        </template>
      </article>

      <!-- POVRATAK NA POČETNU -->

      <v-btn
        variant="outlined"
        color="secondary"
        prepend-icon="mdi-arrow-left"
        class="back-button"
        to="/"
      >
        Povratak na početnu
      </v-btn>
    </v-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isPrivacy = computed(
  () => route.name === 'privacy'
)

const pageTitle = computed(() =>
  isPrivacy.value
    ? 'Politika privatnosti'
    : 'Uvjeti korištenja'
)

const pageSubtitle = computed(() =>
  isPrivacy.value
    ? 'Tvoji podaci. Tvoja prava.'
    : 'Pravila za poštenu i zabavnu igru.'
)

// OBAVEZNO POPUNITI PRIJE JAVNE OBJAVE

const legal = {
  operator: '[Ime i prezime ili naziv voditelja obrade]',

  address: '[Kontaktna adresa voditelja obrade]',

  email: '[E-mail za kontakt]',

  updatedAt: '27. studenoga 2026.',

  transfers:
    '[Upisati stvarne države prijenosa, pravne mehanizme i način dobivanja informacija o zaštitnim mjerama.]',

  retention:
    '[Upisati rokove ili kriterije čuvanja tehničkih zapisa, SMTP zapisa, sigurnosnih podataka i sigurnosnih kopija.]',

  tracking:
    '[Navesti koristi li stranica analitiku, dodatne kolačiće ili tehnologije praćenja.]',
}
</script>

<style scoped>
.legal-page {
  min-height: 75vh;
  background: #f8f6ed;
  color: #181818;
}

.legal-container {
  max-width: 850px;
  padding: 48px 24px 64px;
}

/* ZAGLAVLJE */

.legal-header {
  text-align: center;
  margin-bottom: 32px;
}

.legal-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 76px;
  height: 76px;

  margin: 0 auto 24px;

  border: 1px solid #181818;
  border-radius: 20px;

  background: #facc15;
}

.legal-header h1 {
  font-size: clamp(30px, 5vw, 44px);
  font-weight: 700;
  letter-spacing: -1.5px;
}

.legal-header p {
  color: #64635d;
  margin-top: 8px;
}

.updated-label {
  display: block;
  font-size: 12px;
  margin-top: 16px;
  color: #64635d;
}

/* SADRŽAJ */

.legal-card {
  padding: 36px;

  background: #fffdf6;

  border: 1px solid #181818;
  border-radius: 24px;
}

.legal-card section + section {
  margin-top: 28px;
  padding-top: 28px;

  border-top: 1px solid #dedcd3;
}

.legal-card h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
}

.legal-card p,
.legal-card li {
  font-size: 15px;
  line-height: 1.8;
  color: #55544f;

  overflow-wrap: anywhere;
}

.legal-card p {
  margin-bottom: 12px;
}

.legal-card ul {
  padding-left: 22px;
  margin-bottom: 16px;
}

.legal-card li {
  margin-bottom: 4px;
}

.legal-card a {
  color: #181818;
  font-weight: 600;
  text-underline-offset: 3px;
}

.legal-card a:hover {
  text-decoration: underline;
}

/* GUMBI */

.legal-action {
  margin-top: 8px;

  border-radius: 10px;

  font-size: 13px;
  font-weight: 600;

  text-transform: none;
  letter-spacing: 0;

  max-width: 100%;
}

.legal-card .legal-action {
  color: #dc2626;
}

.back-button {
  display: flex;

  margin: 28px auto 0;

  border-radius: 10px;

  text-transform: none;
  letter-spacing: 0;
}

/* MOBITEL */

@media (max-width: 599px) {
  .legal-container {
    padding: 28px 16px 40px;
  }

  .legal-header {
    margin-bottom: 24px;
  }

  .legal-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 18px;
  }

  .legal-card {
    padding: 22px 18px;
    border-radius: 18px;
  }

  .legal-card h2 {
    font-size: 18px;
  }

  .legal-card p,
  .legal-card li {
    font-size: 14px;
  }

  .legal-card section + section {
    margin-top: 22px;
    padding-top: 22px;
  }

  .legal-action {
    width: 100%;
    font-size: 12px;
  }
}
</style>
