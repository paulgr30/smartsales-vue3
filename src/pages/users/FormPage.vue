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
const { dataList, processing, there_error, validationErrors, get, post, put } =
  useApi();

// Variables
const userForm = ref();
const disableInput = ref(true);
const loadingDialog = ref(false);
const dataEntered = ref(false);
const consulting = ref(false);

const user = ref({});
const profile = ref({});
const roles = ref([]);
const roleList = ref([]);
const identityDocumentList = ref([]);
const filteredData = ref([]);

// Metodos
const assignProperty = async () => {
  try {
    disableInput.value = props.item.id ? false : true;
    loadingDialog.value = true;
    user.value = props.item;
    profile.value = props.item.profile || {};

    roles.value = [];
    if (props.item.roles) {
      roles.value = props.item.roles.map((role) => role.name);
    }

    await onGetIdentityDocuments();
    await onGetRoles();
    loadingDialog.value = false;
  } catch (error) {
  } finally {
    loadingDialog.value = false;
  }
};

const onGetIdentityDocuments = async () => {
  await get(`api/identitydocuments`);
  identityDocumentList.value = JSON.parse(JSON.stringify(dataList.value));
  filteredData.value = JSON.parse(JSON.stringify(dataList.value));
};

const onGetRoles = async () => {
  await get(`api/roles`);
  roleList.value = JSON.parse(JSON.stringify(dataList.value));
};

