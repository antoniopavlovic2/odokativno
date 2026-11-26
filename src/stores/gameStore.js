
import { defineStore } from 'pinia'

import questions from '@/data/questions.json'
import dailyChallenges from '@/data/dailyChallenges.json'

import {
  MAX_POINTS_PER_QUESTION,
  calculatePotentialPoints,
  calculateScore,
  calculateMaxScore,
  isCorrectAnswer,
  isValidRange,
} from '@/utils/scoring'

import { getTodayDate } from '@/utils/date'

export const QUESTION_TIME_LIMIT = 20

export const useGameStore = defineStore('game', {
  state: () => ({
    challenge: null,
    questions: [],
    currentQuestionIndex: 0,
    selectedRange: [0, 0],
    answers: [],
    status: 'idle',

    // Timer
    timeLimit: QUESTION_TIME_LIMIT,
    remainingTime: QUESTION_TIME_LIMIT,
    questionStartedAt: null,
    questionDeadline: null,

    // Trajanje igre
    startedAt: null,
    finishedAt: null,

    error: null,
  }),

  getters: {
    challengeNumber: state =>
      state.challenge?.id || 0,

    currentQuestion: state =>
      state.questions[state.currentQuestionIndex] || null,

    currentQuestionNumber: state =>
      state.questions.length
        ? state.currentQuestionIndex + 1
        : 0,

    totalQuestions: state =>
      state.questions.length,

    totalScore: state =>
      state.answers.reduce(
        (total, answer) => total + answer.points,
        0
      ),

    maxPointsPerQuestion: () =>
      MAX_POINTS_PER_QUESTION,

    maxScore() {
      return calculateMaxScore(this.totalQuestions)
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
        this.totalScore / this.maxScore * 100
      )
    },

    isLastQuestion() {
      return (
        this.totalQuestions > 0 &&
        this.currentQuestionIndex ===
          this.totalQuestions - 1
      )
    },

    isPlaying: state =>
      state.status === 'playing',

    isAnswered: state =>
      state.status === 'answered',

    isFinished: state =>
      state.status === 'finished',

    isTimeExpired: state =>
      state.remainingTime <= 0,

    currentAnswer: state =>
      state.answers[state.currentQuestionIndex] || null,

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

      return Math.floor(milliseconds / 1000)
    },
  },

  actions: {
    loadChallenge(date = getTodayDate()) {
      this.$reset()

      const challenge = dailyChallenges.find(
        item => item.date === date
      )

      if (!challenge) {
        this.error =
          'Dnevni izazov trenutno nije dostupan.'

        return false
      }

      const challengeQuestions =
        challenge.questionIds.map(id =>
          questions.find(
            question => question.id === id
          )
        )

      const invalidQuestions =
        challengeQuestions.some(question => {
          if (!question) return true

          return (
            !Number.isFinite(question.answer) ||
            !Number.isFinite(question.min) ||
            !Number.isFinite(question.max) ||
            !Number.isFinite(question.step) ||
            question.step <= 0 ||
            question.min >= question.max ||
            question.answer < question.min ||
            question.answer > question.max
          )
        })

      if (
        invalidQuestions ||
        challengeQuestions.length !== 7 ||
        new Set(challenge.questionIds).size !== 7
      ) {
        this.error =
          'Dnevni izazov nije ispravno konfiguriran.'

        return false
      }

      this.challenge = challenge
      this.questions = challengeQuestions

      return true
    },

    startGame(date = getTodayDate()) {
      if (!this.loadChallenge(date)) {
        return false
      }

      this.currentQuestionIndex = 0
      this.startedAt = Date.now()

      this.initializeRange()
      this.startQuestionTimer()

      this.status = 'playing'

      return true
    },

    startTestGame() {
      if (
        process.env.NODE_ENV !== 'development'
      ) {
        return false
      }

      const challenge = dailyChallenges[0]

      if (!challenge) return false

      return this.startGame(challenge.date)
    },

    initializeRange() {
      const question = this.currentQuestion

      if (!question) return

      this.selectedRange = [
        question.min,
        question.max,
      ]
    },

    // ==========================
    // TIMER
    // ==========================

    startQuestionTimer() {
      const now = Date.now()

      this.remainingTime = this.timeLimit
      this.questionStartedAt = now

      this.questionDeadline =
        now + this.timeLimit * 1000
    },

    updateTimer() {
      if (!this.isPlaying) return

      if (this.questionDeadline === null) {
        return
      }

      const remaining =
        this.questionDeadline - Date.now()

      this.remainingTime = Math.max(
        0,
        Math.min(
          this.timeLimit,
          Math.ceil(remaining / 1000)
        )
      )

      if (remaining <= 0) {
        this.handleTimeout()
      }
    },

    handleTimeout() {
      if (!this.isPlaying) return false

      if (
        this.questionDeadline === null ||
        Date.now() < this.questionDeadline
      ) {
        return false
      }

      const question = this.currentQuestion

      if (!question) return false

      const result = {
        questionId: question.id,
        range: [...this.selectedRange],
        correctAnswer: question.answer,

        correct: false,
        timedOut: true,
        points: 0,

        responseTime: this.timeLimit * 1000,
        answeredAt: this.questionDeadline,
      }

      this.remainingTime = 0
      this.questionDeadline = null

      this.answers.push(result)

      this.status = 'answered'

      return true
    },

    // ==========================
    // ODGOVARANJE
    // ==========================

    updateRange(range) {
      this.updateTimer()

      if (!this.isPlaying) return

      const question = this.currentQuestion

      if (!question) return

      if (
        !isValidRange(
          range,
          question.min,
          question.max
        )
      ) {
        return
      }

      this.selectedRange = [...range]
    },

    submitAnswer() {
      if (!this.isPlaying) return false

      const now = Date.now()

      if (this.questionDeadline === null) {
        return false
      }

      if (now >= this.questionDeadline) {
        return this.handleTimeout()
      }

      const question = this.currentQuestion

      if (!question) return false

      if (
        !isValidRange(
          this.selectedRange,
          question.min,
          question.max
        )
      ) {
        return false
      }

      const range = [...this.selectedRange]

      const correct = isCorrectAnswer(
        question.answer,
        range
      )

      const points = calculateScore(
        question,
        range
      )

      const responseTime = Math.min(
        this.timeLimit * 1000,
        Math.max(
          0,
          now - this.questionStartedAt
        )
      )

      this.remainingTime = Math.max(
        0,
        Math.min(
          this.timeLimit,
          Math.ceil(
            (this.questionDeadline - now) / 1000
          )
        )
      )

      const result = {
        questionId: question.id,
        range,
        correctAnswer: question.answer,

        correct,
        timedOut: false,
        points,

        responseTime,
        answeredAt: now,
      }

      this.questionDeadline = null

      this.answers.push(result)

      this.status = 'answered'

      return true
    },

    // ==========================
    // SLJEDEĆE PITANJE
    // ==========================

    nextQuestion() {
      if (!this.isAnswered) return false

      if (this.isLastQuestion) {
        return this.finishGame()
      }

      this.currentQuestionIndex += 1

      this.initializeRange()
      this.startQuestionTimer()

      this.status = 'playing'

      return true
    },

    // ==========================
    // ZAVRŠETAK IGRE
    // ==========================

    finishGame() {
      if (
        !this.isAnswered ||
        this.answers.length !== this.totalQuestions
      ) {
        return false
      }

      this.finishedAt = Date.now()
      this.questionDeadline = null
      this.status = 'finished'

      return true
    },

    resetGame() {
      this.$reset()
    },
  },
})
