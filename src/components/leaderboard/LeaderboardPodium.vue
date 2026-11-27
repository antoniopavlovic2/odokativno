
<template>
  <section
    v-if="players.length"
    class="podium-section"
    aria-label="Najbolje plasirani igrači"
  >

    <div class="podium-heading">
      <v-icon size="22">
        mdi-trophy-outline
      </v-icon>

      <h2>Najbolji danas</h2>
    </div>

    <div
      class="podium"
      :class="{
        'podium-classic': classicPodium
      }"
    >

      <article
        v-for="player in orderedPlayers"
        :key="player.username"
        class="podium-player"
        :class="
          'place-' + player.placement
        "
      >

        <div class="player-crown">
          <v-icon
            v-if="Number(player.placement) === 1"
            size="28"
          >
            mdi-crown
          </v-icon>
        </div>

        <div class="player-avatar">
          {{ initial(player.username) }}
        </div>

        <div
          class="player-name"
          :title="player.username"
        >
          {{ player.username }}
        </div>

        <div class="player-score">
          {{ formatNumber(player.score) }}
          <span>bod.</span>
        </div>

        <div class="podium-base">

          <v-icon size="20">
            mdi-medal-outline
          </v-icon>

          <strong>
            {{ player.placement }}
          </strong>

          <span>MJESTO</span>

        </div>

      </article>

    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  players: {
    type: Array,
    default: () => [],
  },
})

// Klasično postolje koristimo samo kada
// imamo zasebno prvo, drugo i treće mjesto.

const classicPodium = computed(() => {

  const places = props.players.map(
    player => Number(player.placement)
  )

  return (
    places.length === 3 &&
    places[0] === 1 &&
    places[1] === 2 &&
    places[2] === 3
  )
})

const orderedPlayers = computed(() => {

  if (classicPodium.value) {
    return [
      props.players[1],
      props.players[0],
      props.players[2],
    ]
  }

  return props.players
})

function initial(username) {
  return Array.from(
    username || '?'
  )[0].toUpperCase()
}

function formatNumber(value) {
  return new Intl.NumberFormat(
    'hr-HR'
  ).format(value)
}
</script>

<style scoped>
.podium-section {
  margin: 36px 0;
}

.podium-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.podium-heading h2 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  max-width: 650px;
  margin: 0 auto;
}

.podium-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 210px;
  min-width: 0;
  text-align: center;
}

.player-crown {
  height: 34px;
  color: #a16207;
}

.player-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid #181818;
  background: #edeae0;
  color: #181818;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
}

.place-1 .player-avatar {
  width: 78px;
  height: 78px;
  font-size: 36px;
  background: #facc15;
}

.place-2 .player-avatar {
  background: #d8d8d8;
}

.place-3 .player-avatar {
  background: #deb38a;
}

.player-name {
  font-size: 17px;
  font-weight: 700;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.player-score {
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 14px;
}

.player-score span {
  color: #66645d;
  font-size: 12px;
  font-weight: 500;
}

.podium-base {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  background: #edeae0;
  border: 1px solid #181818;
  border-radius: 12px 12px 0 0;
}

.podium-base strong {
  font-size: 38px;
  line-height: 1.1;
}

.podium-base span {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-top: 4px;
}

.place-1 .podium-base {
  background: #facc15;
}

.place-2 .podium-base {
  background: #d8d8d8;
}

.place-3 .podium-base {
  background: #deb38a;
}

.podium-classic .place-1 .podium-base {
  height: 130px;
}

.podium-classic .place-2 .podium-base {
  height: 100px;
}

.podium-classic .place-3 .podium-base {
  height: 80px;
}

@media (max-width: 600px) {
  .podium {
    gap: 7px;
  }

  .player-avatar {
    width: 48px;
    height: 48px;
    font-size: 21px;
  }

  .place-1 .player-avatar {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }

  .player-name {
    font-size: 12px;
  }

  .player-score {
    font-size: 18px;
  }

  .player-score span {
    font-size: 10px;
  }

  .podium-base strong {
    font-size: 30px;
  }

  .podium-classic .place-1 .podium-base {
    height: 110px;
  }

  .podium-classic .place-2 .podium-base {
    height: 85px;
  }

  .podium-classic .place-3 .podium-base {
    height: 70px;
  }
}
</style>
