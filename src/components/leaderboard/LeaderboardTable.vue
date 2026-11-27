
<template>
  <div class="table-card">
    <div class="table-scroll">

      <table class="leaderboard-table">

        <thead>
          <tr>
            <th scope="col">Mjesto</th>
            <th scope="col">Igrač</th>
            <th scope="col" class="center">
              Točno
            </th>
            <th scope="col" class="center time-column">
              Vrijeme
            </th>
            <th scope="col" class="right">
              Bodovi
            </th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="player in players"
            :key="player.username"
            :class="{
              'my-row': isMe(player)
            }"
          >

            <!-- PLASMAN -->

            <td class="rank-cell">

              <span
                class="rank-number"
                :class="
                  'rank-' + player.placement
                "
              >
                {{ player.placement }}.
              </span>

            </td>

            <!-- IGRAČ -->

            <td>
              <div class="player-cell">

                <div class="avatar">
                  {{ initial(player.username) }}
                </div>

                <div class="player-details">

                  <strong>
                    {{ player.username }}
                  </strong>

                  <span
                    v-if="isMe(player)"
                    class="me-label"
                  >
                    TI
                  </span>

                </div>

              </div>
            </td>

            <!-- TOČNI ODGOVORI -->

            <td class="center correct-cell">
              {{ player.correct_answers }}/7
            </td>

            <!-- VRIJEME -->

            <td class="center time-column">
              {{ formatTime(player.response_time_ms) }}
            </td>

            <!-- BODOVI -->

            <td class="right score-cell">
              {{ formatNumber(player.score) }}
            </td>

          </tr>

        </tbody>
      </table>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  players: {
    type: Array,
    default: () => [],
  },

  myUsername: {
    type: String,
    default: '',
  },
})

function isMe(player) {
  return (
    Boolean(props.myUsername) &&
    player.username === props.myUsername
  )
}

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

function formatTime(milliseconds) {
  const seconds =
    Math.floor(
      Math.max(
        0,
        Number(milliseconds) || 0
      ) / 1000
    )

  const minutes = Math.floor(
    seconds / 60
  )

  const remaining = seconds % 60

  return (
    String(minutes).padStart(2, '0') +
    ':' +
    String(remaining).padStart(2, '0')
  )
}
</script>

<style scoped>
.table-card {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 14px;
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.leaderboard-table thead {
  background: #181818;
  color: #fffdf6;
}

.leaderboard-table th {
  padding: 16px 14px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  white-space: nowrap;
}

.leaderboard-table td {
  padding: 14px;
  border-bottom: 1px solid #e5e2d8;
}

.leaderboard-table tbody tr:last-child td {
  border-bottom: 0;
}

.leaderboard-table tbody tr:hover {
  background: #f4f1e7;
}

.leaderboard-table tbody tr.my-row {
  background: #fef3c7;
}

.rank-cell {
  width: 80px;
}

.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  min-height: 34px;
  padding: 4px;
  border-radius: 8px;
  font-weight: 700;
  color: #66645d;
}

.rank-1 {
  color: #181818;
  background: #facc15;
}

.rank-2 {
  color: #181818;
  background: #d8d8d8;
}

.rank-3 {
  color: #181818;
  background: #deb38a;
}

.player-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f0ede3;
  border-radius: 50%;
  font-weight: 700;
  flex-shrink: 0;
}

.player-details {
  min-width: 0;
  overflow-wrap: anywhere;
}

.me-label {
  display: inline-block;
  color: #181818;
  background: #facc15;
  padding: 2px 6px;
  margin-left: 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 10px;
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}

.correct-cell {
  color: #15803d;
  font-weight: 600;
}

.score-cell {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 600px) {

  .leaderboard-table th,
  .leaderboard-table td {
    padding: 12px 8px;
  }

  .leaderboard-table th {
    font-size: 10px;
  }

  .rank-cell {
    width: 46px;
  }

  .rank-number {
    font-size: 12px;
    min-width: 28px;
    min-height: 28px;
  }

  .player-cell {
    gap: 6px;
  }

  .player-details {
    font-size: 12px;
  }

  .avatar {
    display: none;
  }

  .time-column {
    display: none;
  }

  .score-cell {
    font-size: 16px;
  }

  .correct-cell {
    font-size: 12px;
  }
}
</style>
