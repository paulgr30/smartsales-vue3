<script setup>
import { ref } from "vue";
import { useApi } from "src/composables/useApi";

import APagination from "src/components/APagination.vue";
import FormPage from "./FormPage.vue";
import notify from "src/utils/notify";

// Composable
const { loadingData, dataList, pagingData, get, remove } = useApi();

// Variables
const openDialog = ref(false);
const searchBox = ref("");
const row = ref({});
// Columnas
const columnList = [
  {
    name: "actions",
    label: "Acciones",
    align: "center",
    style: "width:70px;",
  },
  {
    name: "name",
    field: "name",
    label: "Nombre",
    align: "left",
    sortable: true,
    style: "width:650px;"
  },
  {
    name: "profile.identity_document.name",
    field: (row) => row.profile.identity_document.name,
    label: "Tipo Documento",
    align: "center",
    sortable: true,
    style: "width:100px;"
  },
  {
    name: "profile.number_id",
    field: (row) => row.profile.number_id,
    label: "N° Documento",
    align: "left",
    sortable: true,
    style: "width:140px;"
  },
  {
    field: (row) => row.profile.phone,
    label: "Telefono",
    align: "left",
    style: "width:100px;"
  },
];

// Metodos
const onGetByCriteria = async () => {
  await get("api/customers/bycriteria", {
    name: searchBox.value,
    number_id: searchBox.value,
    per_page: 100,
    page: pagingData.value.current_page,
  });
};

const onShowDialog = (data = { is_active: true }) => {
  row.value = { ...data };
  openDialog.value = true;
};

const onRemove = async (item) => {
  await notify.confirm().onOk(async () => {
    await remove("api/customers", item);
  });
};

// Ejecutar
onGetByCriteria();
</script>

<template>
  <q-page padding>
    <!-- Cabecera -->
    <div class="row">
      <!-- Titulo -->
      <div class="col-12 col-md-10">
        <h6 class="q-my-sm">
          <q-icon name="view_list" size="md" class="q-mb-xs" />
          Clientes
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
      @record-saved="onGetByCriteria()"
    ></form-page>

    <!-- Card -->
    <q-card flat bordered class="q-pa-sm shadow-1">
      <q-card-section>
        <!-- Buscador -->
        <div class="row">
          <div class="col-12 q-mb-md">
            <form autocomplete="off" @submit.prevent="onGetByCriteria()">
              <q-input
                dense
                type="search"
                placeholder="Ingrese nombre o numero de documento del cliente"
                v-model="searchBox"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                  <span class="q-mx-xs text-body2 text-bold">Buscar</span>
                </template>
              </q-input>
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
          :rows="dataList"
          row-key="id"
          separator="vertical"
          :loading="loadingData"
          class="sticky-header-table"
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
                @click="onShowDialog(props.row)"
              >
                <q-tooltip anchor="top start" self="top middle">Editar</q-tooltip>
              </q-btn>

              <!-- Eliminar -->
              <q-btn
                flat
                dense
                no-caps
                color="negative"
                icon="delete_sweep"
                :loading="props.row.processDeletion"
                @click="onRemove(props.row)"
              >
                <q-tooltip anchor="top start" self="top middle">
                  Eliminar
                </q-tooltip>

                <template v-slot:loading>
                  <q-spinner-hourglass class="on-left" />
                </template>
              </q-btn>
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
