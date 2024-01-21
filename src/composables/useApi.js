import { ref } from "vue";
import api from "axios";
import notify from "src/utils/notify";

export function useApi() {
  const loadingData = ref(false);
  const processing = ref(false);
  const there_error = ref(false);
  const validationErrors = ref(null);
  const dataList = ref([]);
  const pagingData = ref({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
  });
  const cases = {
    400: (response) => {
      notify.warning(response.data.message);
    },
    404: (response) => {
      notify.warning(response.data.message);
    },
    422: (response) => {
      notify.warning();
      validationErrors.value = response.data.errors;
    },
    default: (response) => {
      if (response.status) {
        if (response.status != 401) {
          notify.danger(
            `Error del servidor, contacte con soporte => ${response.data.message}`
          );
        }
      } else {
        notify.danger(`Ocurrió un error inesperado: ${response}`);
      }
    },
  };

  const get = async (url, params = null) => {
    try {
      loadingData.value = true;
      const { data } = params
        ? await api.get(url, { params: params })
        : await api.get(url);

      dataList.value = data.data || data;
      there_error.value = false;
      pagingData.value.total_pages = data.last_page || 1;
      pagingData.value.total_records = data.total || 0;

      dataList.value = dataList.value.map((obj) => {
        return {...obj, processDeletion: false};
      });
    } catch (error) {
      handleErrorResponse(error.response || error);
    } finally {
      loadingData.value = false;
    }
  };

  const post = async (url, data) => {
    try {
      processing.value = true;
      await api.post(url, data);
      there_error.value = false;
      notify.success();
    } catch (error) {
      handleErrorResponse(error.response || error);
    } finally {
      processing.value = false;
    }
  };

  const put = async (url, data) => {
    try {
      processing.value = true;
      await api.put(url, data);
      there_error.value = false;
      notify.success();
    } catch (error) {
      handleErrorResponse(error.response || error);
    } finally {
      processing.value = false;
    }
  };

  const patch = async (url, data) => {
    try {
      processing.value = true;
      await api.patch(url, data);
      there_error.value = false;
      notify.success();
    } catch (error) {
      handleErrorResponse(error.response || error);
    } finally {
      processing.value = false;
    }
  };

  const remove = async (url, item) => {
    try {
      item.processDeletion = true;
      await api.delete(`${url}/${item.id}`);

      dataList.value = dataList.value.filter((obj) => obj.id !== item.id);
      pagingData.value.total_records -= 1;

      there_error.value = false;
      notify.success();
    } catch (error) {
      item.processDeletion = false;
      handleErrorResponse(error.response || error);
    }
  };

  const handleErrorResponse = (response) => {
    there_error.value = true;
    if (cases.hasOwnProperty(response.status)) {
      cases[response.status](response);
    } else {
      cases["default"](response);
    }
  };

  return {
    loadingData,
    processing,
    there_error,
    validationErrors,
    dataList,
    pagingData,
    get,
    post,
    put,
    patch,
    remove,
  };
}
