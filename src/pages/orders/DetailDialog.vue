<script setup>
import { computed, ref } from "vue";
import { useHelpers } from "src/composables/useHelpers";

// Propiedades
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  item: { type: Object, required: true },
});

// Eventos
const emit = defineEmits(["update:modelValue"]);

// Composables
const { getCurrentDate, formatDate, formatTime } = useHelpers();

// Variables
const order = ref({});
const orderDetail = ref([]);
const columnList = [
  {
    name: "quantity",
    field: "quantity",
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
];

// Metodos
const assignProperty = async () => {
  order.value = { ...props.item, total: 0 };
  order.value.created_at =
    formatDate(order.value.created_at, "dd-mm-yyyy") +
    "   " +
    formatTime(order.value.created_at, "hh:mm A", false);

  orderDetail.value = order.value.products.map((item) => {
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

const total = computed(() => {
  const acumulator = orderDetail.value.reduce(
    (accumulator, currentItem) =>
      accumulator + currentItem.quantity * currentItem.price,
    0
  );
  return acumulator.toFixed(2);
});
</script>

<template>
  <q-dialog
    v-model="dialogModel"
    position="top"
    persistent
    @before-show="assignProperty"
  >
    <q-card style="width: 630px; max-width: 90vw">
      <!-- Titulo -->
      <q-card-section class="q-py-sm bg-blue-7 text-white">
        <div class="text-body2">DETALLE DE ORDEN</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="scroll">
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
          <!-- Cliente -->
          <div class="col q-mb-sm input-prepend">
            <q-input
              v-model="order.customer.name"
              dense
              outlined
              readonly
            >
              <template v-slot:prepend>
                <span class="fs-6 text-primary">CLIENTE :&nbsp;</span>
              </template>
            </q-input>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <q-table
              flat
              dense
              bordered
              virtual-scroll
              hide-pagination
              :rows-per-page-options="[0]"
              :columns="columnList"
              :rows="orderDetail"
              row-key="id"
              separator="vertical"
              class="sticky-header-table"
              style="height: 200px"
            >
              <!-- No-data -->
              <template v-slot:no-data>
                <div
                  class="full-width row flex-center text-primary text-subtitle1 text-bold"
                  style="height: 157px"
                >
                  <q-icon size="sm" name="report_problem" />
                  <span class="q-ml-xs fs-6">No se encontraron producto</span>
                </div>
              </template>
            </q-table>

            <div class="row">
              <!-- Total -->
              <div class="col q-mt-sm text-right">
                <span class="text-bold text-dark fs-2">Total: &nbsp;</span>
                <span class="text-bold fs-2">S/.{{ total }}</span>
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
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
./AlertDialog.vue
