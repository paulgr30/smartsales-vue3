<script setup>
import { computed, ref } from "vue";
import { useApi } from "src/composables/useApi";

// Propiedades
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  item: { type: Object, required: true },
});

// Eventos
const emit = defineEmits(["update:modelValue", "record-saved"]);

// Composables
const { processing, there_error, validationErrors, post, put } = useApi();

// Variables
const dataEntered = ref(false);
const category = ref({});

// Metodos
const assignProperty = () => {
  category.value = props.item;
};

const onSave = async (values, actions) => {
  category.value.id
    ? await put(
        `api/categories/${category.value.id}`,
        category.value
      )
    : await post(`api/categories`, category.value);

  if (there_error.value) {
    if (validationErrors.value) {
      actions.setErrors(validationErrors.value);
    }
  } else {
    dataEntered.value = true;
    if (category.value.id) {
      dialogModel.value = false;
    } else {
      category.value = { is_active: true };
      actions.resetForm({});
    }
  }
};

const closeDialog = () => {
  if (dataEntered.value) {
    emit("record-saved");
  }
  dataEntered.value = false;
};

// Computadas
const dialogModel = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  },
});

const dialogTitle = computed(() => {
  return category.value.id
    ? "MODIFICAR CATEGORIA"
    : "REGISTRAR CATEGORIA";
});
</script>

<template>
  <q-dialog
    v-model="dialogModel"
    position="top"
    persistent
    @before-show="assignProperty"
    @before-hide="closeDialog"
  >
    <q-card style="width: 550px; max-width: 90vw">
      <!-- Titulo -->
      <q-card-section class="q-py-sm bg-blue-7 text-white">
        <div class="text-body2">{{ dialogTitle }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="scroll">
        <!-- Formulario -->
        <v-form
          :initial-values="category"
          autocomplete="off"
          @submit="onSave"
        >
          <div class="row">
            <!-- Nombre -->
            <div class="col">
              <label>Nombre</label>
              <v-field
                name="name"
                v-model="category.name"
                label="nombre"
                rules="required"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  outlined
                  dense
                  placeholder="Ingrese nombre"
                  v-model="category.name"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>
          </div>

          <q-separator color="blue" class="q-mt-md" />

          <div class="row justify-end q-mt-sm">
            <!-- Boton cerrar -->
            <q-btn
              outline
              no-caps
              dense
              v-close-popup
              label="Cerrar"
              color="red-7"
              class="q-mr-sm fs-6"
              style="width: 125px"
            />

            <!-- Boton aceptar -->
            <q-btn
              no-caps
              type="submit"
              label="Aceptar"
              color="primary"
              :loading="processing"
              class="fs-6"
              style="width: 125px"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                <span class="fs-6">Procesando...</span>
              </template>
            </q-btn>
          </div>
        </v-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