const onFilterIdentityDocument = (val, update) => {
  if (val === "") {
    update(() => {
      filteredData.value = identityDocumentList.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredData.value = identityDocumentList.value.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};

const onGetByNumberId = async () => {
  const validatedField = await userForm.value.validateField(
    "profile.number_id"
  );
  if (!validatedField.valid) return;

  consulting.value = true;
  const { identity_document_id, number_id } = profile.value;

  user.value = {};
  profile.value = {};
  await userForm.value.resetForm();
  profile.value = { identity_document_id, number_id };

  await get("api/users/bynumberid", {
    profile: { number_id: profile.value.number_id },
  });

  if (there_error.value && validationErrors.value) {
    userForm.value.setErrors(validationErrors.value);
  } else {
    if (dataList.value.id) {
      user.value = { ...dataList.value };
      profile.value = { ...dataList.value.profile };

      roles.value = [];
      if (user.value.roles) {
        roles.value = user.value.roles.map((role) => role.name);
      }
    }
  }
  disableInput.value = consulting.value = false;
};

const onSave = async (values, actions) => {
  user.value.profile = profile.value;
  user.value.roles = roles.value;
  user.value.id
    ? await put(`api/users/${user.value.id}`, user.value)
    : await post(`api/users`, user.value);

  if (there_error.value) {
    if (validationErrors.value) {
      actions.setErrors(validationErrors.value);
    }
  } else {
    dataEntered.value = true;
    if (user.value.id) {
      dialogModel.value = false;
    } else {
      user.value = {};
      actions.resetForm();
      disableInput.value = true;
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
  return user.value.id ? "MODIFICAR PERSONAL" : "REGISTRAR PERSONAL";
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

      <q-card-section class="text-center" v-if="loadingDialog">
        <q-linear-progress stripe indeterminate size="5px" />
      </q-card-section>

      <q-card-section class="scroll" v-else>
        <!-- Formulario -->
        <v-form
          :initial-values="user"
          autocomplete="off"
          ref="userForm"
          @submit="onSave"
        >
          <div class="row">
            <!-- Tipo documento -->
            <div class="col-12 col-md q-mr-sm">
              <label> Tipo Documento </label>
              <v-field
                name="profile.identity_document_id"
                v-model="profile.identity_document_id"
                label="tipo documento"
                rules="required"
                v-slot="{ errorMessage }"
              >
                <q-select
                  v-model="profile.identity_document_id"
                  :options="filteredData"
                  option-value="id"
                  option-label="name"
                  input-debounce="0"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                  options-dense
                  emit-value
                  map-options
                  use-input
                  @filter="onFilterIdentityDocument"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section>No hay resultados</q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>

            <!-- Numero identificacion -->
            <div class="col-12 col-md">
              <label>N° Documento</label>
              <v-field
                name="profile.number_id"
                v-model="profile.number_id"
                label="n° documento"
                rules="required|min:8|max:15"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="profile.number_id"
                  type="number"
                  placeholder="Ingrese numero"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  class="q-append"
                  outlined
                  dense
                >
                  <template v-slot:append>
                    <q-btn
                      label="Buscar"
                      icon="search"
                      color="purple"
                      :loading="consulting"
                      class="q-ml-xs q-px-sm fs-6"
                      dense
                      no-caps
                      @click="onGetByNumberId"
                    >
                      <template v-slot:loading>
                        <q-spinner-hourglass class="on-left" />
                      </template>
                    </q-btn>
                  </template>
                </q-input>
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>
          </div>

          <div class="row">
            <!-- Nombre -->
            <div class="col">
              <label>Nombre</label>
              <v-field
                name="name"
                v-model="user.name"
                label="nombre"
                rules="required|max:255"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="user.name"
                  placeholder="Ingrese nombre"
                  maxlength="255"
                  :disable="disableInput"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>
          </div>

          <div class="row">
            <!-- Direccion -->
            <div class="col-12 col-md q-mr-sm">
              <label>Direccion</label>
              <v-field
                v-model="profile.address"
                name="profile.address"
                label="direccion"
                rules="required|max:255"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="profile.address"
                  placeholder="Ingrese direccion"
                  maxlength="255"
                  :disable="disableInput"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>

            <!-- Telefono -->
            <div class="col-12 col-md">
              <label>Telefono</label>
              <v-field
                v-model="profile.phone"
                name="profile.phone"
                label="telefono"
                rules="required|min:6|max:12"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="profile.phone"
                  type="number"
                  placeholder="Ingrese telefono"
                  maxlength="12"
                  :disable="disableInput"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
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
            <div class="col">
              <label>Correo</label>
              <v-field
                v-model="user.email"
                name="email"
                label="correo"
                rules="required|email|max:255"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="user.email"
                  placeholder="Ingrese un correo"
                  maxlength="255"
                  :disable="disableInput"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>
          </div>

          <div class="row">
            <!-- Usuario -->
            <div class="col-12 col-md q-mr-sm">
              <label>Usuario</label>
              <v-field
                v-model="user.username"
                name="user.username"
                label="usuario"
                rules="required|min:8|max:255"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="user.username"
                  placeholder="Ingrese usuario"
                  maxlength="255"
                  :disable="disableInput"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>

            <!-- Contraseña -->
            <div v-if="user.id" class="col-12 col-md">
              <label>Contraseña</label>
              <v-field
                v-model="user.password"
                name="user.password"
                label="contraseña"
                rules="min:8"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="user.password"
                  type="text"
                  placeholder="Ingrese contraseña, si desea modificarla"
                  maxlength="15"
                  :disable="disableInput"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>

            <div v-else class="col-12 col-md">
              <label>Contraseña</label>
              <v-field
                v-model="user.password"
                name="user.password"
                label="contraseña"
                rules="required|min:8"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="user.password"
                  type="text"
                  placeholder="Ingrese contraseña"
                  maxlength="15"
                  :disable="disableInput"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>
          </div>

          <div class="row q-gutter-sm">
            <!-- Roles -->
            <div class="col">
              <label>Roles</label>
              <br />
              <v-field
                name="roles"
                label="roles"
                :rules="{ required: !user.id }"
                v-slot="{ errorMessage, field }"
              >
                <q-checkbox
                  v-for="role in roleList"
                  :key="role.id"
                  v-model="roles"
                  :val="role.name"
                  :label="role.name"
                  :disable="disableInput"
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
