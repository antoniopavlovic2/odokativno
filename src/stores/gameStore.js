
import { defineStore } from 'pinia'

import { useAuthStore } from '@/stores/authStore'

import {
  MAX_POINTS_PER_QUESTION,
  calculatePotentialPoints,
  calculateMaxScore,
  isValidRange,
} from '@/utils/scoring'

import { getTodayDate } from '@/utils/date'

import * as gameService from '@/services/gameService'

export const QUESTION_TIME_LIMIT = 20

let requestVersion = 0

function parseTime(value) {
  if (!value) return null

  const timestamp = Date.parse(value)

  return Number.isFinite(timestamp)
    ? timestamp
    : null
}

export const useGameStore = defineStore('game', {

  state: () => ({
    sessionId: null,
    ownerId: null,
    isGuest: false,

    challenge: null,
    questions: [],
    activeQuestion: null,
    questionCount: 0,

    currentQuestionIndex: 0,
    selectedRange: [0, 0],

    answers: [],
    serverScore: 0,

    status: 'idle',

    // Timer

    timeLimit: QUESTION_TIME_LIMIT,
    remainingTime: QUESTION_TIME_LIMIT,

    questionStartedAt: null,
    questionDeadline: null,
    localDeadline: null,

    // Trajanje igre

    startedAt: null,
    finishedAt: null,

    // Komunikacija sa serverom

    loading: false,
    error: null,
    requestError: '',
    retryAfter: 0,
  }),

  getters: {

    belongsToCurrentUser: state =>
      Boolean(state.ownerId) &&
      state.ownerId === useAuthStore().userId &&
      !useAuthStore().isRecovery,

    challengeNumber: state =>
      state.challenge?.id || 0,

    currentQuestion: state =>
      state.activeQuestion,

    currentQuestionNumber: state =>
      state.questionCount
        ? state.currentQuestionIndex + 1
        : 0,

    totalQuestions: state =>
      state.questionCount,

    totalScore: state =>
      state.serverScore,

    maxPointsPerQuestion: () =>
      MAX_POINTS_PER_QUESTION,

    maxScore() {
      return calculateMaxScore(
        this.totalQuestions
      )
    },

    potentialPoints() {
      if (!this.currentQuestion) return 0
      if (!this.isPlaying) return 0
      if (this.remainingTime <= 0) return 0

      return calculatePotentialPoints(
        this.selectedRange,
        this.currentQuestion.min,
        this.currentQuestion.max
      )
    },

    correctAnswers: state =>
      state.answers.filter(
        answer => answer.correct
      ).length,

    incorrectAnswers: state =>
      state.answers.filter(
        answer => !answer.correct
      ).length,

    timedOutAnswers: state =>
      state.answers.filter(
        answer => answer.timedOut
      ).length,

    accuracy() {
      if (!this.answers.length) return 0

      return Math.round(
        this.correctAnswers /
        this.answers.length * 100
      )
    },

    scorePercentage() {
      if (!this.maxScore) return 0

      return Math.round(
        this.totalScore /
        this.maxScore * 100
      )
    },

    isLastQuestion() {
      return (
        this.totalQuestions > 0 &&
        this.currentQuestionIndex ===
          this.totalQuestions - 1
      )
    },

    isPlaying() {
      return (
        this.belongsToCurrentUser &&
        this.status === 'playing'
      )
    },

    isAnswered() {
      return (
        this.belongsToCurrentUser &&
        this.status === 'answered'
      )
    },

    isFinished() {
      return (
        this.belongsToCurrentUser &&
        this.status === 'finished'
      )
    },

    isTimeExpired: state =>
      state.remainingTime <= 0,

    currentAnswer: state =>
      state.answers.find(
        answer =>
          answer.position ===
          state.currentQuestionIndex + 1
      ) || null,

    duration: state => {

      if (!state.startedAt || !state.finishedAt) {
        return 0
      }

      return Math.max(
        0,
        Math.floor(
          (state.finishedAt - state.startedAt) / 1000
        )
      )
    },

    answeringDuration: state => {

      const milliseconds = state.answers.reduce(
        (total, answer) =>
          total + (answer.responseTime || 0),
        0
      )

      return Math.floor(
        milliseconds / 1000
      )
    },
  },

  actions: {

    // =====================================
    // POKRETANJE I NASTAVAK IGRE
    // =====================================

    async startGame() {

      const authStore = useAuthStore()

      if (
        !authStore.userId ||
        authStore.isRecovery
      ) {
        this.resetGame()

        this.error =
          'Za sada je potrebna prijava za serversku igru.'

        return false
      }

      if (
        this.ownerId !== authStore.userId ||
        (
          this.challenge &&
          this.challenge.date !== getTodayDate()
        )
      ) {
        this.resetGame()
      }

      return this.runRequest(
        () => gameService.startGame(),
        true
      )
    },

    // Stari testni način više nije potreban.
    // Server dopušta samo jednu igru dnevno.

    async startTestGame() {
      return this.startGame()
    },

    // =====================================
    // KOMUNIKACIJA SA SERVEROM
    // =====================================

    async runRequest(callback, initial = false) {

      if (this.loading) return false

      const authStore = useAuthStore()
      const userId = authStore.userId

      if (!userId || authStore.isRecovery) {
        return false
      }

      const request = ++requestVersion

      this.loading = true
      this.error = null
      this.requestError = ''

      const requestStarted = performance.now()

      try {

        const data = await callback()

        if (
          request !== requestVersion ||
          userId !== authStore.userId ||
          authStore.isRecovery
        ) {
          return false
        }

        if (
          !data ||
          !data.sessionId ||
          !data.challengeId
        ) {
          throw new Error(
            'Server nije vratio ispravno stanje igre.'
          )
        }

        this.ownerId = userId

        this.applyServerState(
          data,
          performance.now() - requestStarted
        )

        return true

      } catch (error) {

        if (
          request !== requestVersion ||
          userId !== authStore.userId
        ) {
          return false
        }

        const message =
          error.message ||
          'Komunikacija sa serverom nije uspjela.'

        if (initial) {
          this.error = message
        } else {
          this.requestError = message

          // Sprječavamo velik broj ponovljenih
          // zahtjeva ako korisnik izgubi internet.

          this.retryAfter =
            performance.now() + 3000
        }

        console.error('Game server:', error)

        return false

      } finally {

        if (request === requestVersion) {
          this.loading = false
        }
      }
    },

    // =====================================
    // PRIMJENA STANJA SA SERVERA
    // =====================================

    applyServerState(data, requestDuration = 0) {

      const previousSessionId = this.sessionId
      const previousIndex = this.currentQuestionIndex
      const previousStatus = this.status

      this.sessionId = data.sessionId
      this.isGuest = Boolean(data.isGuest)

      this.challenge = {
        id: data.challengeId,
        date: data.challengeDate,
      }

      this.questionCount =
        Number(data.totalQuestions) || 7

      this.currentQuestionIndex =
        Number(data.currentPosition) - 1

      this.serverScore =
        Number(data.totalScore) || 0

      this.answers = (data.answers || []).map(
        answer => ({
          ...answer,

          position: Number(answer.position),
          points: Number(answer.points),
          correctAnswer: Number(answer.correctAnswer),

          min: Number(answer.min),
          max: Number(answer.max),

          responseTime:
            Number(answer.responseTime) || 0,

          // Kod isteka vremena nije potvrđen
          // nikakav raspon.

          range: Array.isArray(answer.range)
            ? answer.range.map(Number)
            : [],

          answeredAt: parseTime(
            answer.answeredAt
          ),
        })
      )

      // Obnavljamo prethodno odgovorena pitanja.
      // Buduća pitanja server još ne šalje.

      this.questions = new Array(
        this.questionCount
      ).fill(null)

      this.answers.forEach(answer => {

        this.questions[answer.position - 1] = {
          id: answer.questionId,
          category: answer.category,
          question: answer.question,
          unit: answer.unit || '',
          min: answer.min,
          max: answer.max,

          explanation:
            answer.explanation || '',

          source: answer.source || '',
          image: '',
          imageAlt: '',
        }
      })

      this.activeQuestion = data.question
        ? {
            ...data.question,
            min: Number(data.question.min),
            max: Number(data.question.max),
            step: Number(data.question.step),
            image: '',
            imageAlt: '',

            explanation:
              this.currentAnswer?.explanation || '',

            source:
              this.currentAnswer?.source || '',
          }
        : null

      if (this.activeQuestion) {

        this.questions[
          this.currentQuestionIndex
        ] = this.activeQuestion
      }

      // ===================================
      // TIMER
      // ===================================

      this.timeLimit =
        Number(data.timeLimit) ||
        QUESTION_TIME_LIMIT

      this.startedAt = parseTime(
        data.startedAt
      )

      this.finishedAt = parseTime(
        data.finishedAt
      )

      this.questionStartedAt = parseTime(
        data.questionStartedAt
      )

      this.questionDeadline = parseTime(
        data.questionDeadline
      )

      const serverNow = parseTime(
        data.serverNow
      )

      if (
        data.status === 'playing' &&
        serverNow !== null &&
        this.questionDeadline !== null
      ) {

        // Lokalni prikaz timera temelji se
        // na vremenu koje je poslao server.
        // Uzimamo u obzir i procijenjeno
        // kašnjenje mreže.

        const remainingMilliseconds =
          this.questionDeadline -
          serverNow -
          requestDuration / 2

        this.localDeadline =
          performance.now() +
          Math.max(0, remainingMilliseconds)

        this.remainingTime = Math.max(
          0,
          Math.min(
            this.timeLimit,
            Math.ceil(
              remainingMilliseconds / 1000
            )
          )
        )

      } else {

        this.localDeadline = null

        this.remainingTime =
          this.currentAnswer?.timedOut
            ? 0
            : Math.max(
                0,
                Math.ceil(
                  (
                    this.timeLimit * 1000 -
                    (this.currentAnswer?.responseTime || 0)
                  ) / 1000
                )
              )
      }

      // ===================================
      // ODABRANI RASPON
      // ===================================

      const changedQuestion =
        previousSessionId !== this.sessionId ||
        previousIndex !== this.currentQuestionIndex ||
        previousStatus === 'idle'

      if (
        this.activeQuestion &&
        (
          changedQuestion ||
          !isValidRange(
            this.selectedRange,
            this.activeQuestion.min,
            this.activeQuestion.max
          )
        )
      ) {
        this.initializeRange()
      }

      if (
        data.status === 'answered' &&
        this.currentAnswer?.range.length === 2
      ) {
        this.selectedRange = [
          ...this.currentAnswer.range,
        ]
      }

      this.retryAfter = 0
      this.requestError = ''

      // Status postavljamo na kraju kako bi
      // zvučni efekti dobili kompletan odgovor.

      this.status = data.status
    },

    // =====================================
    // RASPON
    // =====================================

    initializeRange() {

      if (!this.currentQuestion) return

      this.selectedRange = [
        this.currentQuestion.min,
        this.currentQuestion.max,
      ]
    },

    updateRange(range) {

      if (
        !this.isPlaying ||
        this.loading ||
        this.isTimeExpired ||
        !this.currentQuestion
      ) {
        return
      }

      if (
        !isValidRange(
          range,
          this.currentQuestion.min,
          this.currentQuestion.max
        )
      ) {
        return
      }

      this.selectedRange = [...range]
    },

    // =====================================
    // TIMER
    // =====================================

    updateTimer() {

      if (
        !this.isPlaying ||
        this.localDeadline === null
      ) {
        return
      }

      const remaining =
        this.localDeadline - performance.now()

      this.remainingTime = Math.max(
        0,
        Math.min(
          this.timeLimit,
          Math.ceil(remaining / 1000)
        )
      )

      if (
        remaining <= 0 &&
        !this.loading &&
        performance.now() >= this.retryAfter
      ) {
        void this.handleTimeout()
      }
    },

    async handleTimeout() {

      if (
        !this.isPlaying ||
        this.loading ||
        !this.sessionId
      ) {
        return false
      }

      // Server potvrđuje je li vrijeme
      // stvarno isteklo.

      return this.syncState()
    },

    async syncState() {

      if (!this.sessionId) {
        return this.startGame()
      }

      const sessionId = this.sessionId

      return this.runRequest(
        () => gameService.getGameState(
          sessionId
        )
      )
    },

    // =====================================
    // POTVRDA ODGOVORA
    // =====================================

    async submitAnswer() {

      if (
        !this.isPlaying ||
        this.loading ||
        !this.sessionId
      ) {
        return false
      }

      this.updateTimer()

      if (this.isTimeExpired) {
        return false
      }

      if (
        !isValidRange(
          this.selectedRange,
          this.currentQuestion.min,
          this.currentQuestion.max
        )
      ) {
        return false
      }

      const [lower, upper] =
        this.selectedRange

      const sessionId = this.sessionId
      const position = this.currentQuestionNumber

      return this.runRequest(
        () => gameService.submitAnswer(
          sessionId,
          position,
          lower,
          upper
        )
      )
    },

    // =====================================
    // SLJEDEĆE PITANJE
    // =====================================

    async nextQuestion() {

      if (
        !this.isAnswered ||
        this.loading ||
        !this.sessionId
      ) {
        return false
      }

      const sessionId = this.sessionId
      const position = this.currentQuestionNumber

      return this.runRequest(
        () => gameService.nextQuestion(
          sessionId,
          position
        )
      )
    },

    async finishGame() {

      if (!this.isLastQuestion) {
        return false
      }

      return this.nextQuestion()
    },

    // =====================================
    // RESETIRANJE LOKALNOG STANJA
    // =====================================

    resetGame() {
      requestVersion++
      this.$reset()
    },
  },
})
