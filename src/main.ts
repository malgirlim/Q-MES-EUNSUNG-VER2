import { createApp, getCurrentInstance } from "vue";
import { reactive } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import Vue3Toasity from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "./assets/css/app.css";

import axios from "axios";
import {
  시스템_개발자,
  시스템_관리자,
  구매_관리자,
  구매_일반,
  영업_관리자,
  영업_일반,
  품질_관리자,
  품질_일반,
  생산_관리자,
  생산_일반,
} from "./composables/authData";

//const { proxy }: any = getCurrentInstance();

let auth_account: any = { id: null, name: "", part: "", rank: "", auth: "" };
let auth_level: any = {};

await axios
  .get("/api/auth")
  .then((res: any) => {
    auth_account = res.data;
    if (res.data.auth == "시스템개발자") auth_level = 시스템_개발자;
    else if (res.data.auth == "시스템관리자") auth_level = 시스템_관리자;
    else if (res.data.auth == "구매일반") auth_level = 구매_일반;
    else if (res.data.auth == "구매관리자") auth_level = 구매_관리자;
    else if (res.data.auth == "영업일반") auth_level = 영업_일반;
    else if (res.data.auth == "영업관리자") auth_level = 영업_관리자;
    else if (res.data.auth == "생산일반") auth_level = 생산_일반;
    else if (res.data.auth == "생산관리자") auth_level = 생산_관리자;
    else if (res.data.auth == "품질일반") auth_level = 품질_일반;
    else if (res.data.auth == "품질관리자") auth_level = 품질_관리자;
    else {
      for (let key in 시스템_개발자) {
        auth_level[key] = 1;
      }
    }
    //if (res.data.auth == "시스템개발자") show_debug_button.value = true;
  })
  .catch((res) => {
    if (auth_account.id == null) {
      router.push("/login");
    }
  });

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(Vue3Toasity, {
  dangerouslyHTMLString: true,
  autoClose: 2000,
});

app.config.globalProperties.gstate = reactive({
  account: auth_account,
  level: auth_level,
  debug: { active: null },
});

app.mount("#app");
