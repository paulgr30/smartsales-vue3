<script setup>
import { computed, ref } from "vue";
import { useApi } from "src/composables/useApi";

import FormCategory from "src/pages/categories/FormPage.vue";
import FormUnit from "src/pages/units/FormPage.vue";

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
const loadingDialog = ref(false);
const categoryDialog = ref(false);
const unitDialog = ref(false);
const dataEntered = ref(false);
const product = ref({});
const categoryList = ref([]);
const unitList = ref([]);
const filteredCategories = ref([]);
const filteredUnits = ref([]);

// Metodos
const assignProperty = async () => {
  loadingDialog.value = true;
  product.value = props.item;

  if (!product.value.id) {
    product.value.purchase_price = 0;
    product.value.utility = 20;
    product.value.sale_price = 0;
    product.value.wholesale_price = 0;
    product.value.wholesale_quantity = 0;
  }

  await Promise.all([onCalculateUtility(), onGetCategories(), onGetUnits()])
  loadingDialog.value = false;
};

const onGetCategories = async () => {
  await get(`api/categories`);
  categoryList.value = JSON.parse(JSON.stringify(dataList.value));
  filteredCategories.value = JSON.parse(JSON.stringify(dataList.value));
};

const onGetUnits = async () => {
  await get(`api/units`);
  unitList.value = JSON.parse(JSON.stringify(dataList.value));
  filteredUnits.value = JSON.parse(JSON.stringify(dataList.value));
};

