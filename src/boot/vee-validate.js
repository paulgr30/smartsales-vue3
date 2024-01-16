/* vee-validate 4.12.4 */
import { configure, defineRule, Field, Form } from "vee-validate";
import { localize, setLocale } from "@vee-validate/i18n";
import es from "@vee-validate/i18n/dist/locale/es.json";
import * as AllRules from "@vee-validate/rules";

export default ({ app }) => {
  // Configuramos el idioma de los mensajes de validacion
  configure({
    generateMessage: localize({ es }),
    validateOnInput: false,
    validateOnBlur: false,
    validateOnChange: false,
  });
  setLocale("es");

  // Obtenemos todas las reglas de validacion
  Object.keys(AllRules).forEach((rule) => {
    defineRule(rule, AllRules[rule]);
  });

  // Registramos los componentes de vee-validate de forma global
  app.component("v-form", Form);
  app.component("v-field", Field);
};
