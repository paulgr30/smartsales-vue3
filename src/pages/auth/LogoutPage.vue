<script setup>
import { useAuthStore } from "src/stores/authStore";

// Variables
const authStore = useAuthStore();

authStore.logout();
</script>

<template>
  <q-page class="flex flex-center">
    <q-inner-loading showing label="Cerrando sesion...">
      <q-spinner color="primary" size="lg" :thickness="5" />
      <span class="q-mt-sm text-primary text-bold">Cerrando sesion...</span>
    </q-inner-loading>
  </q-page>
</template>
