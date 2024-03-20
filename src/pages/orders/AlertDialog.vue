<script setup>
import { computed, ref } from "vue";

// Propiedades
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  number: { required: true },
  total: { required: true },
});

// Eventos
const emit = defineEmits(["update:modelValue"]);

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

<template>
  <q-dialog v-model="dialogModel" position="top" persistent>
    <q-card style="width: 400px; max-width: 90vw">
      <q-card-section class="fs-1 text-center">
        <div class="q-mt-md text-bold">N° ORDEN: {{ number }}</div>
        <hr class="bg-primary" style="height: 1px" />
        <div class="text-orange-7 text-bold">Total: S/.{{ total }}</div>
      </q-card-section>

      <div class="row justify-center q-my-md">
        <!-- Boton aceptar -->
        <q-btn
          label="Aceptar"
          color="purple"
          class="fs-6"
          style="width: 100px"
          no-caps
          v-close-popup
        />
      </div>
    </q-card>
  </q-dialog>
</template>
