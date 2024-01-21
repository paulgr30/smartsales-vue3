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
const identityDocument = ref({});

// Metodos
const assignProperty = () => {
  identityDocument.value = props.item;
};

const onSave = async (values, actions) => {
  identityDocument.value.id
    ? await put(
        `http://localhost/smartsales/smartsales-laravel10/public/api/identitydocuments/${identityDocument.value.id}`,
        identityDocument.value
      )
    : await post(
        `http://localhost/smartsales/smartsales-laravel10/public/api/identitydocuments`,
        identityDocument.value
      );

  if (there_error.value) {
    if (validationErrors.value) {
      actions.setErrors(validationErrors.value);
    }
  } else {
    dataEntered.value = true;
    if (identityDocument.value.id) {
      dialogModel.value = false;
    } else {
      identityDocument.value = { is_active: true };
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
  return identityDocument.value.id
    ? "MODIFICAR DOCUMENTO DE IDENTIDAD"
    : "REGISTRAR DOCUMENTO DE IDENTIDAD";
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
          :initial-values="identityDocument"
          autocomplete="off"
          @submit="onSave"
        >
          <div class="row">
            <!-- Nombre -->
            <div class="col">
              <label>Nombre</label>
              <v-field
                name="name"
                v-model="identityDocument.name"
                label="nombre"
                rules="required"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  outlined
                  dense
                  placeholder="Ingrese nombre"
                  v-model="identityDocument.name"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>
          </div>

          <div class="row">
            <!-- Descripcion -->
            <div class="col">
              <label>Descripcion</label>
              <v-field
                name="description"
                v-model="identityDocument.description"
                label="descripcion"
                rules="required"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  outlined
                  dense
                  placeholder="Ingrese descripcion"
                  v-model="identityDocument.description"
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
