<script setup>
import { ref } from "vue";
import { useApi } from "src/composables/useApi";
import notify from "src/utils/notify";
import { useHelpers } from "src/composables/useHelpers";

import APagination from "src/components/APagination.vue";
import FormPage from "./FormPage.vue";
import DetailDialog from "./DetailDialog.vue";

// Composable
const { loadingData, dataList, pagingData, get, patch, remove } = useApi();
const { formatDate, formatTime } = useHelpers();

// Variables
const openDialog = ref(false);
const detailDialog = ref(false);
const search = ref({
  status_id: null,
  searchBox: "",
});
const row = ref({});
const statusList = ref([]);
const orderList = ref([]);
const columnList = [
  {
    name: "actions",
    label: "Acciones",
    align: "center",
    style: "width:70px;",
  },
  {
    name: "created_at",
    field: (row) =>
      formatDate(row.created_at, "dd-mm-yyyy") +
      "   " +
      formatTime(row.created_at, "hh:mm A", false),
    label: "Emision",
    align: "left",
    sortable: true,
    style: "width:100px;",
  },
  {
    name: "number",
    field: "number",
    label: "N° Orden",
    align: "center",
    sortable: true,
    style: "width:120px;",
  },
  {
    name: "customer_name",
    field: (row) => row.customer.name,
    label: "Cliente",
    align: "left",
    sortable: true,
  },
  {
    name: "order_status_name",
    label: "Estado",
    align: "center",
    sortable: true,
    style: "width:100px;",
  },
];

// Metodos
const onGetStatuses = async () => {
  await get("api/statuses");
  statusList.value = await JSON.parse(JSON.stringify(dataList.value));
  statusList.value.unshift({
    id: null,
    name: "Todos",
  });
};

const onGetByCriteria = async () => {
  await get("api/orders/bycriteria", {
    number: search.value.searchBox,
    number_id: search.value.searchBox,
    name: search.value.searchBox,
    status_id: search.value.status_id,
    per_page: 100,
    page: pagingData.value.current_page,
  });
  orderList.value = await JSON.parse(JSON.stringify(dataList.value));
};

const getStatusColor = (status) => {
  const colorMap = {
      Pendiente: 'orange-6',
      Pagado: 'indigo-14',
      Entregado: 'green'
    };

    return colorMap[status] || 'primary';
}

const onShowDialog = (data = {}) => {
  row.value = { ...data };
  openDialog.value = true;
};

const onOpenDetailDialog = (data = {}) => {
  row.value = { ...data };
  detailDialog.value = true
}

const onCanceled = async (item) => {
  await notify.confirm().onOk(async () => {
    await patch(`api/orders/${item.id}`, item);
    item.canceled = true
  });
};

// Ejecutar
Promise.all([onGetByCriteria(), onGetStatuses()])
</script>

