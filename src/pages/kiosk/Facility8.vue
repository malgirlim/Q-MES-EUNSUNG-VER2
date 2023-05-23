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
    <div class="mt-3 flex intro-y">
      <div class="flex m-auto">
        <Button
          class="mr-5 h-14 w-44 text-2xl"
          as="a"
          variant="dark"
          @click="$router.push('/kiosk')"
          ><Lucide icon="Home" class="w-7 h-7 mb-0.5 mr-1" /><strong
            >설비선택</strong
          ></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl text-white"
          as="a"
          variant="success"
          @click="setTaskListModal(true)"
          ><strong>작업지시목록</strong></Button
        ><Button
          :class="[
            'mr-5 h-14 w-44 text-2xl text-white',
            { 'border-4 border-danger': checked == false },
          ]"
          as="a"
          variant="success"
          @click="setCheckListModal(true)"
          ><strong>점검목록</strong></Button
        >
        <Button
          class="mr-5 h-14 w-44 text-2xl text-white"
          as="a"
          variant="success"
          @click="setTaskStartModal(true)"
          ><strong>작업시작</strong></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl"
          as="a"
          variant="pending"
          @click="setNonOPModal(true)"
          ><strong>비가동전환</strong></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl"
          as="a"
          variant="pending"
          @click="setBadAddModal(true)"
          ><strong>불량변경</strong></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl"
          as="a"
          variant="pending"
          @click="setItemAddModal(true)"
          ><strong>투입자재변경</strong></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl"
          as="a"
          variant="primary"
          @click="setWorkerChangeModal(true)"
          ><strong>작업자변경</strong></Button
        ><Button
          class="h-14 w-44 text-2xl"
          as="a"
          variant="danger"
          @click="setTaskFinishModal(true)"
          ><strong>작업종료</strong></Button
        >
      </div>
    </div>
    <div class="grid grid-cols-3 p-1 mt-3 intro-y">
      <div class="flex items-center cols-span-1 text-lg">
        <div class="flex items-center mr-3">
          <Lucide class="w-5 h-5 mr-1" icon="CalendarClock" /><strong
            >가동시작일시 : 2023-05-11 14:43</strong
          >
        </div>
        <div class="flex items-center">
          <Lucide class="w-5 h-5 mr-1" icon="Signal" /><strong
            >설비운전상태 :
          </strong>
          <div class="flex ml-1 items-center">
            <div
              :class="[
                'ml-1 mr-1 mb-1',
                { 'text-lime-500': running == '가동중' },
                { 'text-warning': running == '비가동' },
                { 'text-danger': running == '미가동' },
              ]"
            >
              ●
            </div>
            <div class="mr-1">
              <strong>{{ running }}</strong>
            </div>
          </div>
          <img
            v-if="running == '가동중'"
            class="w-12 mb-1"
            src="../../assets/images/run_cat.gif"
          />
          <img
            v-if="running == '비가동'"
            class="w-12 mb-1"
            src="../../assets/images/standby_cat.png"
          />
          <img
            v-if="running == '미가동'"
            class="w-12 mb-1"
            src="../../assets/images/stop_cat.png"
          />
        </div>
      </div>
      <div class="cols-span-1 text-center text-2xl">
        <strong>인쇄기8 설비 작업현황</strong>
      </div>
      <div class="flex items-center cols-span-1 text-right text-lg">
        <div class="flex ml-auto items-center mr-3">
          <Lucide class="w-5 h-5 mr-1 mb-0.5" icon="ArrowUpCircle" /><strong
            >부하시간 : 14:43:00</strong
          >
        </div>
        <div class="flex ml-auto items-center mr-3">
          <Lucide class="w-5 h-5 mr-1 mb-0.5" icon="PlayCircle" /><strong
            >운전시간 : 14:43:00</strong
          >
        </div>
        <div class="flex items-center">
          <Lucide class="w-5 h-5 mr-1 mb-0.5" icon="PauseCircle" /><strong
            >비가동시간 : 14:43:00</strong
          >
        </div>
      </div>
    </div>
    <div
      class="p-2 mt-3 border-2 border-[#3a437c] text-center text-xl rounded-md bg-white intro-y"
      style="height: 650px"
    >
      <div class="grid grid-cols-4 gap-2">
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-success text-white">
            <strong>생산제품</strong>
          </div>
          <div class="border-2 border-success" style="height: 279px">
            <table class="w-full">
              <tbody>
                <tr class="border-b-2 border-success h-9">
                  <td
                    class="border-r-2 border-success bg-slate-200 font-bold w-24"
                  >
                    품번
                  </td>
                  <td class="pl-2 text-left">2074-G901-1</td>
                </tr>
                <tr class="border-b-2 border-success h-9">
                  <td class="border-r-2 border-success bg-slate-200 font-bold">
                    구분
                  </td>
                  <td class="pl-2 text-left">반제품</td>
                </tr>
                <tr class="border-b-2 border-success h-9">
                  <td class="border-r-2 border-success bg-slate-200 font-bold">
                    품명
                  </td>
                  <td class="pl-2 text-left">POWER TERMINAL PRE-MOLD</td>
                </tr>
                <tr class="border-b-2 border-success h-9">
                  <td class="border-r-2 border-success bg-slate-200 font-bold">
                    규격
                  </td>
                  <td class="pl-2 text-left">A2 E-EGR</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-span-2">
          <div class="pl-1 pr-1 pt-1 bg-[#D9821C] text-white">
            <strong>투입자재</strong>
          </div>
          <div
            class="border-2 border-[#D9821C]"
            style="height: 279px; overflow-y: visible; overflow-x: hidden"
          >
            <table class="w-full">
              <thead
                class="border-b-2 border-[#D9821C] bg-slate-200 h-9"
                style="position: sticky; top: 0px; z-index: 2"
              >
                <th class="border-r-2 border-[#D9821C] w-40">입고코드</th>
                <th class="border-r-2 border-[#D9821C] w-32">품목코드</th>
                <th class="border-r-2 border-[#D9821C] w-32">품목구분</th>
                <th class="border-r-2 border-[#D9821C] w-48">품명</th>
                <th class="border-r-2 border-[#D9821C] w-32">단위</th>
                <th class="w-24">수량</th>
              </thead>
              <tbody>
                <tr v-for="i in Array(5).fill('10')">
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    FA00001230418
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    AS00001
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    반제품
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    인쇄용지1
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">롤</td>
                  <td class="border-b-2 border-[#D9821C] h-9">2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-primary text-white">
            <strong>생산실적</strong>
          </div>
          <div class="border-2 border-primary" style="height: 279px">
            <table class="w-full">
              <tbody>
                <tr class="border-b-2 border-primary h-9">
                  <td
                    class="border-r-2 border-primary bg-slate-200 font-bold w-32"
                  >
                    생산수
                  </td>
                  <td class="pl-2 text-left">
                    <div class="flex">
                      <div>{{ num_show }}</div>
                      <div v-if="num_show == '0'" class="ml-8 text-danger">
                        <strong>* 생산수를 입력해주세요 *</strong>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr class="border-b-2 border-primary h-9">
                  <td class="border-r-2 border-primary bg-slate-200 font-bold">
                    불량수
                  </td>
                  <td class="pl-2 text-left">{{ num_bad }}</td>
                </tr>
                <tr class="border-b-2 border-primary h-9">
                  <td class="border-r-2 border-primary bg-slate-200 font-bold">
                    양품수
                  </td>
                  <td class="pl-2 text-left">{{ num_good }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-2 mt-2">
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-success text-white">
            <strong>작업지시정보</strong>
          </div>
          <div class="border-2 border-success" style="height: 279px">
            <table class="w-full">
              <tbody>
                <tr class="border-b-2 border-success h-9">
                  <td
                    class="border-r-2 border-success bg-slate-200 font-bold w-24"
                  >
                    작업코드
                  </td>
                  <td class="pl-2 text-left">TAS0022112202</td>
                </tr>
                <tr class="border-b-2 border-success h-9">
                  <td class="border-r-2 border-success bg-slate-200 font-bold">
                    시작일
                  </td>
                  <td class="pl-2 text-left">2023-05-11</td>
                </tr>

                <tr class="border-b-2 border-success h-9">
                  <td class="border-r-2 border-success bg-slate-200 font-bold">
                    공정명
                  </td>
                  <td class="pl-2 text-left">인쇄2공정</td>
                </tr>
                <tr class="border-b-2 border-success h-9">
                  <td class="border-r-2 border-success bg-slate-200 font-bold">
                    설비명
                  </td>
                  <td class="pl-2 text-left">인쇄기8</td>
                </tr>
                <tr class="border-b-2 border-success h-9">
                  <td class="border-r-2 border-success bg-slate-200 font-bold">
                    지시수량
                  </td>
                  <td class="pl-2 text-left">
                    {{ 지시수량.toLocaleString() }}
                  </td>
                </tr>
                <tr class="border-b-2 border-success h-9">
                  <td class="border-r-2 border-success bg-slate-200 font-bold">
                    단위
                  </td>
                  <td class="pl-2 text-left">매</td>
                </tr>
                <tr class="border-b-2 border-success h-9">
                  <td class="border-r-2 border-success bg-slate-200 font-bold">
                    작업자
                  </td>
                  <td class="pl-2 text-left">박명한</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-[#D9821C] text-white">
            <strong>비가동</strong>
          </div>

          <div
            class="border-2 border-[#D9821C]"
            style="height: 279px; overflow-y: visible; overflow-x: hidden"
          >
            <table class="w-full">
              <thead
                class="border-b-2 border-[#D9821C] bg-slate-200 h-9"
                style="position: sticky; top: 0px; z-index: 2"
              >
                <th class="border-r-2 border-[#D9821C] w-24">코드</th>
                <th class="border-r-2 border-[#D9821C] w-32">비가동명</th>
                <th class="border-r-2 border-[#D9821C] w-32">시작일시</th>
                <th class="w-32">종료일시</th>
              </thead>
              <tbody>
                <tr v-for="i in Array(3).fill('10')">
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    0012
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    계획정지
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    2023-05-11 12:33:12
                  </td>
                  <td class="border-b-2 border-[#D9821C] h-9">
                    2023-05-11 18:33:12
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-[#D9821C] text-white">
            <strong>불량</strong>
          </div>
          <div
            class="border-2 border-[#D9821C]"
            style="height: 279px; overflow-y: visible; overflow-x: hidden"
          >
            <table class="w-full">
              <thead
                class="border-b-2 border-[#D9821C] bg-slate-200 h-9"
                style="position: sticky; top: 0px; z-index: 2"
              >
                <th class="border-r-2 border-[#D9821C] w-40">코드</th>
                <th class="border-r-2 border-[#D9821C] w-32">구분</th>
                <th class="border-r-2 border-[#D9821C] w-32">불량명</th>
                <th class="w-24">수량</th>
              </thead>
              <tbody>
                <tr v-for="i in Array(5).fill('10')">
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    001230418
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    오염
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    재질오염
                  </td>
                  <td class="border-b-2 border-[#D9821C] h-9">2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-primary text-white">
            <strong>생산수입력</strong>
          </div>
          <div class="border-2 border-primary" style="height: 279px">
            <div class="grid grid-cols-3 mt-4">
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('1')"
                  >1</Button
                >
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('2')"
                  >2</Button
                >
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('3')"
                  >3</Button
                >
              </div>
            </div>
            <div class="grid grid-cols-3 mt-1">
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('4')"
                  >4</Button
                >
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('5')"
                  >5</Button
                >
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('6')"
                  >6</Button
                >
              </div>
            </div>
            <div class="grid grid-cols-3 mt-1">
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('7')"
                  >7</Button
                >
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('8')"
                  >8</Button
                >
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('9')"
                  >9</Button
                >
              </div>
            </div>
            <div class="grid grid-cols-3 mt-1">
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_dot()">.</Button>
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="insert_num('0')"
                  >0</Button
                >
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl" @click="delete_num()"
                  ><Lucide icon="Delete" class="w-10 h-10 mx-auto text-info"
                /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mr-10 mt-2" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->

  <!-- BEGIN: 작업지시목록 Modal -->
  <Dialog :open="taskListModal" size="xxl" @close="setTaskListModal(false)">
    <Dialog.Panel>
      <div class="p-3 text-center">
        <div class="mt-8 text-4xl"><strong>인쇄기8 작업지시목록</strong></div>
      </div>
      <div><TaskList /></div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-primary"
          type="button"
          class="w-48 text-2xl"
          @click="setTaskListModal(false)"
        >
          닫기
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업지시목록 Modal -->

  <!-- BEGIN: 점검목록 Modal -->
  <Dialog :open="checkListModal" size="xxl" @close="setCheckListModal(false)">
    <Dialog.Panel>
      <div class="p-3 text-center">
        <div class="mt-8 text-4xl"><strong>점검목록</strong></div>
      </div>
      <div><CheckList /></div>
      <label class="cursor-pointer"
        ><div class="flex text-center text-2xl mb-5">
          <div class="flex m-auto">
            <div>
              <Input
                class="w-6 h-6 mb-1 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed"
                id="checkListCheckBox"
                type="checkbox"
                :value="checkListCheckBox"
                v-model="checkListCheckBox"
              />
            </div>
            <div class="ml-2">위 점검 목록을 모두 확인하였습니다.</div>
          </div>
        </div></label
      >
      <div class="mt-1 mb-3 text-center text-2xl">작업자 : 박명한</div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-48 mr-10 text-2xl"
          :disabled="!checkListCheckBox"
          @click="setCheckListModal(false)"
        >
          확인
        </Button>

        <Button
          variant="outline-primary"
          type="button"
          class="w-48 text-2xl"
          @click="setCheckListModal(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 점검목록 Modal -->

  <!-- BEGIN: 작업시작 확인 Modal -->
  <Dialog :open="taskStartModal" size="lg" @close="setTaskStartModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="Play" class="w-24 h-24 mx-auto mt-3 text-success" />
        <div class="mt-5 text-3xl"><strong>작업 시작</strong></div>
        <div class="mt-3 text-2xl">작업 시작 전 점검 목록을 확인해주세요.</div>
      </div>

      <div class="mt-5 px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          @click="
            () => {
              setTaskStartModal(false);
            }
          "
          class="w-48 text-2xl mr-10"
        >
          시작
        </Button>
        <Button
          variant="outline-primary"
          type="button"
          class="w-48 text-2xl"
          @click="setTaskStartModal(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업시작 확인 Modal -->

  <!-- BEGIN: 비가동확인 Modal -->
  <Dialog :open="nonOPModal" size="lg" @close="setNonOPModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="Pause" class="w-24 h-24 mx-auto mt-3 text-[#D9821C]" />
        <div class="mt-5 text-3xl"><strong>비가동 전환</strong></div>
        <div class="mt-3 text-2xl">장비가 비가동으로 전환됩니다.</div>
      </div>

      <div class="mt-5 px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          @click="
            () => {
              setNonOPModal(false);
              setNonOPAddModal(true);
            }
          "
          class="w-48 text-2xl mr-10"
        >
          전환
        </Button>
        <Button
          variant="outline-primary"
          type="button"
          class="w-48 text-2xl"
          @click="setNonOPModal(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 비가동확인 Modal -->

  <!-- BEGIN: 비가동중 Modal -->
  <Dialog :open="nonOPAddModal" size="lg">
    <Dialog.Panel>
      <div class="p-3 text-center">
        <Lucide icon="Pause" class="w-20 h-20 mx-auto mt-3 text-[#D9821C]" />
        <div class="mt-5 text-3xl"><strong>장비가 비가동중입니다</strong></div>
        <div class="mt-3 text-2xl">
          비가동 사유를 선택하고 작업을 재개해 주세요
        </div>
      </div>
      <div><NonOPAdd /></div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-48 text-2xl"
          @click="setNonOPAddModal(false)"
        >
          작업재개
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 비가동중 Modal -->

  <!-- BEGIN: 불량변경 Modal -->
  <Dialog :open="badAddModal" size="xxl" @close="setBadAddModal(false)">
    <Dialog.Panel>
      <div class="p-3 text-center">
        <div class="mt-8 text-4xl"><strong>불량변경</strong></div>
      </div>
      <div><BadAdd /></div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          @click="
            () => {
              setBadAddModal(false);
            }
          "
          class="w-48 text-2xl mr-10"
        >
          확인
        </Button>
        <Button
          variant="outline-primary"
          type="button"
          class="w-48 text-2xl"
          @click="setBadAddModal(false)"
        >
          닫기
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 불량변경 Modal -->

  <!-- BEGIN: 투입자재변경 Modal -->
  <Dialog :open="itemAddModal" size="xxl" @close="setItemAddModal(false)">
    <Dialog.Panel>
      <div class="p-3 text-center">
        <div class="mt-8 text-4xl"><strong>투입자재변경</strong></div>
      </div>
      <div><ItemAdd /></div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          @click="
            () => {
              setItemAddModal(false);
            }
          "
          class="w-48 text-2xl mr-10"
        >
          확인
        </Button>
        <Button
          variant="outline-primary"
          type="button"
          class="w-48 text-2xl"
          @click="setItemAddModal(false)"
        >
          닫기
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 불량변경 Modal -->

  <!-- BEGIN: 작업자 변경 Modal -->
  <Dialog
    :open="workerChangeModal"
    size="lg"
    @close="setWorkerChangeModal(false)"
  >
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="Users" class="w-24 h-24 mx-auto mt-3 text-primary" />
        <div class="mt-5 text-3xl"><strong>작업자 변경</strong></div>
        <div class="mt-3 text-2xl">변경할 작업자를 선택해주세요.</div>
      </div>
      <div><WorkerChange /></div>

      <div class="mt-5 px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          @click="
            () => {
              setWorkerChangeModal(false);
            }
          "
          class="w-48 text-2xl mr-10"
        >
          변경
        </Button>
        <Button
          variant="outline-primary"
          type="button"
          class="w-48 text-2xl"
          @click="setWorkerChangeModal(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업자 변경 Modal -->

  <!-- BEGIN: 작업종료 Modal -->
  <Dialog :open="taskFinishModal" size="lg" @close="setTaskFinishModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="CheckCircle" class="w-20 h-20 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl"><strong>작업 종료</strong></div>
        <div class="mt-3 text-2xl">종료 유형을 선택해주세요.</div>
        <div class="mt-5">
          <div class="pl-7 pr-7 mt-5 text-xl">
            <table class="w-full">
              <tbody>
                <tr class="border-t-2 border-l-2 border-b-2 border-danger h-12">
                  <td
                    class="text-center border-r-2 border-danger bg-slate-200 font-bold w-32"
                  >
                    작업중단
                  </td>
                </tr>
                <tr class="border-b-2 border-danger h-12">
                  <td
                    class="text-center border-l-2 border-r-2 border-danger font-bold"
                  >
                    <div>
                      생산 실적을 저장하고
                      <label class="text-pending font-bold">작업대기</label>로
                      전환
                    </div>
                  </td>
                </tr>
                <tr class="border-b-2 border-danger h-20">
                  <td
                    class="text-center border-l-2 border-r-2 border-danger font-bold"
                  >
                    <Button
                      variant="pending"
                      type="button"
                      @click="
                        () => {
                          setTaskFinishModal(false);
                        }
                      "
                      class="w-40 text-2xl mb-5 mt-5"
                    >
                      작업중단
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pl-7 pr-7 mt-5 text-xl">
            <table class="w-full">
              <tbody>
                <tr class="border-t-2 border-l-2 border-b-2 border-danger h-12">
                  <td
                    class="text-center border-r-2 border-danger bg-slate-200 font-bold w-32"
                  >
                    작업완료
                  </td>
                </tr>
                <tr class="border-b-2 border-danger h-12">
                  <td
                    class="text-center border-l-2 border-r-2 border-danger font-bold"
                  >
                    <div>
                      생산 실적을 저장하고
                      <label class="text-primary font-bold">작업완료</label>로
                      전환
                    </div>
                  </td>
                </tr>

                <tr class="border-b-2 border-danger h-20">
                  <td
                    class="text-center border-l-2 border-r-2 border-danger font-bold"
                  >
                    <div
                      v-if="지시수량 > Number(num_good.replace(/,/g, ''))"
                      class="pl-7 pr-7 mt-5 text-lg"
                    >
                      <div class="flex">
                        <div class="flex mx-auto items-center">
                          <div>
                            <Lucide
                              icon="AlertTriangle"
                              class="w-6 h-6 text-danger mr-0.5 mb-0.5"
                            />
                          </div>
                          <div class="text-danger font-bold">경고</div>
                        </div>
                      </div>
                      <div class="text-danger mt-2 font-bold">
                        현재 양품수량이 지시수량보다 적습니다.
                      </div>
                      <div class="mt-2">
                        <label class="cursor-pointer">
                          <input
                            class="w-6 h-6 mb-1 mr-2 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed"
                            id="finishcheckbox"
                            type="checkbox"
                            :value="finishCheckBox"
                            v-model="finishCheckBox"
                          />확인</label
                        >
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      type="button"
                      :disabled="!finishCheckBox"
                      @click="
                        () => {
                          setTaskFinishModal(false);
                        }
                      "
                      class="w-40 text-2xl mb-5 mt-5"
                    >
                      작업완료
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-5 px-5 pb-8 text-center">
        <Button
          variant="outline-primary"
          type="button"
          class="w-40 text-2xl"
          @click="setTaskFinishModal(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업자 변경 Modal -->

  <!-- BEGIN: 로그아웃 확인 Modal -->
  <Dialog :open="logoutModal" size="lg" @close="setLogoutModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="LogOut" class="w-32 h-32 mx-auto mt-3 text-danger" />
        <div class="mt-10 text-3xl">로그아웃 하시겠습니까?</div>
      </div>

      <div class="mt-10 px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          class="w-48 mr-10 text-2xl"
          @click="setLogoutModal(false)"
        >
          취소
        </Button>

        <Button
          variant="danger"
          type="button"
          @click="
            () => {
              setLogoutModal(false);
              logout();
            }
          "
          class="w-48 text-2xl"
        >
          확인
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 로그아웃 확인 Modal -->
</template>
