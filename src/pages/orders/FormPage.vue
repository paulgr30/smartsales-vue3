<script setup>
import { computed, ref } from "vue";
import { useApi } from "src/composables/useApi";
import { useHelpers } from "src/composables/useHelpers";

import FormCustomer from "src/pages/customers/FormPage.vue";
import AlertDialog from "./AlertDialog.vue";

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

const { getCurrentDate, formatDate, formatTime } = useHelpers();

// Variables
const itemForm = ref();
const loadingDialog = ref(false);
const customerDialog = ref(false);
const openAlertDialog = ref(false);
const dataEntered = ref(false);
const itemError = ref(null);
const order = ref({});
const product = ref({});
const response = ref({});
const customerList = ref([]);
const filteredCustomers = ref([]);
const productList = ref([]);
const filteredProducts = ref([]);
const items = ref([]);
const columnList = [
  {
    name: "quantity",
    label: "Cantidad",
    align: "center",
    sortable: true,
    style: "width:70px;",
  },
  {
    name: "unit_name",
    field: "unit",
    label: "Unidad",
    align: "left",
    sortable: true,
    style: "width:100px;",
  },
  {
    name: "product",
    field: "product",
    label: "Producto",
    align: "left",
    sortable: true,
    style: "width:200px;",
  },
  {
    name: "price",
    field: "price",
    label: "Precio",
    align: "left",
    sortable: true,
    style: "width:70px;",
  },
  {
    name: "amount",
    field: (row) => parseFloat(row.quantity * row.price).toFixed(2),
    label: "Importe",
    align: "left",
    sortable: true,
    style: "width:70px;",
  },
  {
    name: "actions",
    label: "",
    align: "center",
    style: "width:20px;",
  },
];

// Metodos
const assignProperty = async () => {
  loadingDialog.value = true;
  product.value = { full_name: null };
  items.value = [];

  order.value = { ...props.item, total: 0 };
  if (order.value.id) {
    order.value.created_at =
      formatDate(order.value.created_at, "dd-mm-yyyy") +
      "   " +
      formatTime(order.value.created_at, "hh:mm A", false);

    items.value = order.value.products.map((item) => {
      const {
        pivot,
        unit,
        name,
        sale_price,
        wholesale_price,
        wholesale_quantity,
      } = item;
      return {
        id: pivot.order_id,
        product_id: pivot.product_id,
        quantity: pivot.quantity,
        unit: unit.name,
        product: name,
        price: pivot.price,
        price1: sale_price,
        price2: wholesale_price,
        quantity1: wholesale_quantity,
      };
    });
  } else {
    order.value.number = "NUEVO";
    order.value.created_at = getCurrentDate();
  }

  await Promise.all([onGetCustomers(), onGetProducts()]);
  loadingDialog.value = false;
};

const onGetCustomers = async () => {
  await get("api/users");

  customerList.value = dataList.value.map((customer) => ({
    ...customer,
    full_name: customer.profile.number_id + " - " + customer.name,
  }));

  filteredCustomers.value = await JSON.parse(
    JSON.stringify(customerList.value)
  );
};

const onGetProducts = async () => {
  await get("api/products");

  productList.value = dataList.value.map((product) => ({
    ...product,
    full_name: product.name + " - " + product.sale_price,
  }));
  filteredProducts.value = await JSON.parse(JSON.stringify(productList.value));
};