const onFilterCategories = (val, update) => {
  if (val === "") {
    update(() => {
      filteredCategories.value = categoryList.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredCategories.value = categoryList.value.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};

const onFilterUnits = (val, update) => {
  if (val === "") {
    update(() => {
      filteredUnits.value = JSON.parse(JSON.stringify(unitList.value));
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredUnits.value = unitList.value.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};

const onCalculateSalePrice = () => {
  const price =
    parseFloat(product.value.purchase_price * product.value.utility) / 100 +
    parseFloat(product.value.purchase_price);
  product.value.sale_price = price.toFixed(2);
};

const onCalculateUtility = () => {
  const utility =
    (parseFloat(product.value.sale_price - product.value.purchase_price) *
      100) /
    parseFloat(product.value.purchase_price);

  product.value.utility = isNaN(utility) ? 20 : utility.toFixed(2);
};

const onSave = async (values, actions) => {
  product.value.id
    ? await put(`api/products/${product.value.id}`, product.value)
    : await post(`api/products`, product.value);

  if (there_error.value) {
    if (validationErrors.value) {
      actions.setErrors(validationErrors.value);
    }
  } else {
    dataEntered.value = true;
    if (product.value.id) {
      dialogModel.value = false;
    } else {
      product.value = {
        purchase_price: 0,
        utility: 20,
        sale_price: 0,
        wholesale_price: 0,
        wholesale_quantity: 0,
        is_active: true,
      };
      actions.resetForm();
    }
  }
};

const openCategoryDialog = () => {
  categoryDialog.value = true;
};

const openUnitDialog = () => {
  unitDialog.value = true;
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
  return product.value.id ? "MODIFICAR PRODUCTO" : "REGISTRAR PRODUCTO";
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

      <!-- Formulario de categorias -->
      <form-category
        v-model="categoryDialog"
        :item="{ is_active: true }"
        @record-saved="onGetCategories"
      ></form-category>

      <!-- Formulario de unidades -->
      <form-unit
        v-model="unitDialog"
        :item="{ is_active: true }"
        @record-saved="onGetUnits"
      ></form-unit>

      <q-card-section class="text-center" v-if="loadingDialog">
        <q-linear-progress stripe indeterminate size="5px" />
      </q-card-section>

      <q-card-section class="scroll" v-else>
        <!-- Formulario -->
        <v-form :initial-values="product" autocomplete="off" @submit="onSave">
          <div class="row">
            <!-- Categoria -->
            <div class="col-12 col-md q-mr-sm">
              <label>
                Categoria
                <span
                  class="text-dark cursor-pointer"
                  @click="openCategoryDialog"
                  >[ + Nuevo ]</span
                >
              </label>
              <v-field
                v-model="product.category_id"
                name="category_id"
                label="categoria"
                rules="required"
                v-slot="{ errorMessage }"
              >
                <q-select
                  v-model="product.category_id"
                  :options="filteredCategories"
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
                  @filter="onFilterCategories"
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

            <!-- Unidad -->
            <div class="col-12 col-md">
              <label>
                Unidad
                <span class="text-dark cursor-pointer" @click="openUnitDialog"
                  >[ + Nuevo ]</span
                >
              </label>
              <v-field
                v-model="product.unit_id"
                name="unit_id"
                label="unidad"
                rules="required"
                v-slot="{ errorMessage }"
              >
                <q-select
                  v-model="product.unit_id"
                  :options="filteredUnits"
                  option-value="id"
                  option-label="name"
                  input-debounce="0"
                  outlined
                  dense
                  options-dense
                  emit-value
                  map-options
                  use-input
                  @filter="onFilterUnits"
                  :class="{ 'input-error': !!errorMessage }"
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
          </div>

          <div class="row">
            <!-- Nombre -->
            <div class="col">
              <label>Nombre *</label>
              <v-field
                name="name"
                v-model="product.name"
                label="nombre"
                rules="required"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="product.name"
                  placeholder="Ingrese nombre"
                  maxlength="255"
                  outlined
                  dense
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
            <!-- Stock inicial -->
            <div class="col-12 col-md q-mr-sm">
              <label>Stock Inicial</label>
              <v-field
                v-model="product.stock_initial"
                name="stock_initial"
                label="stock inicial"
                rules="required|min_value:0"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="product.stock_initial"
                  type="number"
                  placeholder="Ingrese stock inicial"
                  min="0"
                  pattern="^[0-9]+"
                  outlined
                  dense
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>

            <!-- Stock minimo -->
            <div class="col-12 col-md">
              <label>Stock Minimo</label>
              <v-field
                v-model="product.stock_min"
                name="stock_min"
                label="stock minimo"
                rules="required|min_value:0"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="product.stock_min"
                  type="number"
                  placeholder="Ingrese stock minimo"
                  min="0"
                  pattern="^[0-9]+"
                  outlined
                  dense
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
            <div class="col q-mt-md">
              <label>Gestion de precios</label>
              <hr />
            </div>
          </div>

          <div class="row">
            <!-- Precio compra -->
            <div class="col-12 col-md q-mr-sm">
              <label>Precio Compra</label>
              <v-field
                v-model="product.purchase_price"
                name="purchase_price"
                label="precio compra"
                rules="required|min_value:0"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="product.purchase_price"
                  type="number"
                  placeholder="Ingrese precio de compra"
                  min="0"
                  pattern="^[0-9]+"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                  @update:model-value="onCalculateSalePrice"
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>

            <!-- Utilidad -->
            <div class="col-12 col-md">
              <label>Utilidad</label>
              <v-field
                v-model="product.utility"
                name="utility"
                label="utilidad"
                rules="required|min_value:0"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="product.utility"
                  type="number"
                  placeholder="Ingrese utilidad"
                  min="0"
                  pattern="^[0-9]+"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                  @update:model-value="onCalculateSalePrice"
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>
          </div>

          <div class="row">
            <!-- Precio venta -->
            <div class="col-12 col-md q-mr-sm">
              <label>Precio Venta</label>
              <v-field
                v-model="product.sale_price"
                name="sale_price"
                label="precio venta"
                rules="required|min_value:1"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="product.sale_price"
                  type="number"
                  placeholder="Ingrese precio de venta"
                  min="1"
                  pattern="^[0-9]+"
                  v-bind="field"
                  :class="{ 'input-error': !!errorMessage }"
                  outlined
                  dense
                  @update:model-value="onCalculateUtility"
                />
                <div class="q-my-xs fs-6 text-red-8">
                  {{ errorMessage }}
                </div>
              </v-field>
            </div>

            <!-- Precio x mayor -->
            <div class="col-12 col-md">
              <label>Precio x Mayor</label>
              <v-field
                v-model="product.wholesale_price"
                name="wholesale_price"
                label="precio por mayor"
                rules="required|min_value:0"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="product.wholesale_price"
                  type="number"
                  placeholder="Ingrese precio por mayor"
                  min="0"
                  pattern="^[0-9]+"
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
            <!-- Cantidad x mayor -->
            <div class="col-12 col-md-6">
              <label>Cantidad x Mayor</label>
              <v-field
                v-model="product.wholesale_quantity"
                name="wholesale_quantity"
                label="cantidad por mayor"
                rules="required|min_value:0"
                v-slot="{ errorMessage, field }"
              >
                <q-input
                  v-model="product.wholesale_quantity"
                  type="number"
                  placeholder="Ingrese cantidad por mayor"
                  min="0"
                  pattern="^[0-9]+"
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
