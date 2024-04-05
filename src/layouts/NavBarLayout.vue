<script setup>
import { useAuthStore } from "src/stores/authStore";

// Variables
const authStore = useAuthStore();
</script>

<template>
  <q-header bordered class="bg-grey-2 text-black">
    <q-toolbar>
      <q-btn dense flat round icon="menu" @click="$emit('toggleSideBar')" />

      <q-space />

      <q-btn-dropdown stretch flat :label="authStore.getAuth.user?.name">
        <q-list>
          <!-- Etiqueta -->
          <q-item-label header class="q-py-md bg-black text-grey-3">
            Administrar cuenta
          </q-item-label>

          <!-- Perfil -->
          <q-item clickable v-close-popup tabindex="0" :to="{ name: 'profile' }">
            <q-item-section>
              <q-item-label>
                <q-icon size="sm" name="person" />
                Perfil
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset />

          <!-- Cerrar sesión -->
          <q-item clickable v-close-popup tabindex="0" :to="{ name: 'logout' }">
            <q-item-section>
              <q-item-label>
                <q-icon size="xs" name="logout" />
                Cerrar sesión
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
  </q-header>
</template>