const onFilterCustomers = (val, update) => {
  if (val === "") {
    update(() => {
      filteredCustomers.value = JSON.parse(JSON.stringify(customerList.value));
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredCustomers.value = customerList.value.filter(
      (v) => v.full_name.toLowerCase().indexOf(needle) > -1
    );
  });
};

const onFilterProducts = (val, update) => {
  if (val === "") {
    update(() => {
      filteredProducts.value = JSON.parse(JSON.stringify(productList.value));
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredProducts.value = productList.value.filter(
      (v) => v.full_name.toLowerCase().indexOf(needle) > -1
    );
  });
};

const onAddItem = async () => {
  itemError.value = null;
  // Si el producto ya existe obtenemos el index
  const existingItemIndex = items.value.findIndex(
    (obj) => obj.product_id === product.value.id
  );

  if (existingItemIndex !== -1) {
    items.value[existingItemIndex].quantity =
      parseFloat(items.value[existingItemIndex].quantity) + 1;

    onGetPrice(existingItemIndex);
  } else {
    const {
      id: product_id,
      name: product_name,
      sale_price,
      wholesale_price,
      wholesale_quantity,
    } = product.value;
    const { name: unit_name } = product.value.unit;

    items.value.unshift({
      product_id,
      quantity: 1,
      unit: unit_name,
      product: product_name,
      price: sale_price,
      price1: sale_price,
      price2: wholesale_price,
      quantity1: wholesale_quantity,
    });
  }

  itemForm.value.resetForm();
  product.value = { full_name: null };
};

const onGetPrice = (index) => {
  let item = items.value[index];
  const { price1, price2, quantity, quantity1 } = item;

  if (
    parseFloat(price2) === 0 ||
    parseFloat(quantity) < parseFloat(quantity1)
  ) {
    item.price = JSON.parse(JSON.stringify(price1));
  } else {
    item.price = JSON.parse(JSON.stringify(price2));
  }
};

const onRemoveItem = (index) => {
  items.value.splice(index, 1);
};

const onSave = async (values, actions) => {
  itemError.value = null;
  if (items.value.length <= 0) {
    itemError.value = "Debe agregar al menos un producto";
    return;
  }

  order.value.items = items.value;
  order.value.id
    ? await put(`api/orders/${order.value.id}`, order.value)
    : await post(`api/orders`, order.value);

  if (there_error.value) {
    if (validationErrors.value) {
      actions.setErrors(validationErrors.value);
    }
  } else {
    response.value.number = dataList.value.data.number;
    response.value.total = dataList.value.data.total.toFixed(2);
    dataEntered.value = true;
    openAlertDialog.value = true;
    if (order.value.id) {
      dialogModel.value = false;
    } else {
      order.value = { number: "NUEVO", created_at: getCurrentDate() };
      items.value = [];
      actions.resetForm();
    }
  }
};

const openCustomerDialog = () => {
  customerDialog.value = true;
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
  return order.value.id ? "MODIFICAR ORDEN" : "REGISTRAR ORDEN";
});

const total = computed(() => {
  const acumulator = items.value.reduce(
    (accumulator, currentItem) =>
      accumulator + currentItem.quantity * currentItem.price,
    0
  );
  return acumulator.toFixed(2);
});
</script>

<template>
  <!-- Alert Dialog -->
  <alert-dialog
    v-model="openAlertDialog"
    :number="response.number"
    :total="response.total"
  ></alert-dialog>

  <!-- Formulario de clientes -->
  <form-customer
    v-model="customerDialog"
    :item="{}"
    @record-saved="onGetCustomers"
  ></form-customer>

  <q-dialog
    v-model="dialogModel"
    position="top"
    persistent
    @before-show="assignProperty"
    @before-hide="closeDialog"
  >
    <q-card style="width: 680px; max-width: 90vw">
      <!-- Titulo -->
      <q-card-section class="q-py-sm bg-blue-7 text-white">
        <div class="text-body2">{{ dialogTitle }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="text-center" v-if="loadingDialog">
        <q-linear-progress stripe indeterminate size="5px" />
      </q-card-section>

      <q-card-section class="scroll" v-else>
        <!-- Formulario order -->
        <v-form ref="orderForm" autocomplete="off" @submit="onSave">
          <div class="row">
            <!-- N° orden -->
            <div class="col-xs-12 col-md q-mb-sm q-mr-md input-prepend">
              <q-input
                v-model="order.number"
                input-class="text-center"
                dense
                outlined
                readonly
              >
                <template v-slot:prepend>
                  <span class="fs-6 text-primary">N° ORDEN :&nbsp;</span>
                </template>
              </q-input>
            </div>

            <!-- Fecha emision -->
            <div class="col-xs-12 col-md q-mb-sm input-prepend">
              <q-input
                v-model="order.created_at"
                input-class="text-center"
                dense
                outlined
                readonly
              >
                <template v-slot:prepend>
                  <span class="fs-6 text-primary">EMITIDO :&nbsp;</span>
                </template>
              </q-input>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <!-- Formulario item -->
              <v-form ref="itemForm" autocomplete="off" @submit="onAddItem">
                <div class="row">
                  <!-- Producto -->
                  <div class="col input-prepend">
                    <v-field
                      v-model="product.full_name"
                      name="product"
                      label="producto"
                      rules="required"
                      v-slot="{ errorMessage }"
                    >
                      <q-select
                        v-model="product"
                        :options="filteredProducts"
                        option-label="full_name"
                        input-debounce="0"
                        :class="{ 'input-error': !!errorMessage }"
                        outlined
                        dense
                        options-dense
                        emit-value
                        map-options
                        use-input
                        @filter="onFilterProducts"
                        @update:model-value="onAddItem"
                      >
                        <!-- Label -->
                        <template v-slot:prepend>
                          <span class="fs-6 text-primary">PRODUCTO :</span>
                        </template>
                      </q-select>
                      <div class="q-my-xs fs-6 text-red-8">
                        {{ errorMessage }}
                      </div>
                    </v-field>
                  </div>
                </div>

                <div class="q-mb-xs fs-6 text-red-8">
                  {{ itemError }}
                </div>
              </v-form>

              <q-table
                flat
                dense
                bordered
                virtual-scroll
                hide-pagination
                :rows-per-page-options="[0]"
                :columns="columnList"
                :rows="items"
                row-key="id"
                separator="vertical"
                class="sticky-header-table"
                style="height: 192px"
              >
                <!-- No-data -->
                <template v-slot:no-data>
                  <div
                    class="full-width row flex-center text-primary text-subtitle1 text-bold"
                    style="height: 150px"
                  >
                    <q-icon size="sm" name="report_problem" />
                    <span class="q-ml-xs fs-6"
                      >Agregue al menos un producto</span
                    >
                  </div>
                </template>

                <!-- Cell quantity -->
                <template v-slot:body-cell-quantity="props">
                  <q-td :props="props">
                    <q-input
                      v-model="props.row.quantity"
                      type="number"
                      min="1"
                      input-class="text-center"
                      dense
                      outlined
                      autofocus
                      @update:model-value="onGetPrice(props.rowIndex)"
                    />
                  </q-td>
                </template>

                <!-- Cell actions -->
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <!-- Eliminar -->
                    <q-btn
                      flat
                      dense
                      color="negative"
                      icon="delete_sweep"
                      @click="onRemoveItem(props.rowIndex)"
                    >
                      <q-tooltip anchor="top start" self="top middle">
                        Eliminar
                      </q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>

              <div class="row">
                <!-- Clientes -->
                <div class="col q-mt-sm input-prepend">
                  <v-field
                    v-model="order.customer_id"
                    name="customer_id"
                    label="cliente"
                    rules="required"
                    v-slot="{ errorMessage }"
                  >
                    <q-select
                      v-model="order.customer_id"
                      :options="filteredCustomers"
                      option-value="id"
                      option-label="full_name"
                      input-debounce="0"
                      :class="{ 'input-error': !!errorMessage }"
                      outlined
                      hide-dropdown-icon
                      dense
                      options-dense
                      emit-value
                      map-options
                      use-input
                      @filter="onFilterCustomers"
                    >
                      <!-- Label -->
                      <template v-slot:prepend>
                        <span class="fs-6 text-primary">CLIENTE :&nbsp;</span>
                      </template>

                      <!-- No option -->
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section>No hay resultados</q-item-section>
                        </q-item>
                      </template>

                      <!-- Total -->
                      <template v-slot:append>
                        <!-- Boton nuevo -->
                        <q-btn
                          icon="add_circle_outline"
                          color="purple"
                          class="fs-6"
                          flat
                          dense
                          no-caps
                          @click.stop.prevent="openCustomerDialog"
                        >
                          <q-tooltip anchor="top start" self="top middle">
                            Agregar cliente
                          </q-tooltip>
                        </q-btn>

                        <q-separator vertical class="q-mx-sm bg-grey" />

                        <span class="text-bold text-dark fs-5"
                          >Total: &nbsp;</span
                        >
                        <span class="text-bold fs-4">S/.{{ total }}</span>
                      </template>
                    </q-select>
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
                  type="submit"
                  label="Aceptar"
                  color="primary"
                  :loading="processing"
                  class="fs-6"
                  style="width: 125px"
                  no-caps
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
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
./AlertDialog.vue
