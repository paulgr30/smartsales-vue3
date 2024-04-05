<script setup>
import { ref } from "vue";
import { useAuthStore } from "src/stores/authStore";
import notify from "src/utils/notify";

// Variables
const authStore = useAuthStore();

const processing = ref(false);
const errorMessage = ref("");
const credentials = ref({
  username: "12345678",
  password: "12345678",
});

// Metodos
const onLogin = async (values, actions) => {
  try {
    processing.value = true;
    errorMessage.value = "";
    await authStore.login(
      credentials.value.username,
      credentials.value.password
    );
  } catch (error) {
    if (error.response.status === 401) {
      errorMessage.value = error.response.data.error;
      return;
    }
    if (error.response.status === 422) {
      actions.setErrors(error.response.data.errors);
      return;
    }
    notify.danger();
    errorMessage.value =
      "Error del servidor, contacte con soporte => " +
      error.response.data.message;
  } finally {
    processing.value = false;
  }
};

const bannerClose = () => {
  errorMessage.value = "";
};
</script>

<style scoped>
.q-card {
  width: 360px;
}
</style>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <div class="bg-grey-4 window-height window-width row justify-center">
          <div class="column q-mt-xl q-pt-xl">
            <div class="text-center q-mb-sm">
              <img
                alt="SmartSales App"
                src="~assets/quasar-logo-vertical.svg"
                style="width: 200px; height: 200px"
              />
              <p />
              <span class="q-mt-md text-bold fs-2"
                >Sistema de Gestión de Ventas</span
              >
              <br />
              <span class="fs-5">Inicia sesión a continuación para acceder al sistema</span>
            </div>

            <div class="row">
              <q-card bordered class="q-pa-none shadow-1">
                <!-- Banner de alerta -->
                <q-banner
                  dense
                  inline-actions
                  class="text-white bg-red-4"
                  v-if="errorMessage"
                >
                  <span class="q-pl-sm">{{ errorMessage }}</span>
                  <template v-slot:action>
                    <q-btn
                      color="white"
                      icon="highlight_offe"
                      flat
                      dense
                      @click="bannerClose"
                    />
                  </template>
                </q-banner>

                <q-card-section>
                  <!-- Formulario login -->
                  <v-form
                    :initial-values="credentials"
                    autocomplete="off"
                    @submit="onLogin"
                    class="q-gutter-md"
                  >
                    <!-- Username -->
                    <v-field
                      name="username"
                      label="usuario"
                      rules="required"
                      v-slot="{ errorMessage, field }"
                    >
                      <q-input
                        type="text"
                        v-model="credentials.username"
                        placeholder="usuario"
                        v-bind="field"
                        outlined
                        dense
                      >
                        <template v-slot:append>
                          <q-icon name="person" />
                        </template>
                      </q-input>
                      <div class="q-my-xs fs-6 text-red-8">
                        {{ errorMessage }}
                      </div>
                    </v-field>

                    <!-- Password -->
                    <v-field
                      name="password"
                      label="contraseña"
                      rules="required"
                      v-slot="{ errorMessage, field }"
                    >
                      <q-input
                        type="password"
                        v-model="credentials.password"
                        placeholder="contraseña"
                        v-bind="field"
                        outlined
                        dense
                      >
                        <template v-slot:append>
                          <q-icon name="vpn_key" />
                        </template>
                      </q-input>
                      <div class="q-my-xs fs-6 text-red-8">
                        {{ errorMessage }}
                      </div>
                    </v-field>

                    <!-- Boton submit -->
                    <div class="row">
                      <q-btn
                        type="submit"
                        label="Ininiciar sesion"
                        color="primary"
                        :loading="processing"
                        class="full-width"
                        no-caps
                        stretch
                      >
                        <template v-slot:loading>
                          <q-spinner-hourglass class="on-left" />
                          Iniciando sesión ...
                        </template>
                      </q-btn>
                    </div>
                  </v-form>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
