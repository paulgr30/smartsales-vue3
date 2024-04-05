<script setup>
import { ref } from "vue";
import { useAuthStore } from "src/stores/authStore";
import notify from "src/utils/notify";

// Variables
const authStore = useAuthStore();

const profile = ref({});
const password = ref({});
const processingProfile = ref(false);
const processingPassword = ref(false);

// Metodos
const loadProfile = async () => {
  try {
    await authStore.getProfile();
    profile.value = { ...authStore.getAuth.user };
  } catch (error) {
      notify.danger(
        "Error del servidor, contacte con soporte => " +
          error.response.data.message
      );
  }
};

const updateProfile = async (values, actions) => {
  processingProfile.value = true;
  try {
    await authStore.updateProfile(profile.value);
    notify.success();
  } catch (error) {
    if (error.response.status === 422) {
      notify.warning();
      actions.setErrors(error.response.data.errors);
      return;
    }
  } finally {
    processingProfile.value = false;
  }
};

const updatePassword = async (values, actions) => {
  try {
    processingPassword.value = true;
    await authStore.changePassword(password.value);
    password.value = {};
    notify.success();
  } catch (error) {
    if (error.response.status === 422) {
      notify.warning();
      actions.setErrors(error.response.data.errors);
      return;
    }
  } finally {
    processingPassword.value = false;
  }
};

// Ejecucion de Metodos
loadProfile();
</script>

<template>
  <q-page padding>
    <!-- Titulo -->
    <h5 class="q-my-sm">
      <q-icon name="person" class="q-mb-xs" />
      Mi Perfil
    </h5>
    <!-- Fila Perfil -->
    <div class="row q-mt-xs">
      <div class="col-12 col-md">
        <!-- Subtitulo Perfil -->
        <h6 class="q-my-xs">Información de Perfil</h6>
        <!-- Descripcion Perfil -->
        <div class="q-mb-sm">
          Actualice la información de su cuenta y la dirección de correo
          electrónico
        </div>
      </div>

      <!-- Formulario Perfil -->
      <div class="col-12 col-md">
        <q-card flat bordered class="q-pa-sm">
          <q-card-section>
            <!-- Form -->
            <v-form
              :initial-values="profile"
              autocomplete="off"
              @submit="updateProfile"
              class="q-gutter-sm"
            >
              <div class="row">
                <!-- Nombres -->
                <div class="col">
                  <label>Nombres *</label>
                  <v-field
                    v-model="profile.name"
                    name="name"
                    label="nombres"
                    rules="required"
                    v-slot="{ errorMessage, field }"
                  >
                    <q-input
                      v-model="profile.name"
                      v-bind="field"
                      :class="{ 'input-line-error': !!errorMessage }"
                      dense
                    />
                    <div class="q-my-xs fs-6 text-red-8">
                      {{ errorMessage }}
                    </div>
                  </v-field>
                </div>
              </div>

              <div class="row">
                <!-- Correo -->
                <div class="col-12">
                  <label>Correo *</label>
                  <v-field
                    v-model="profile.email"
                    name="email"
                    label="correo"
                    rules="required|email"
                    v-slot="{ errorMessage, field }"
                  >
                    <q-input
                      type="email"
                      v-model="profile.email"
                      v-bind="field"
                      :class="{ 'input-line-error': !!errorMessage }"
                      dense
                    />
                    <div class="q-my-xs fs-6 text-red-8">
                      {{ errorMessage }}
                    </div>
                  </v-field>
                </div>
              </div>

              <div class="row justify-end">
                <!-- Boton submit -->
                <q-btn
                  no-caps
                  type="submit"
                  label="Actualizar"
                  color="primary"
                  :loading="processingProfile"
                  style="width: 140px"
                >
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    Procesando...
                  </template>
                </q-btn>
              </div>
            </v-form>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Fila Contraseña -->
    <div class="row q-mt-lg">
      <div class="col-12 col-md">
        <!-- Subtitulo Contraseña -->
        <h6 class="q-my-xs">Cambio de contraseña</h6>
        <!-- Descripcion Contraseña -->
        <div class="q-mb-sm">
          Actualice su contraseña por seguridad. Recuerde que tendra que volver
          a iniciar sesión.
        </div>
      </div>

      <!-- Formulario Contraseña -->
      <div class="col-12 col-md">
        <q-card flat bordered class="q-pa-sm">
          <q-card-section>
            <!-- Formulario -->
            <v-form
              :initial-values="password"
              autocomplete="off"
              @submit="updatePassword"
              class="q-gutter-sm"
            >
              <div class="row">
                <!-- Contraseña Actual -->
                <div class="col">
                  <label>Contraseña Actual *</label>
                  <v-field
                    name="current_password"
                    label="contraseña actual"
                    rules="required"
                    v-slot="{ errorMessage, field }"
                  >
                    <q-input
                      type="password"
                      v-model="password.current_password"
                      v-bind="field"
                      :class="{ 'input-line-error': !!errorMessage }"
                      dense
                    />
                    <div class="q-my-xs fs-6 text-red-8">
                      {{ errorMessage }}
                    </div>
                  </v-field>
                </div>
              </div>

              <div class="row">
                <!-- Nueva Contraseña -->
                <div class="col">
                  <label>Nueva Contraseña *</label>
                  <v-field
                    name="new_password"
                    label="nueva contraseña"
                    rules="required|min:8"
                    v-slot="{ errorMessage, field }"
                  >
                    <q-input
                      type="password"
                      v-model="password.new_password"
                      v-bind="field"
                      :class="{ 'input-line-error': !!errorMessage }"
                      dense
                    />
                    <div class="q-my-xs fs-6 text-red-8">
                      {{ errorMessage }}
                    </div>
                  </v-field>
                </div>
              </div>

              <div class="row">
                <!-- Confirmar Contraseña -->
                <div class="col">
                  <label>Confirmar Contraseña *</label>
                  <v-field
                    name="new_password_confirmation"
                    label="confirmar nueva contraseña"
                    rules="required|confirmed:@new_password|min:8"
                    v-slot="{ errorMessage, field }"
                  >
                    <q-input
                      type="password"
                      v-model="password.new_password_confirmation"
                      v-bind="field"
                      :class="{ 'input-line-error': !!errorMessage }"
                      dense
                    />
                    <div class="q-my-xs fs-6 text-red-8">
                      {{ errorMessage }}
                    </div>
                  </v-field>
                </div>
              </div>

              <div class="row justify-end">
                <!-- Boton submit -->
                <q-btn
                  type="submit"
                  label="Actualizar"
                  color="primary"
                  :loading="processingPassword"
                  style="width: 140px"
                  no-caps
                >
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    Procesando...
                  </template>
                </q-btn>
              </div>
            </v-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
