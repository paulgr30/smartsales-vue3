<script setup>
import { computed, defineEmits } from "vue";
import { useQuasar } from "quasar";

// Propiedades
const props = defineProps({
  modelValue: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalRecords: { type: Number, required: true },
});

// Eventos
const emit = defineEmits(["update:modelValue", "click-page"]);

// Variables
const $q = useQuasar();

// Metodos
const onClickPage = () => {
  emit("click-page");
};

// Computadas
const pageModel = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  },
});

const responsivePaginationData = computed(() => {
  return $q.screen.lt.md ? "q-mb-md text-center" : "text-left";
});

const responsivePaginator = computed(() => {
  return $q.screen.lt.md ? "items-center q-mb-md" : "items-end";
});
</script>

<template>
  <!-- Paginacion -->
  <div class="row">
    <!-- Data Paginacion -->
    <div class="col-12 col-md-6" :class="responsivePaginationData">
      Pagina {{ modelValue }} de {{ totalPages }} -
      {{ totalRecords }} resultados
    </div>

    <!-- Paginador -->
    <div class="col-12 col-md-6">
      <div class="column" :class="responsivePaginator">
        <q-pagination
          direction-links
          v-model="pageModel"
          :max="totalPages"
          max-pages="10"
          class="bg-white bordered"
          @update:model-value="onClickPage()"
        />
      </div>
    </div>
  </div>
</template>
