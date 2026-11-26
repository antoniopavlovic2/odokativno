
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Odokativno – Besplatni dnevni kviz procjenjivanja',
      description:
        'Zaigraj Odokativno, besplatni dnevni kviz na hrvatskom jeziku. Procijeni odgovore na 7 zanimljivih pitanja i testiraj svoj osjećaj za brojke.',
      robots: 'index, follow',
    },
  },

  {
    path: '/prijava',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: 'Prijava | Odokativno',
      description:
        'Prijavi se na svoj Odokativno račun.',
      robots: 'noindex, follow',
    },
  },

  {
    path: '/registracija',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      title: 'Registracija | Odokativno',
      description:
        'Kreiraj svoj besplatni Odokativno račun.',
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
      description:
        'Zatraži poveznicu za oporavak svog računa.',
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
      description:
        'Postavi novu lozinku za svoj Odokativno račun.',
      robots: 'noindex, follow',
    },
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
  let element = document.querySelector(
    `meta[name="${name}"]`
  )

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

router.afterEach((to, from, failure) => {
  if (failure) return

  document.title = to.meta.title || 'Odokativno'

  setMeta(
    'description',
    to.meta.description || 'Besplatni dnevni kviz.'
  )

  setMeta(
    'robots',
    to.meta.robots || 'noindex, follow'
  )
})

export default router
