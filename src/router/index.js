
import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import GameView from '@/views/GameView.vue'
import ResultsView from '@/views/ResultsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Odokativno – Besplatni dnevni kviz procjenjivanja',
      description: 'Zaigraj Odokativno, besplatni dnevni kviz na hrvatskom jeziku. Sedam pitanja svaki dan. Testiraj svoj osjećaj za brojke.',
      robots: 'index, follow',
    },
  },
  {
    path: '/igra',
    name: 'game',
    component: GameView,
    meta: {
      title: 'Dnevni izazov | Odokativno',
      description: 'Procijeni odgovore na sedam zanimljivih pitanja.',
      robots: 'noindex, follow',
    },
  },
  {
    path: '/rezultati',
    name: 'results',
    component: ResultsView,
    meta: {
      title: 'Tvoj rezultat | Odokativno',
      description: 'Pogledaj svoj rezultat dnevnog kviza Odokativno.',
      robots: 'noindex, follow',
    },
  },

  // =========================================
  // RANG-LISTA
  // =========================================

  {
    path: '/rang-lista',
    name: 'leaderboard',
    component: () =>
      import('@/views/LeaderboardView.vue'),
    meta: {
      title: 'Dnevna rang-lista | Odokativno',
      description: 'Pogledaj najbolje igrače dnevnog kviza Odokativno i saznaj tko ima najbolji osjećaj za brojke.',
      robots: 'index, follow',
    },
  },

  // =========================================
  // AUTENTIFIKACIJA
  // =========================================

  {
    path: '/prijava',
    name: 'login',
    component: () =>
      import('@/views/auth/LoginView.vue'),
    meta: {
      title: 'Prijava | Odokativno',
      description: 'Prijavi se na svoj Odokativno račun.',
      robots: 'noindex, follow',
    },
  },
  {
    path: '/registracija',
    name: 'register',
    component: () =>
      import('@/views/auth/RegisterView.vue'),
    meta: {
      title: 'Registracija | Odokativno',
      description: 'Kreiraj besplatan Odokativno račun.',
      robots: 'noindex, follow',
    },
  },
  {
    path: '/zaboravljena-lozinka',
    name: 'forgot-password',
    component: () =>
      import('@/views/auth/ForgotPasswordView.vue'),
    meta: {
      title: 'Zaboravljena lozinka | Odokativno',
      description: 'Zatraži poveznicu za obnovu lozinke.',
      robots: 'noindex, follow',
    },
  },
  {
    path: '/nova-lozinka',
    name: 'reset-password',
    component: () =>
      import('@/views/auth/ResetPasswordView.vue'),
    meta: {
      title: 'Nova lozinka | Odokativno',
      description: 'Postavi novu lozinku za svoj račun.',
      robots: 'noindex, follow',
    },
  },
  {
    path: '/profil',
    name: 'profile',
    component: () =>
      import('@/views/auth/ProfileView.vue'),
    meta: {
      title: 'Moj profil | Odokativno',
      description: 'Upravljaj svojim Odokativno profilom.',
      robots: 'noindex, follow',
    },
  },
  {
    path: '/brisanje-racuna',
    name: 'delete-account',
    component: () =>
      import('@/views/auth/DeleteAccountView.vue'),
    meta: {
      title: 'Brisanje računa | Odokativno',
      description: 'Upravljaj brisanjem svojeg Odokativno računa.',
      robots: 'noindex, follow',
    },
  },

  // =========================================
  // PRAVNI DOKUMENTI
  // =========================================

  {
    path: '/politika-privatnosti',
    name: 'privacy',
    component: () =>
      import('@/views/LegalView.vue'),
    meta: {
      title: 'Politika privatnosti | Odokativno',
      description: 'Saznaj kako Odokativno obrađuje i štiti osobne podatke korisnika.',
      robots: 'index, follow',
    },
  },
  {
    path: '/uvjeti-koristenja',
    name: 'terms',
    component: () =>
      import('@/views/LegalView.vue'),
    meta: {
      title: 'Uvjeti korištenja | Odokativno',
      description: 'Pročitaj pravila i uvjete korištenja dnevnog kviza Odokativno.',
      robots: 'index, follow',
    },
  },

  // =========================================
  // ADMINISTRACIJA
  // =========================================

  {
    path: '/admin',
    name: 'admin',
    component: () =>
      import('@/views/admin/AdminDashboardView.vue'),
    meta: {
      title: 'Administracija | Odokativno',
      description: 'Administratorsko sučelje dnevnog kviza Odokativno.',
      robots: 'noindex, nofollow',
    },
  },

  {
  path: '/statistika',
  name: 'statistics',
  component: () => import('@/views/StatisticsView.vue'),
  meta: {
    title: 'Moja statistika | ODOKATIVNO.',
    description: 'Osobna statistika i tjedni napredak igrača.',
    robots: 'noindex, nofollow',
  },
  },

  {
  path: '/novcanik',
  name: 'wallet',
  component: () => import('@/views/WalletView.vue'),
  meta: {
    title: 'Moj novčanik | ODOKATIVNO.',
    description: 'Pregled O-Coinsa, nagrada i transakcija.',
    robots: 'noindex, nofollow',
  },
  
},

  // =========================================
  // NEPOSTOJEĆE STRANICE
  // =========================================

  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

// =========================================
// VUE ROUTER
// =========================================

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,

  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// =========================================
// SEO META PODACI
// =========================================

function setMeta(name, content) {
  let tag = document.querySelector(
    `meta[name="${name}"]`
  )

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)

    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

router.afterEach((to, from, failure) => {
  if (failure) return

  document.title =
    to.meta.title || 'Odokativno'

  setMeta(
    'description',
    to.meta.description || ''
  )

  setMeta(
    'robots',
    to.meta.robots || 'index, follow'
  )
})

export default router
