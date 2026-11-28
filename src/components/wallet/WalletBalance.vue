
<template>
  <v-btn
    v-if="
      walletStore.canLoad &&
      walletStore.isReady
    "
    :to="{ name: 'wallet' }"
    variant="flat"
    elevation="0"
    class="wallet-balance"
    :aria-label="
      'Moj novčanik: ' +
      walletStore.balance +
      ' O-Coins'
    "
  >

    <CoinCounter
      :key="authStore.userId"
      :amount="walletStore.balance"
      :size="23"
    />

    <v-tooltip
      activator="parent"
      location="bottom"
    >
      Moj novčanik
    </v-tooltip>

  </v-btn>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useWalletStore } from '@/stores/walletStore'

import CoinCounter from './CoinCounter.vue'

const authStore = useAuthStore()

const walletStore = useWalletStore()
</script>

<style scoped>
.wallet-balance {
  background: #fef3c7 !important;
  color: #181818 !important;
  border: 1px solid #ca8a04;
  border-radius: 8px !important;
  min-width: 0 !important;
  padding: 0 12px !important;
  height: 38px !important;
  font-size: 14px;
  letter-spacing: 0;
  text-transform: none;
  transition:
    background 150ms ease,
    transform 150ms ease;
}

.wallet-balance:hover {
  background: #fde68a !important;
  transform: translateY(-1px);
}

.wallet-balance:active {
  transform: scale(0.97);
}

.wallet-balance.v-btn--active {
  background: #facc15 !important;
}

@media (max-width: 600px) {

  .wallet-balance {
    height: 34px !important;
    padding: 0 8px !important;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .wallet-balance {
    transition: none;
  }

  .wallet-balance:hover,
  .wallet-balance:active {
    transform: none;
  }
}
</style>
