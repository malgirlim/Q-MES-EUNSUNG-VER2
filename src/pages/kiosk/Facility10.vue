<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, Ref, watch } from "vue";
import _ from "lodash";
import { FormLabel } from "../../base-components/Form";

import Button from "../../base-components/Button";
import Lucide from "../../base-components/Lucide";
import LoadingIcon from "../../base-components/LoadingIcon";
import { Dialog } from "../../base-components/Headless";
import Table from "../../base-components/Table";
import { FormSelect } from "../../base-components/Form";

import dayjs from "dayjs";
import { toast } from "vue3-toastify";

import axios from "axios";
import router from "../../router";

//컴포넌트 로드

import TaskList from "../../components/Common/Kiosk/TaskList.vue";
import CheckList from "../../components/Common/Kiosk/CheckList.vue";
import NonOPAdd from "../../components/Common/Kiosk/NonOPAdd.vue";
import BadAdd from "../../components/Common/Kiosk/BadAdd.vue";
import ItemAdd from "../../components/Common/Kiosk/ItemAdd.vue";
import WorkerChange from "../../components/Common/Kiosk/WorkerChange.vue";

onMounted(async () => {
  setInterval(() => {
    now.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
  }, 1000);
});

/*로그인 관련 BEGIN*/

const { proxy }: any = getCurrentInstance();

const logout = () => {
  axios
    .delete("/api/auth", { params: { user: proxy.gstate.account.id } })
    .then(() => {
      toast.info("정상 로그아웃 하였습니다.");
      proxy.gstate.account.id = null;
      proxy.gstate.account.name = "";
      proxy.gstate.account.rank = "";
      router.push("/kiosk/login");
    });
};

axios
  .get("/api/auth")
  .then((res: any) => {
    proxy.gstate.account = res.data;
  })
  .catch(() => {
    if (proxy.gstate.account.id == null) {
      router.push("/kiosk/login");
    }
  });

/*로그인 관련 END*/

/* 로그아웃 확인 Modal */
const logoutModal = ref(false);
const setLogoutModal = (value: boolean) => {
  logoutModal.value = value;
};

// 날짜 구하기
const now = ref(dayjs().format("YYYY-MM-DD HH:mm:ss"));
const year = ref(dayjs().format("YYYY"));

// 임시데이터
const running = "가동중";
const checked = false;
const 지시수량 = 3000;

// 불량, 양품
const num_show = ref("0");

let num_bad = ref("27");
let num_good: any = ref(
  (
    Number(num_show.value.replace(/,/g, "")) - Number(num_bad.value)
  ).toLocaleString(undefined, { maximumFractionDigits: 11 })
);

// 키패드
const num = ref("0");
let num_split = [];
let num_dot = ".";

const insert_num = (numpad_value: any) => {
  if (num.value == "0") num.value = "" + numpad_value;
  else if (num.value.length < 13) num.value += numpad_value;
};

const insert_dot = () => {
  const dot_count = num.value.split(".").length - 1;
  if (dot_count < 1 && num.value.length < 13) num.value += ".";
};

const delete_num = () => {
  if (num.value.length > 1) num.value = num.value.slice(0, -1);
  else num.value = "0";
};
watch([num], (newValue, oldValue) => {
  num_split = num.value.split(".");
  if (num_split[1] == undefined) {
    num_split[1] = "";
    num_dot = "";
  } else num_dot = ".";
  num_show.value = Number(num_split[0]).toLocaleString();
  if (num_split[1] != undefined || num_split[1] != "")
    num_show.value += num_dot;
  num_show.value += num_split[1];
  num_good.value = (
    Number(num_show.value.replace(/,/g, "")) - Number(num_bad.value)
  ).toLocaleString(undefined, { maximumFractionDigits: 11 });
});

/* 작업지시목록 Modal */
const taskListModal = ref(false);
const setTaskListModal = (value: boolean) => {
  taskListModal.value = value;
};

/* 점검목록 Modal */
const checkListCheckBox = ref(false);
const checkListModal = ref(false);
const setCheckListModal = (value: boolean) => {
  checkListModal.value = value;
};

/* 작업시작 Modal */
const taskStartModal = ref(false);
const setTaskStartModal = (value: boolean) => {
  taskStartModal.value = value;
};

/* 비가동전환 Modal */
const nonOPModal = ref(false);
const setNonOPModal = (value: boolean) => {
  nonOPModal.value = value;
};

/* 비가동입력 Modal */
const nonOPAddModal = ref(false);
const setNonOPAddModal = (value: boolean) => {
  nonOPAddModal.value = value;
};

/* 불량변경 Modal */
const badAddModal = ref(false);
const setBadAddModal = (value: boolean) => {
  badAddModal.value = value;
};

/* 투입자재변경 Modal */
const itemAddModal = ref(false);
const setItemAddModal = (value: boolean) => {
  itemAddModal.value = value;
};

/* 작업자변경 Modal */
const workerChangeModal = ref(false);
const setWorkerChangeModal = (value: boolean) => {
  workerChangeModal.value = value;
};

/* 작업종료 Modal */
const finishCheckBox = ref(false);
const taskFinishModal = ref(false);
const setTaskFinishModal = (value: boolean) => {
  taskFinishModal.value = value;
  if (지시수량 > Number(num_good.value.replace(/,/g, "")))
    finishCheckBox.value = false;
  else finishCheckBox.value = true;
};
</script>

<template>
  <div class="pl-8 pr-8 pt-8">
    <div class="intro-y bg-[#3a437c] p-2 rounded-md">
      <img class="m-auto w-32" src="../../assets/images/kiosk_logo.svg" />
    </div>

    <div class="flex mt-2 items-center h-10 intro-y">
      <LoadingIcon icon="circles" class="w-5 h-5 mr-2" />
      <div>
        <h2 class="mr-5 text-lg font-medium truncate" :key="now">
          {{ now }}
        </h2>
      </div>
      <div class="mx-auto">
        <div></div>
      </div>
      <div class="mr-5">
        <strong>{{ proxy.gstate.account.name }}</strong
        >님 로그인 되었습니다.
      </div>
      <div
        class="flex items-center text-danger cursor-pointer mr-5"
        @click="setLogoutModal(true)"
      >
        <Lucide icon="LogOut" class="w-4 h-4 mr-2" /> 로그아웃
      </div>
      <div
        class="flex items-center text-primary cursor-pointer mr-1"
        @click="$router.go(0)"
      >
        <Lucide icon="RefreshCcw" class="w-4 h-4 mr-2" /> 새로고침
      </div>
    </div>
    <div>dd</div>
  </div>
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mr-10 mt-2" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->
</template>
