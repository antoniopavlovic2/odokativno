
<template>
  <section
    v-if="walletStore.canLoad"
    class="wallet-history"
  >

    <div class="section-heading">

      <h2>Stanje novčanika.</h2>

      <v-btn
        icon="mdi-refresh"
        variant="text"
        aria-label="Osvježi novčanik"
        :loading="walletStore.loading"
        @click="walletStore.refresh()"
      />

    </div>

    <v-alert
      v-if="walletStore.errorMessage"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      {{ walletStore.errorMessage }}
    </v-alert>

    <div
      v-if="
        walletStore.loading &&
        !walletStore.isReady
      "
      class="wallet-loading"
    >

      <v-progress-circular
        indeterminate
        color="primary"
      />

    </div>

    <template v-else-if="walletStore.isReady">

      <div class="wallet-card">

        <CoinIcon :size="76" />

        <div>

          <div class="eyebrow">
            RASPOLOŽIVI O-COINS
          </div>

          <div class="balance">

            <CoinCounter
              :amount="walletStore.balance"
              :size="30"
            />

          </div>

          <p>
            Skupljaj nagrade svakodnevnim igranjem.
          </p>

        </div>

      </div>

      <div class="wallet-stats">

        <div class="stat-card">

          <strong class="earned">
            {{ formatNumber(walletStore.totalEarned) }}
          </strong>

          <span>Ukupno zarađeno</span>

        </div>

        <div class="stat-card">

          <strong>
            {{ formatNumber(walletStore.totalSpent) }}
          </strong>

          <span>Ukupno potrošeno</span>

        </div>

      </div>

      <h3 class="history-title">
        Posljednje transakcije
      </h3>

      <div
        v-if="!walletStore.transactions.length"
        class="empty-history"
      >

        <CoinIcon :size="44" />

        <h3>Još nemaš transakcija.</h3>

        <p>
          Završi dnevni izazov i osvoji
          svoje prve O-Coinse.
        </p>

      </div>

      <div v-else class="transaction-list">

        <div
          v-for="item in walletStore.transactions"
          :key="item.id"
          class="transaction-row"
        >

          <div class="transaction-icon">

            <v-icon size="22">
              {{ getIcon(item.source) }}
            </v-icon>

          </div>

          <div class="transaction-details">

            <strong>

              {{
                item.description ||
                'O-Coins transakcija'
              }}

            </strong>

            <span>
              {{ formatDate(item.createdAt) }}
            </span>

          </div>

          <strong
            class="transaction-amount"
            :class="
              Number(item.amount) > 0
                ? 'earned'
                : 'spent'
            "
          >

            {{ Number(item.amount) > 0 ? '+' : '' }}

            {{ formatNumber(item.amount) }}

          </strong>

        </div>

      </div>

      <div class="shop-notice">

        <v-icon size="28">
          mdi-shopping-outline
        </v-icon>

        <div>

          <strong>ODOKATIVNO. Shop</strong>

          <p>
            Uskoro ćeš moći trošiti O-Coinse
            na avatare, okvire i druge nagrade.
          </p>

        </div>

      </div>

    </template>

  </section>
</template>

<script setup>
import { onMounted } from 'vue'

import { useWalletStore } from '@/stores/walletStore'

import CoinIcon from './CoinIcon.vue'
import CoinCounter from './CoinCounter.vue'

const walletStore = useWalletStore()

function formatNumber(value) {

  return new Intl.NumberFormat(
    'hr-HR'
  ).format(value)
}

function formatDate(value) {

  return new Intl.DateTimeFormat(
    'hr-HR',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Zagreb',
    }
  ).format(new Date(value))
}

function getIcon(source) {

  const icons = {

    daily_game:
      'mdi-gamepad-variant-outline',

    level_up:
      'mdi-lightning-bolt',

    purchase:
      'mdi-shopping-outline',

    achievement:
      'mdi-medal-outline',

    streak:
      'mdi-fire',

  }

  return icons[source] ||
    'mdi-wallet-outline'
}

onMounted(() => {

  if (walletStore.canLoad) {

    void walletStore.refresh()

  }
})
</script>

<style scoped>
.wallet-history {
  margin: 32px 0;
  color: #181818;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-heading h2 {
  font-size: 28px;
  letter-spacing: -1px;
}

.wallet-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  border-radius: 14px;
  background: #181818;
  color: #facc15;
}

.eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.3px;
}

.balance {
  font-size: 38px;
  line-height: 1.3;
  margin: 6px 0;
}

.wallet-card p {
  color: #d4d4d4;
  font-size: 12px;
}

.wallet-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 12px;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 12px;
}

.stat-card strong {
  font-size: 28px;
}

.stat-card span {
  color: #66645d;
  font-size: 12px;
}

.history-title {
  font-size: 20px;
  margin: 28px 0 16px;
}

.transaction-list {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 12px;
  overflow: hidden;
}

.transaction-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e5e2d8;
}

.transaction-row:last-child {
  border-bottom: 0;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  background: #f0ede3;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.transaction-details {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.transaction-details strong {
  display: block;
  font-size: 13px;
}

.transaction-details span {
  display: block;
  color: #66645d;
  font-size: 11px;
  margin-top: 4px;
}

.transaction-amount {
  font-size: 16px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.earned {
  color: #15803d;
}

.spent {
  color: #dc2626;
}

.empty-history {
  padding: 28px 18px;
  text-align: center;
  border: 1px solid #d8d5ca;
  border-radius: 12px;
  background: #fffdf6;
}

.empty-history h3 {
  margin: 12px 0 6px;
}

.empty-history p {
  font-size: 13px;
  color: #66645d;
}

.shop-notice {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  margin-top: 20px;
  background: #f0ede3;
  border-radius: 12px;
}

.shop-notice p {
  font-size: 12px;
  color: #66645d;
  margin-top: 4px;
}

.wallet-loading {
  display: grid;
  place-items: center;
  padding: 28px;
}

@media (max-width: 600px) {

  .wallet-card {
    padding: 18px;
    gap: 12px;
  }

  .balance {
    font-size: 30px;
  }

  .transaction-row {
    padding: 12px;
    gap: 8px;
  }
}
</style>
