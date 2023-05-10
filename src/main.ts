import { createApp } from "vue";
import { reactive } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import Vue3Toasity from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "./assets/css/app.css";

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(Vue3Toasity, {
  dangerouslyHTMLString: true,
  autoClose: 2000,
});

app.mount("#app");

app.config.globalProperties.gstate = reactive({
  account: {
    id: null,
    name: "",
    part: "",
    rank: "",
  },
  form: {
    loginId: "",
    loginPw: "",
  },
  debug: {
    active: null,
  },
});