<template>
  <q-page padding>
    <!-- Cabecera -->
    <div class="row">
      <!-- Titulo -->
      <div class="col-12 col-md-10">
        <h6 class="q-my-sm">
          <q-icon name="view_list" size="md" class="q-mb-xs" />
          Ordenes de Ventas
        </h6>
      </div>

      <!-- Boton registrar -->
      <div class="col-12 col-md-2 q-mb-md">
        <q-btn
          no-caps
          label="Registrar"
          icon="add"
          color="primary"
          class="full-width"
          @click="onShowDialog()"
        />
      </div>
    </div>

    <!-- Formulario de registro -->
    <form-page
      v-model="openDialog"
      :item="row"
      @record-saved="onGetByCriteria"
    ></form-page>

    <!-- Formulario de registro -->
    <detail-dialog
      v-model="detailDialog"
      :item="row"
    ></detail-dialog>

    <!-- Card -->
    <q-card flat bordered class="q-pa-sm shadow-1">
      <q-card-section>
        <!-- Buscador -->
        <div class="row">
          <div class="col-12 q-mb-md">
            <form autocomplete="off" @submit.prevent="onGetByCriteria">
              <div class="row">
                <!-- Caja de busqueda -->
                <div class="col-12 col-md q-mb-sm q-mr-md">
                  <q-input
                    v-model="search.searchBox"
                    type="search"
                    placeholder="Ingrese n° orden, nombre o numero de documento del cliente"
                    dense
                    @keyup.enter="onGetByCriteria"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                      <span class="q-mx-xs text-body2 text-bold">Buscar</span>
                    </template>
                  </q-input>
                </div>

                <!-- Select(estado) de busqueda -->
                <div class="col-12 col-md">
                  <q-select
                    v-model="search.status_id"
                    option-value="id"
                    option-label="name"
                    :options="statusList"
                    dense
                    options-dense
                    emit-value
                    map-options
                    @update:model-value="onGetByCriteria"
                  >
                    <template v-slot:prepend>
                      <span class="q-mx-xs text-body2 text-bold">Estado</span>
                    </template>

                    <template v-slot:option="scope">
                      <q-item
                        dense
                        v-bind="scope.itemProps"
                        :disable="scope.opt.disabled"
                      >
                        <q-item-section>
                          <q-item-label>{{ scope.opt.name }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
            </form>
          </div>
        </div>

        <q-table
          flat
          dense
          bordered
          virtual-scroll
          hide-pagination
          :rows-per-page-options="[0]"
          :columns="columnList"
          :rows="orderList"
          row-key="id"
          separator="vertical"
          :loading="loadingData"
          class="sticky-header-table"
          rows-class="bg-purple"
          style="height: 390px"
        >
          <!-- Loading -->
          <template v-slot:loading>
            <q-inner-loading showing class="bg-grey-12">
              <q-spinner color="primary" size="lg" :thickness="5" />
              <span class="q-mt-sm text-subtitle1 text-bold">Consultando</span>
            </q-inner-loading>
          </template>

          <!-- No-data -->
          <template v-slot:no-data>
            <div
              class="full-width row flex-center text-primary text-subtitle1 text-bold"
              style="height: 349px"
            >
              <q-icon size="sm" name="report_problem" />
              <span class="q-ml-xs">No se encontraron datos</span>
            </div>
          </template>

          <!-- Cell actions -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <!-- Editar -->
              <q-btn
                flat
                dense
                color="info"
                icon="edit_note"
                class="q-mr-sm"
                :disable="props.row.canceled || props.row.order_status.name != 'Pendiente'"
                @click="onShowDialog(props.row)"
              >
                <q-tooltip anchor="top start" self="top middle"
                  >Editar</q-tooltip
                >
              </q-btn>

              <!-- Ver -->
              <q-btn
                flat
                dense
                no-caps
                color="accent"
                icon="visibility"
                class="q-mr-sm"
                @click="onOpenDetailDialog(props.row)"
              >
                <q-tooltip anchor="top start" self="top middle">
                  Ver
                </q-tooltip>
              </q-btn>

              <!-- Anular -->
              <q-btn
                flat
                dense
                no-caps
                color="red-9"
                icon="highlight_off"
                class="q-mr-sm"
                :disable="props.row.order_status.id != 1 || props.row.canceled"
                @click="onCanceled(props.row)"
              >
                <q-tooltip anchor="top start" self="top middle">
                  Anular
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Cell order_status_name -->
          <template v-slot:body-cell-order_status_name="props">
            <q-td :props="props">
              <q-badge
                :label="props.row.order_status.name"
                :color="getStatusColor(props.row.order_status.name)"
                class="q-py-xs q-px-md"
                rounded
              />
            </q-td>
          </template>

          <template v-slot:body-cell="props">
            <q-td :props="props" :class="{ 'text-red': props.row.canceled}">
                {{ props.value }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Paginacion -->
    <div class="row q-mt-md">
      <div class="col-12">
        <a-pagination
          v-model="pagingData.current_page"
          :total-pages="pagingData.total_pages"
          :total-records="pagingData.total_records"
          @click-page="onGetByCriteria()"
        ></a-pagination>
      </div>
    </div>
  </q-page>
</template>
