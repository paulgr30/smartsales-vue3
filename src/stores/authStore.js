import { defineStore } from "pinia";
import api from "axios";
import { useHelpers } from "src/composables/useHelpers";

const helpers = useHelpers();

export const useAuthStore = defineStore("auth", {
  state: () => ({
    auth: {
      token: {
        value: null,
      },
      expires_at: 0,
      originalRequest: {},
    },
  }),
  getters: {
    getAuth: (state) => state.auth,
  },
  actions: {
    async login(username, password) {
      this.auth = {
        token: {
          value: null,
        },
        expires_at: 0,
      };
      this.auth.originalRequest = {};
      let response = await api.post("api/auth/login", { username, password });
      this.auth = response.data;
      this.auth.originalRequest = {};
      // Obtenemos la hora actual en que inicia sesion
      const timeNow = helpers.formatTime(Date.now(), "hh:MM:SS", true);
      // Calculamos el tiempo total en segundos en que expirara el token
      this.auth.expires_at =
        helpers.convertHourToSeconds(timeNow) + this.auth.token.expires_in;

      this.router.push({ name: "home" });
    },

    async logout() {
      await api.post("api/auth/logout");
      this.auth = {
        token: {
          value: null,
          expires_at: 0,
        },
        originalRequest: {},
      };

      this.router.push({ name: "login" });
    },

    async getProfile() {
      const response = await api.get("api/auth/profile");
      this.auth.user.name = response.data.name;
      this.auth.user.email = response.data.email;
    },

    async updateProfile(data) {
      await api.put("api/auth/profile/update", data);
      this.auth.user.name = data.name;
    },

    async changePassword(data) {
      await api.post("api/auth/password/change", data);
      this.logout();
    },

    async refreshToken() {
      let response = await api.post("api/auth/token/refresh");
      this.auth.token = response.data.token;

      const timeNow = helpers.formatTime(Date.now(), "hh:MM:SS", true);
      this.auth.expires_at =
        helpers.convertHourToSeconds(timeNow) + this.auth.token.expires_in;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      //{ storage: sessionStorage, paths: ["firstName", "lastName"] },
      { storage: localStorage, paths: ["auth"] },
    ],
  },
});
