import { boot } from "quasar/wrappers";
import axios from "axios";
import { useAuthStore } from "src/stores/authStore";
import { useHelpers } from "src/composables/useHelpers";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
//const api = axios.create({ baseURL: process.env.API_URL });
axios.defaults.baseURL = process.env.API_URL;

export default boot(({ router, store }) => {
  const authStore = useAuthStore(store);
  const helpers = useHelpers();

  // interceptor de solicitud http
  axios.interceptors.request.use(
    async (config) => {
      config.headers = {
        Accept: "application/json",
        Authorization: `Bearer${authStore.getAuth.token.value}`,
        //"Content-Type": "application/json", //"application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
      };

      // Si no se ha intentado refrescar el token
      if (!authStore.getAuth.originalRequest._retry) {
        // Respaldamos la peticion original
        authStore.getAuth.originalRequest = config;
      }

      // Calculamos el tiempo transcurrido en segundos
      const timeNow = helpers.formatTime(Date.now(), "hh:MM:SS", true);
      const timeElapsed = helpers.convertHourToSeconds(timeNow);
      // Indicamos que el token se refresque 5 minutos antes de caducar
      const tokenRefreshTime = authStore.getAuth.expires_at - 300;

      // Validamos si el tiempo transcurrido es mayor o igual
      // al tiempo para refrescar el token y si ya se intento refrescar
      if (
        tokenRefreshTime > 0 &&
        timeElapsed >= tokenRefreshTime &&
        !authStore.getAuth.originalRequest._retry
      ) {
        authStore.auth.originalRequest._retry = true;
        // Refrescamos el token
        await authStore.refreshToken();
        // Actualizamos la cabecera de autorizacion de la peticion original
        // con el nuevo token
        authStore.getAuth.originalRequest.headers[
          "Authorization"
        ] = `Bearer ${authStore.getAuth.token.value}`;

        authStore.getAuth.originalRequest._retry = false;
        // Enviamos la peticion original
        return authStore.getAuth.originalRequest;
      }

      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  // interceptor de respuesta http
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.status === 401) {
        authStore.auth = {
          token: {
            value: null,
          },
          expires_at: 0,
          originalRequest: {},
        };
        router.push({ name: "login" });
      }
      return Promise.reject(error);
    }
  );
});

export { axios as api };
