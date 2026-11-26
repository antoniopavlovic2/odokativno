import { createRouter, createWebHistory } from 'vue-router'

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
      description: 'Zaigraj Odokativno, besplatni dnevni kviz na hrvatskom jeziku. Procijeni odgovore na 7 zanimljivih pitanja i testiraj svoj osjećaj za brojke.',
      robots: 'index, follow',
    },
  },
  {
    path: '/igra',
    name: 'game',
    component: GameView,
    meta: {
      title: 'Dnevni izazov | Odokativno',
      description: 'Zaigraj današnji izazov i procijeni odgovore na sedam zanimljivih pitanja.',
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
  {
    path: '/prijava',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: 'Prijava | Odokativno',
      description: 'Prijavi se na svoj Odokativno račun.',
      robots: 'noindex, follow',
    },
  },
  {
    path: '/registracija',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      title: 'Registracija | Odokativno',
      description: 'Kreiraj besplatan Odokativno račun i prati svoje rezultate.',
      robots: 'noindex, follow',
    },
  },
  {
    path: '/zaboravljena-lozinka',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: {
      title: 'Zaboravljena lozinka | Odokativno',
      description: 'Zatraži poveznicu za obnovu lozinke.',
      robots: 'noindex, follow',
    },
  },
  {
    path: '/nova-lozinka',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: {
      title: 'Nova lozinka | Odokativno',
      description: 'Postavi novu lozinku za svoj račun.',
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
  let tag = document.querySelector(`meta[name="${name}"]`)

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

router.afterEach((to, from, failure) => {
  if (failure) return

  document.title = to.meta.title || 'Odokativno'

  setMeta('description', to.meta.description || '')
  setMeta('robots', to.meta.robots || 'index, follow')
})

export default router