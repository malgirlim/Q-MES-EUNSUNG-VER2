<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, watch } from "vue";

import Button from "../../base-components/Button";
import Lucide from "../../base-components/Lucide";
import LoadingIcon from "../../base-components/LoadingIcon";
import { Dialog } from "../../base-components/Headless";
import Table from "../../base-components/Table";
import { FormSelect } from "../../base-components/Form";
import InnerImageZoom from "vue-inner-image-zoom";
import "vue-inner-image-zoom/lib/vue-inner-image-zoom.css";
import VueJsProgress from "vue-js-progress";

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
import AlertAdd from "../../components/Common/Kiosk/AlertAdd.vue";

/* ##########################################  키오스크 정보 관련 (중요!)  ########################################## */

const 키오스크NO = 1;
const 설비명 = "인쇄기1";

/* ################################################################################################################ */

/*로그인 관련 BEGIN*/
const { proxy }: any = getCurrentInstance();

// login(또는 메뉴이동) 할 때마다 token refresh해주는 함수
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

// 로그아웃
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

// 로그아웃 확인 Modal
const logoutModal = ref(false);
const setLogoutModal = (value: boolean) => {
  logoutModal.value = value;
};
/*로그인 관련 END*/

// 페이지 로딩 시 시작
onMounted(async () => {
  setInterval(() => {
    now.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
  }, 1000);
});

// 날짜 구하기
const now = ref(dayjs().format("YYYY-MM-DD HH:mm:ss"));
const year = ref(dayjs().format("YYYY"));

// 임시데이터
const running = "미가동";
const task_status = "작업미확인";
const checked = false;
const 지시수량 = ref("3000");
const 완료수량 = ref("0");

// 생산실적 초기값 설정
const 생산수량 = ref("0");
const 불량수량 = ref("27");
const 양품수량 = ref(
  String(
    Number(완료수량.value) + Number(생산수량.value) - Number(불량수량.value)
  )
);

// ########################### 키패드 (생산수입력) BEGIN ###########################
const 입력수량 = ref("0");
const 입력수량_show = ref("0");

// [함수] 입력수량에 숫자 집어넣기
const insert_num = (numpad_value: any) => {
  // 만약 입력수량이 "0" 이라면 선택한 숫자로 덮어쓰기
  if (입력수량.value == "0") 입력수량.value = numpad_value;
  // 만약 입력수량이 "0"이 아니고 13글자를 넘지 않는다면 선택한 숫자를 추가하기
  else if (입력수량.value.length < 13) 입력수량.value += numpad_value;
};

// [함수] 입력수량에 . (점) 집어넣기
const insert_dot = () => {
  // 만약 입력수량에 . (점)이 없고, 13자리를 넘지 않는다면 .(점)을 추가하기
  if (입력수량.value.indexOf(".") == -1 && 입력수량.value.length < 13)
    입력수량.value += ".";
};

// [함수] 입력수량을 뒤에서부터 지우기
const delete_num = () => {
  // 만약 입력수량이 1글자라면 뒤에서 1개를 지우기
  if (입력수량.value.length > 1) 입력수량.value = 입력수량.value.slice(0, -1);
  else 입력수량.value = "0"; // 아니라면 "0"으로 바꾸기
};

// 생산수 저장함수
const 생산수량_초기화 = () => {
  생산수량.value = "0";
};
const 생산수량_증가 = () => {
  생산수량.value = String(Number(생산수량.value) + Number(입력수량.value));
  입력수량.value = "0";
  입력수량_show.value = "0";
};
const 생산수량_차감 = () => {
  생산수량.value = String(Number(생산수량.value) - Number(입력수량.value));
  if (생산수량.value < 0) 생산수량.value = "0";
  입력수량.value = "0";
  입력수량_show.value = "0";
};

// [watch] 입력수량이 바뀔때마다 입력수량_show의 값을 바꾸기
watch([입력수량], (newValue, oldValue) => {
  // 만약 입력수량에 .(점)이 있다면 정수부분을 Locale해주고 .(점)을 붙여줌
  if (입력수량.value.indexOf(".") != -1) {
    입력수량_show.value =
      Number(입력수량.value.split(".")[0]).toLocaleString() +
      "." +
      (입력수량.value.split(".")[1] ?? "");
  } else 입력수량_show.value = Number(입력수량.value).toLocaleString(); // 바로 Locale 해도 됨
});

// [watch] 생산수량이 바뀔때마다 양품수량 바꾸기
watch([생산수량], (newValue, oldValue) => {
  양품수량.value = String(
    Number(완료수량.value) + Number(생산수량.value) - Number(불량수량.value)
  );
});

// ########################### 키패드 (생산수입력) END ###########################

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

