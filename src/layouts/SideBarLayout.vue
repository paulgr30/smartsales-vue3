<script setup>
import { computed, ref } from "vue";
// Propiedades
const props = defineProps({
  modelValue: { type: Boolean, required: true },
});

// Eventos
const emit = defineEmits(["update:modelValue"]);

// Variables
const link = ref("ordenes");

// Computadas
const dialogModel = computed({
    get() {
      return props.modelValue;
    },
    set(newValue) {
      emit("update:modelValue", newValue);
    },
  });
</script>

<style lang="scss" scope>
.my-menu-link {
  color: white;
  background: #333;
}

.sidebar.q-item:hover {
  background: $grey-9;
}
</style>

<template>
  <q-drawer
    v-model="dialogModel"
    side="left"
    class="sidebar bg-blue-grey-9"
    :width="250"
    :breakpoint="500"
    elevated
  >
    <!-- Logo -->
    <div class="row text-h6 text-grey-3" style="padding: 9px; padding-left: 20px">
      <q-icon name="handyman" size="md" />
      <div class="q-ml-sm">SMARTSALES</div>
    </div>
    <q-separator color="grey-8" />

    <!-- Menu -->
    <div class="q-pt-none q-pl-xs q-pr-none">
      <q-list padding class="rounded-borders text-white">
        <!-- Gestion de cotizaciones -->
        <q-item-label header class="q-mt-md q-pb-xs text-grey-4">
          GESTION DE COTIZACIONES
        </q-item-label>
        <!-- Cotizaciones -->
        <q-item
          clickable
          v-ripple
          :active="link === 'ordenes'"
          @click="link = 'ordenes'"
          active-class="my-menu-link"
          :to="{ name: 'order' }"
        >
          <q-item-section class="q-pl-sm">
            <q-item-label>
              <q-icon name="article" size="sm" />
              <span class="q-pl-sm">Cotizaciones</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Clientes -->
        <q-item
          clickable
          v-ripple
          :active="link === 'clientes'"
          @click="link = 'clientes'"
          active-class="my-menu-link"
          :to="{ name: 'customer' }"
        >
          <q-item-section class="q-pl-sm">
            <q-item-label>
              <q-icon name="groups" size="sm" />
              <span class="q-pl-sm">Clientes</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Gestion del negocio -->
        <q-item-label header class="q-mt-md q-pb-xs text-grey-4">
          GESTION DEL NEGOCIO
        </q-item-label>

        <!-- Catalogo -->
        <q-expansion-item expand-separator group="somegroup">
          <template v-slot:header>
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="receipt_long" size="sm" />
                <span class="q-pl-sm">Catálogo</span>
              </q-item-label>
            </q-item-section>
          </template>

          <!-- Documento identidad -->
          <q-item
            clickable
            v-ripple
            :active="link === 'documento_identidad'"
            @click="link = 'documento_identidad'"
            active-class="my-menu-link"
            :to="{ name: 'identity-document' }"
          >
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="radio_button_unchecked" size="xs" class="q-pb-xs" />
                <span class="q-pl-sm">Documentos de identidad</span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- Categorias -->
          <q-item
            clickable
            v-ripple
            :active="link === 'categoria'"
            @click="link = 'categorias'"
            active-class="my-menu-link"
            :to="{ name: 'category' }"
          >
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="radio_button_unchecked" size="xs" class="q-pb-xs" />
                <span class="q-pl-sm">Categorias</span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- Productos -->
          <q-item
            clickable
            v-ripple
            :active="link === 'productos'"
            @click="link = 'productos'"
            active-class="my-menu-link"
            :to="{ name: 'products' }"
          >
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="radio_button_unchecked" size="xs" class="q-pb-xs" />
                <span class="q-pl-sm">Productos</span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- NEGOCIO -->
        <q-expansion-item expand-separator group="somegroup">
          <template v-slot:header>
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="apartment" size="sm" />
                <span class="q-pl-sm">Negocio</span>
              </q-item-label>
            </q-item-section>
          </template>

          <!-- Configuracion -->
          <q-item
            clickable
            v-ripple
            :active="link === 'configuracion'"
            @click="link = 'configuracion'"
            active-class="my-menu-link"
          >
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="radio_button_unchecked" size="xs" class="q-pb-xs" />
                <span class="q-pl-sm">Configuración</span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- Usuarios -->
          <q-item
            clickable
            v-ripple
            :active="link === 'usuario'"
            @click="link = 'usuario'"
            active-class="my-menu-link"
          >
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="radio_button_unchecked" size="xs" class="q-pb-xs" />
                <span class="q-pl-sm">Personal</span>
              </q-item-label>
            </q-item-section>
          </q-item>

        </q-expansion-item>

        <!-- Reportes -->
        <q-expansion-item expand-separator group="somegroup">
          <template v-slot:header>
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="insights" size="sm" class="q-text-bold" />
                <span class="q-pl-sm">Reportes</span>
              </q-item-label>
            </q-item-section>
          </template>

          <!-- Reparaciones por periodo -->
          <q-item
            clickable
            v-ripple
            :active="link === 'rep_citas'"
            @click="link = 'rep_citas'"
            active-class="my-menu-link"
          >
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="radio_button_unchecked" size="xs" class="q-pb-xs" />
                <span class="q-pl-sm">Reparaciones por periodo</span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- Clientes frecuentes -->
          <q-item
            clickable
            v-ripple
            :active="link === 'usuario'"
            @click="link = 'usuario'"
            active-class="my-menu-link"
          >
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="radio_button_unchecked" size="xs" class="q-pb-xs" />
                <span class="q-pl-sm">Clientes Frecuentes</span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- Atenciones por marca -->
          <q-item
            clickable
            v-ripple
            :active="link === 'rep_citas'"
            @click="link = 'rep_citas'"
            active-class="my-menu-link"
          >
            <q-item-section class="q-pl-sm">
              <q-item-label>
                <q-icon name="radio_button_unchecked" size="xs" class="q-pb-xs" />
                <span class="q-pl-sm">Atenciones por marca</span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </div>
  </q-drawer>
</template>
