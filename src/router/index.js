
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
      title:
        'Otprilike – Besplatni dnevni kviz procjenjivanja',
      description:
        'Zaigraj Otprilike, besplatni dnevni kviz na hrvatskom jeziku. Sedam pitanja svaki dan. Testiraj svoj osjećaj za brojke.',
      robots: 'index, follow',
    },
  },

  {
    path: '/igra',
    name: 'game',
    component: GameView,
    meta: {
      title: 'Dnevni izazov | Otprilike',
      description:
        'Procijeni odgovore na sedam zanimljivih pitanja.',
      robots: 'noindex, follow',
    },
  },

  {
    path: '/rezultati',
    name: 'results',
    component: ResultsView,
    meta: {
      title: 'Tvoj rezultat | Otprilike',
      description:
        'Pogledaj svoj rezultat dnevnog kviza Otprilike.',
      robots: 'noindex, follow',
    },
  },

  {
    path: '/prijava',
    name: 'login',
    component: () =>
      import('@/views/auth/LoginView.vue'),
    meta: {
      title: 'Prijava | Otprilike',
      description:
        'Prijavi se na svoj Otprilike račun.',
      robots: 'noindex, follow',
    },
  },

  {
    path: '/registracija',
    name: 'register',
    component: () =>
      import('@/views/auth/RegisterView.vue'),
    meta: {
      title: 'Registracija | Otprilike',
      description:
        'Kreiraj besplatan Otprilike račun.',
      robots: 'noindex, follow',
    },
  },

  {
    path: '/zaboravljena-lozinka',
    name: 'forgot-password',
    component: () =>
      import('@/views/auth/ForgotPasswordView.vue'),
    meta: {
      title: 'Zaboravljena lozinka | Otprilike',
      description:
        'Zatraži poveznicu za obnovu lozinke.',
      robots: 'noindex, follow',
    },
  },

  {
    path: '/nova-lozinka',
    name: 'reset-password',
    component: () =>
      import('@/views/auth/ResetPasswordView.vue'),
    meta: {
      title: 'Nova lozinka | Otprilike',
      description:
        'Postavi novu lozinku za svoj račun.',
      robots: 'noindex, follow',
    },
  },

  {
    path: '/profil',
    name: 'profile',
    component: () =>
      import('@/views/auth/ProfileView.vue'),
    meta: {
      title: 'Moj profil | Otprilike',
      description:
        'Upravljaj svojim Otprilike profilom.',
      robots: 'noindex, follow',
    },
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,

  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

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
    to.meta.title || 'Otprilike'

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
