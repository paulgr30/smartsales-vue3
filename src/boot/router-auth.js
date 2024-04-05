import { boot } from "quasar/wrappers";
import { useAuthStore } from "src/stores/authStore";

export default boot(({ store, router }) => {
  const authStore = useAuthStore(store);

  router.beforeEach(async (to, from, next) => {
    if (!authStore.getAuth.token.value) {
      to.name != "login" ? next({ name: "login" }) : next();
      return;
    }
    to.name == "login" ? next({ name: "home" }) : next();
  });
});
