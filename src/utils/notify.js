import { Dialog, Notify } from "quasar";

const confirm = (
  message = "<span class='q-mt-none text-body1'>No podras revertir esto !!</span>",
  labelOk = "Si",
  labelCancel = "No"
) => {
  return Dialog.create({
    title: "<span class='q-pb-none text-bold fs-3'>Estas seguro ?</span>",
    message: message,
    html: true,
    cancel: {
      label: labelCancel,
      dense: true,
      "no-caps": true,
      color: "negative",
      class: "q-mr-sm text-center",
      style: "width:120px; height:35px",
    },
    ok: {
      label: labelOk,
      dense: true,
      color: "green-7",
      class: "q-mr-sm text-center",
      style: "width:120px; height:35px",
      "no-caps": true,
    },
    persistent: true,
  });
};

const success = (message = "Operación realizada con éxito") => {
  Notify.create({
    color: "teal",
    icon: "task_alt",
    position: "top-right",
    message: message,
    timeout: 3000,
  });
};

const warning = (message = "Ocurrio un problema, verifique, por favor") => {
  Notify.create({
    color: "deep-orange-7",
    icon: "warning",
    position: "top-right",
    message: message,
    timeout: 5000,
  });
};

const danger = (message = "Se produjo un error") => {
  Notify.create({
    multiLine: true,
    color: "negative",
    icon: "dangerous",
    position: "top-right",
    message: message,
    timeout: 10000,
  });
};

export default { success, warning, danger, confirm };
