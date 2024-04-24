<script setup>
import { ref } from "vue";
import { useApi } from "src/composables/useApi";
import notify from "src/utils/notify";

// Composable
const { processing, there_error, dataList, validationErrors, get, post } = useApi();

// Variables
const config = ref({});
const imagePreview = ref(null);

// Metodos
const loadImage = () => {
  if (config.value.image_url) {
    imagePreview.value = process.env.IMAGE_URL + config.value.image_url;
  } else {
    imagePreview.value =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWknGAoHFzmh-h5njt4tAWMqtBQbcKfirS2rvX8cYGaDEE_ZMkKD9aBh2uQn8EWyFBWkM&usqp=CAU";
  }
};

const getConfig = async () => {
  await get("api/configurations");
  config.value = JSON.parse(JSON.stringify(dataList.value));
  loadImage();
};

const onImagePreview = async (e) => {
  config.value.image_url = e.target.files[0];
  if (config.value.image_url) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(config.value.image_url);
  } else {
    imagePreview.value = null;
  }
};

const onSave = async (values, actions) => {
  const frmData = new FormData();
  frmData.append("id", config.value.id);
  frmData.append("ruc", config.value.ruc);
  frmData.append("name_business", config.value.name_business);
  frmData.append("phone", config.value.phone);
  frmData.append("address", config.value.address);
  frmData.append("email", config.value.email);
  frmData.append("sales_tax", config.value.sales_tax);
  frmData.append("image_url", config.value.image_url);

  await post(`api/configurations/${config.value.id}`, frmData);
  if (there_error.value) {
    if (validationErrors.value) {
      actions.setErrors(validationErrors.value);
    }
  }
};

// Ejecutar
getConfig();
</script>

<style scoped>
.image-wrapper {
  position: relative;
  width: 100%;
}

.image-wrapper img {
  object-fit: cover;
  width: 50%;
  height: 50%;
}
</style>

<template>
  <q-page padding>
    <div class="row q-mt-xs">
      <div class="col-12 col-md q-mr-sm">
        <!-- Titulo -->
        <h6 class="q-my-sm">
          <q-icon name="settings" size="sm" class="q-mb-xs" />
          Configuracion
        </h6>

        <div class="q-mb-sm">
          Actualice los datos de su negocio, los cuales apareceran en los
          reportes y comprabantes que emita, asi como en algunas pantallas del
          sistema.
        </div>
      </div>

      <!-- Card -->
      <div class="col-12 col-md">
        <q-card flat bordered class="shadow-1">
          <q-card-section>
            <div class="row">
              <div class="col-12 q-mb-md">
                <v-form
                  :initial-values="config"
                  autocomplete="off"
                  @submit="onSave"
                >
                  <div class="row">
                    <!-- Imagen -->
                    <div class="col-12">
                      <label class="q-mb-md">Logotipo</label>
                      <div class="image-wrapper text-center">
                        <img id="picture" ref="picture" :src="imagePreview" />
                      </div>

                      <q-file
                        accept="image/*"
                        prefix="Click para seleccionar imagen"
                        class="fs-6"
                        dense
                        @input="onImagePreview"
                      />
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">
                      <div class="row">
                        <!-- Ruc -->
                        <div class="col-12 col-md q-mr-md q-mb-sm">
                          <label>
                            Ruc
                            <v-field
                              name="ruc"
                              v-model="config.ruc"
                              label="ruc"
                              rules="required|numeric|min:11|max:11"
                              v-slot="{ errorMessage, field }"
                            >
                              <q-input
                                v-model="config.ruc"
                                placeholder="Ingrese n° ruc"
                                maxlength="11"
                                v-bind="field"
                                :class="{ 'input-error': !!errorMessage }"
                                dense
                              />
                              <div class="q-my-xs fs-6 text-red-8">
                                {{ errorMessage }}
                              </div>
                            </v-field>
                          </label>
                        </div>

                        <!-- Nombre comercial -->
                        <div class="col-12 col-md q-mb-sm">
                          <label>
                            Nombre comercial
                            <v-field
                              name="name_business"
                              v-model="config.name_business"
                              label="nombre comercial"
                              rules="required"
                              v-slot="{ errorMessage, field }"
                            >
                              <q-input
                                v-model="config.name_business"
                                placeholder="Ingrese nombre comercial"
                                v-bind="field"
                                :class="{ 'input-error': !!errorMessage }"
                                dense
                              />
                              <div class="q-my-xs fs-6 text-red-8">
                                {{ errorMessage }}
                              </div>
                            </v-field>
                          </label>
                        </div>
                      </div>

                      <div class="row">
                        <!-- Telefono -->
                        <div class="col-12 col-md q-mr-md q-mb-sm">
                          <label>
                            Telefono
                            <v-field
                              name="phone"
                              v-model="config.phone"
                              label="telefono"
                              rules="required|max:12"
                              v-slot="{ errorMessage, field }"
                            >
                              <q-input
                                v-model="config.phone"
                                placeholder="Ingrese n° telefono"
                                maxlength="12"
                                v-bind="field"
                                :class="{ 'input-error': !!errorMessage }"
                                dense
                              />
                              <div class="q-my-xs fs-6 text-red-8">
                                {{ errorMessage }}
                              </div>
                            </v-field>
                          </label>
                        </div>

                        <!-- Direccion -->
                        <div class="col-12 col-md q-mb-sm q-mb-sm">
                          <label>
                            Direccion
                            <v-field
                              name="address"
                              v-model="config.address"
                              label="direccion"
                              rules="required"
                              v-slot="{ errorMessage, field }"
                            >
                              <q-input
                                v-model="config.address"
                                placeholder="Ingrese direccion"
                                v-bind="field"
                                :class="{ 'input-error': !!errorMessage }"
                                dense
                              />
                              <div class="q-my-xs fs-6 text-red-8">
                                {{ errorMessage }}
                              </div>
                            </v-field>
                          </label>
                        </div>
                      </div>

                      <div class="row">
                        <!-- Correo -->
                        <div class="col-12 col-md q-mr-md q-mb-sm">
                          <label>
                            Correo electronico
                            <v-field
                              name="email"
                              v-model="config.email"
                              label="correo"
                              rules="required|email"
                              v-slot="{ errorMessage, field }"
                            >
                              <q-input
                                v-model="config.email"
                                placeholder="Ingrese correo electronico"
                                v-bind="field"
                                :class="{ 'input-error': !!errorMessage }"
                                dense
                              />
                              <div class="q-my-xs fs-6 text-red-8">
                                {{ errorMessage }}
                              </div>
                            </v-field>
                          </label>
                        </div>

                        <!-- Impuesto -->
                        <div class="col-12 col-md q-mb-md">
                          <label>
                            Impuesto
                            <v-field
                              name="sales_tax"
                              v-model="config.sales_tax"
                              label="impuesto"
                              rules="required"
                              v-slot="{ errorMessage, field }"
                            >
                              <q-input
                                type="number"
                                v-model="config.sales_tax"
                                placeholder="Ingrese impuesto"
                                v-bind="field"
                                :class="{ 'input-error': !!errorMessage }"
                                dense
                              />
                              <div class="q-my-xs fs-6 text-red-8">
                                {{ errorMessage }}
                              </div>
                            </v-field>
                          </label>
                        </div>
                      </div>

                      <div class="row justify-end">
                        <!-- Boton aceptar -->
                        <q-btn
                          no-caps
                          type="submit"
                          label="Actualizar"
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
                    </div>
                  </div>
                </v-form>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