/* 작업종료 Modal */
const finishCheckBox = ref(false);
const taskFinishModal = ref(false);
const setTaskFinishModal = (value: boolean) => {
  taskFinishModal.value = value;
  if (지시수량 > Number(num_good.value.replace(/,/g, "")))
    finishCheckBox.value = false;
  else finishCheckBox.value = true;
};

/* 작업취소, 보류 Modal */
const taskCancleModal = ref(false);
const setTaskCancleModal = (value: boolean) => {
  taskCancleModal.value = value;
};

/* 고장발생확인 Modal */
const alertModal = ref(false);
const setAlertModal = (value: boolean) => {
  alertModal.value = value;
};

/* 고장발생입력 Modal */
const alertAddModal = ref(false);
const setAlertAddModal = (value: boolean) => {
  alertAddModal.value = value;
};

/* 작업표준서 열기 Modal */
const taskStandardModal = ref(false);
const setTaskStandardModal = (value: boolean) => {
  taskStandardModal.value = value;
};

/* 작업자변경 Modal */
const workerChangeModal = ref(false);
const setWorkerChangeModal = (value: boolean) => {
  workerChangeModal.value = value;
};
</script>

<!-- 
#####################################################################################################################
#####################################################################################################################
#####################################################################################################################
-->

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
        >
        <Button
          :class="[
            'mr-5 h-14 w-44 text-2xl text-white',
            { 'border-4 border-danger': checked == false },
          ]"
          as="a"
          variant="success"
          @click="setCheckListModal(true)"
          ><strong>일상점검</strong></Button
        >
        <Button
          class="mr-5 h-14 w-44 text-2xl text-white"
          variant="success"
          @click="setTaskListModal(true)"
          :disabled="task_status == '작업중'"
          ><strong>작업지시목록</strong></Button
        >
        <Button
          v-if="task_status == '작업미확인' || task_status == ''"
          class="mr-5 h-14 w-44 text-2xl text-white"
          variant="success"
          :disabled="task_status == ''"
          @click="setTaskStartModal(true)"
          ><strong>작업수락</strong></Button
        >
        <Button
          v-if="task_status == '작업대기' || task_status == '작업중'"
          class="mr-5 h-14 w-44 text-2xl text-white"
          variant="success"
          :disabled="task_status == '작업중'"
          @click="setTaskStartModal(true)"
          ><strong>작업시작</strong></Button
        >
        <Button
          class="mr-5 h-14 w-44 text-2xl"
          variant="pending"
          @click="setNonOPModal(true)"
          :disabled="task_status != '작업중'"
          ><strong>비가동전환</strong></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl"
          variant="pending"
          @click="setBadAddModal(true)"
          :disabled="task_status != '작업중'"
          ><strong>불량변경</strong></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl"
          variant="pending"
          @click="setItemAddModal(true)"
          :disabled="task_status != '작업중'"
          ><strong>투입자재변경</strong></Button
        ><Button
          v-if="task_status == '작업중'"
          class="mr-5 h-14 w-44 text-2xl"
          variant="danger"
          @click="setTaskFinishModal(true)"
          ><strong>작업종료</strong></Button
        >
        <Button
          v-if="
            task_status == '작업미확인' ||
            task_status == '작업대기' ||
            task_status == ''
          "
          class="mr-5 h-14 w-48 text-2xl"
          variant="danger"
          @click="setTaskCancleModal(true)"
          :disabled="task_status == ''"
          ><strong>작업반려</strong></Button
        >
        <Button
          class="h-14 w-44 text-2xl"
          variant="danger"
          @click="setAlertModal(true)"
          ><Lucide icon="Siren" class="w-7 h-7 mb-0.5 mr-1" /><strong
            >고장발생</strong
          ></Button
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
        <strong>인쇄기1 설비 작업현황</strong>
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
                <tr class="border-b-2 border-success h-9">
                  <td class="border-success bg-slate-200 font-bold" colspan="2">
                    작업표준서
                  </td>
                </tr>
                <tr class="border-b-2 border-success h-24">
                  <td class="border-success" colspan="2">
                    <Button
                      class="mr-5 h-14 w-64 text-2xl text-white"
                      as="a"
                      variant="success"
                      @click="setTaskStandardModal(true)"
                      ><strong>작업표준서 열기</strong></Button
                    >
                  </td>
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
                <th class="border-r-2 border-[#D9821C] w-40">LOT코드</th>
                <th class="border-r-2 border-[#D9821C] w-32">품목코드</th>
                <th class="border-r-2 border-[#D9821C] w-32">품목구분</th>
                <th class="border-r-2 border-[#D9821C] w-48">품명</th>
                <th class="border-r-2 border-[#D9821C] w-32">단위</th>
                <th class="w-24">수량</th>
              </thead>
              <tbody>
                <tr v-for="i in Array(10).fill('10')">
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
                    class="border-r-2 border-primary bg-slate-200 font-bold w-[30%]"
                  >
                    지시수량
                  </td>
                  <td colspan="3" class="pl-2 text-left w-[70%]">
                    {{
                      Number(지시수량).toLocaleString(undefined, {
                        maximumFractionDigits: 11,
                      })
                    }}
                  </td>
                </tr>
                <tr class="border-b-2 border-primary h-9">
                  <td class="border-r-2 border-primary bg-slate-200 font-bold">
                    완료수량
                  </td>
                  <td class="pl-2 text-left">
                    {{
                      Number(완료수량).toLocaleString(undefined, {
                        maximumFractionDigits: 11,
                      })
                    }}
                  </td>
                </tr>
                <tr class="border-b-2 border-primary h-9">
                  <td class="border-r-2 border-primary bg-slate-200 font-bold">
                    생산수량
                  </td>
                  <td class="pl-2 text-left">
                    <div class="flex items-center">
                      <div class="mr-auto" :key="생산수량">
                        {{
                          Number(생산수량).toLocaleString(undefined, {
                            maximumFractionDigits: 11,
                          })
                        }}
                      </div>
                      <div class="ml-auto p-1">
                        <Button
                          class="h-7 mr-2"
                          variant="primary"
                          @click="생산수량_초기화()"
                          >초기화</Button
                        >
                      </div>
                      <!-- <div v-if="num_show != '0'" class="ml-auto">
                        <Button
                          class="h-7 text-white mr-2"
                          variant="primary"
                          @click="setWorkerChangeModal(true)"
                          >임시저장</Button
                        >
                      </div> -->
                    </div>
                  </td>
                </tr>
                <tr class="border-b-2 border-primary h-9">
                  <td class="border-r-2 border-primary bg-slate-200 font-bold">
                    불량수량
                  </td>
                  <td class="pl-2 text-left">
                    {{
                      Number(불량수량).toLocaleString(undefined, {
                        maximumFractionDigits: 11,
                      })
                    }}
                  </td>
                </tr>
                <tr class="border-b-2 border-primary h-9">
                  <td class="border-r-2 border-primary bg-slate-200 font-bold">
                    양품수량
                  </td>
                  <td class="pl-2 text-left w-28">
                    {{
                      Number(양품수량).toLocaleString(undefined, {
                        maximumFractionDigits: 11,
                      })
                    }}
                  </td>
                </tr>

                <tr class="border-b-2 border-primary h-9">
                  <td class="border-primary bg-slate-200 font-bold" colspan="3">
                    생산수 저장
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <div class="flex">
                      <div class="flex mx-auto">
                        <div
                          class="mt-1.5 mr-10 p-1.5 w-48 h-10 border-2 border-slate-200"
                        >
                          {{ 입력수량_show }}
                        </div>
                        <div class="mt-1.5">
                          <Button
                            class="mr-5 h-10"
                            variant="primary"
                            @click="생산수량_증가()"
                            >증가</Button
                          ><Button
                            class="h-10"
                            variant="danger"
                            @click="생산수량_차감()"
                            >차감</Button
                          >
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- <tr class="border-b-2 border-primary h-9">
                  <td class="border-primary bg-slate-200 font-bold" colspan="4">
                    작업진행률
                  </td>
                </tr>
                <tr>
                  <td colspan="4">
                    <div class="px-3">
                      <VueJsProgress
                        :title="
                          (Number(num_good) / Number(지시수량)) * 100 + '%'
                        "
                        :percentage="82"
                        bg="success"
                        :delay="600"
                        :striped="true"
                        :animation="true"
                      ></VueJsProgress>
                    </div>
                  </td>
                </tr> -->
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
                  <td class="pl-2 text-left">인쇄기1</td>
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
                  <td class="pl-2 text-left">
                    <div class="flex">
                      <div class="mr-auto">박명한</div>
                      <div class="ml-auto">
                        <Button
                          class="h-7 text-white mr-2"
                          variant="success"
                          @click="setWorkerChangeModal(true)"
                          >작업자변경</Button
                        >
                      </div>
                    </div>
                  </td>
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
                <tr v-for="i in Array(10).fill('10')">
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
                <tr v-for="i in Array(10).fill('10')">
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
        <div class="mt-8 text-4xl"><strong>인쇄기1 작업지시목록</strong></div>
      </div>
      <div>
        <TaskList
          :키오스크no="키오스크NO"
          :설비명="설비명"
          v-model:modalclose="taskListModal"
        />
      </div>

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

  <!-- BEGIN: 일상점검 Modal -->
  <Dialog :open="checkListModal" size="xxl">
    <Dialog.Panel>
      <div class="p-3 text-center">
        <div class="mt-8 text-4xl"><strong>일상점검</strong></div>
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
            <div class="ml-2">위 점검 목록을 확인하였습니다.</div>
          </div>
        </div></label
      >
      <div class="mt-1 mb-3 text-center text-2xl">
        <div class="flex">
          <div class="flex mx-auto">
            <div class="mr-3 mt-1.5">점검자 :</div>
            <div>
              <FormSelect
                class="w-48"
                formSelectSize="xxl"
                model-value="강민철"
              >
                <option>강민철</option>
                <option>고범석</option>
                <option>김주현</option>
                <option>박명한</option>
                <option>사은미</option>
                <option>손정일</option>
                <option>송은아</option>
                <option>윤호상</option>
                <option>이훈노</option>
                <option>최순우</option>
              </FormSelect>
            </div>
          </div>
        </div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-48 mr-10 text-2xl"
          :disabled="!checkListCheckBox"
          @click="setCheckListModal(false)"
        >
          저장
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
  <!-- END: 일상점검 Modal -->

  <!-- BEGIN: 작업시작 확인 Modal -->
  <Dialog :open="taskStartModal" size="lg" @close="setTaskStartModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="Play" class="w-24 h-24 mx-auto mt-3 text-success" />
        <div class="mt-5 text-3xl"><strong>작업 시작</strong></div>
        <div class="mt-3 text-2xl">설비가 작업중으로 전환됩니다.</div>
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
        <div class="mt-3 text-2xl">설비가 비가동으로 전환됩니다.</div>
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
        <div class="mt-5 text-3xl"><strong>설비가 비가동중입니다</strong></div>
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
  <!-- END: 작업 종료 Modal -->

  <!-- BEGIN: 작업 반려 Modal -->
  <Dialog :open="taskCancleModal" size="lg" @close="setTaskCancleModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="Slash" class="w-20 h-20 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl"><strong>작업반려</strong></div>
        <div class="mt-3 text-2xl">반려 사유를 입력해주세요.</div>
        <div class="mt-5">
          <div class="mt-5">
            <FormSelect class="w-64" formSelectSize="xxl" model-value="미입력">
              <option>미입력</option>
              <option>원자재 부족</option>
              <option>부자재 부족</option>
              <option>작업자 부족</option>
              <option>작업자 불일치</option>
              <option>기타</option>
            </FormSelect>
          </div>
          <div></div>
        </div>
      </div>

      <div class="mt-5 px-5 pb-8 text-center">
        <Button
          variant="danger"
          type="button"
          class="w-40 text-2xl mr-10"
          @click="setTaskCancleModal(false)"
        >
          작업반려
        </Button>
        <Button
          variant="outline-primary"
          type="button"
          class="w-40 text-2xl"
          @click="setTaskCancleModal(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업 반려 Modal -->

  <!-- BEGIN: 고장발생 확인 Modal -->
  <Dialog :open="alertModal" size="lg" @close="setAlertModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="Siren" class="w-24 h-24 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl"><strong>고장발생</strong></div>
        <div class="mt-3 text-2xl">설비가 고장중으로 전환됩니다.</div>
      </div>

      <div class="mt-5 px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          @click="
            () => {
              setAlertModal(false);
              setAlertAddModal(true);
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
          @click="setAlertModal(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 고장발생 확인 Modal -->

  <!-- BEGIN: 고장발생 Modal -->
  <Dialog :open="alertAddModal" size="lg">
    <Dialog.Panel>
      <div class="p-3 text-center">
        <Lucide icon="Siren" class="w-20 h-20 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl">
          <strong>설비가 고장 발생중입니다</strong>
        </div>
        <div class="mt-3 text-2xl">
          고장 사유를 선택하고 설비를 재개해 주세요
        </div>
      </div>
      <div><AlertAdd /></div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-48 text-2xl"
          @click="setAlertAddModal(false)"
        >
          설비재개
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 고장발생 Modal -->

  <!-- BEGIN: 작업표준서 열기 Modal -->
  <Dialog
    :open="taskStandardModal"
    size="xxl"
    @close="setTaskStandardModal(false)"
  >
    <Dialog.Panel style="top: -8%">
      <div
        class="mt-5"
        style="height: 850px; overflow-y: scroll; overflow-x: hidden"
      >
        <inner-image-zoom
          src="../../src/assets/images/task_standard/G5Z24.png"
          :zoomScale="1"
          :hideCloseButton="true"
          :hasSpacer="true"
        />
      </div>

      <div class="px-5 pt-5 pb-5 text-center">
        <Button
          variant="outline-primary"
          type="button"
          class="w-48 text-2xl"
          @click="setTaskStandardModal(false)"
        >
          닫기
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업표준서 열기 Modal -->

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
