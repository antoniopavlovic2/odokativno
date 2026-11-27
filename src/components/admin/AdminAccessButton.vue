
<template>
  <template v-if="adminStore.isAdmin">

    <v-list-item
      v-if="menu"
      :to="{ name: 'admin' }"
      prepend-icon="mdi-shield-account"
      title="Administracija"
    />

    <v-btn
      v-else
      :to="{ name: 'admin' }"
      color="#181818"
      variant="flat"
      prepend-icon="mdi-shield-account"
      class="admin-access-button"
    >
      Administracija
    </v-btn>

  </template>
</template>

<script setup>
import { useAdminStore } from '@/stores/adminStore'

defineProps({
  menu: {
    type: Boolean,
    default: false
  }
})

const adminStore = useAdminStore()
</script>

<style scoped>
.admin-access-button {
  color: #FACC15 !important;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  border-radius: 10px;
}
</style>
