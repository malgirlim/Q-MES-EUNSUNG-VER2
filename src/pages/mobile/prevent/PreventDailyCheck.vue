<script setup lang="ts">
import { ref, Ref, onMounted, watch, getCurrentInstance } from "vue";
import router from "../../../router";
import Button from "../../../base-components/Button";
import {
  FormInput,
  FormSelect,
  FormCheck,
} from "../../../base-components/Form";
import Lucide from "../../../base-components/Lucide";
import { Dialog, Menu } from "../../../base-components/Headless";
import Table from "../../../base-components/Table";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import Litepicker from "../../../base-components/Litepicker";
import TomSelect from "tom-select";
import PaginationComponent from "../../../components/Pagination/PaginationComponent.vue"; // 페이징설정
import { toast } from "vue3-toastify";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import {
  PreventDaily,
  PreventDailyCheck,
} from "../../../interfaces/menu/preventInterface";

// 컴포넌트 로드
// import DailyCheck from "../../../components/Common/Mobile/Prevent/DailyCheck.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.OrderCurrent; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
  dailyresult.loadDatas(); // 점검결과 불러오기
  setTimeout(() => {
    menu_fix.value = ".";
  }, 500);
});

// 오늘날짜
dayjs.locale("ko");
const now = dayjs().format("YYYY-MM-DD dddd");

// 메뉴재정렬 (메뉴 레이아웃 밀리는 문제 해결 코드)
const menu_fix = ref();

// 페이징기능
const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst = () => {
  currentPage.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// dataManager 만들기
const url = "/api/prevent/dailycheck";
const dataManager = useSendApi<PreventDailyCheck>(
  url,
  currentPage,
  rowsPerPage
);

// 점검결과 가져오기
const url_dailyresult = "/api/prevent/dailyresult";
const dailyresult = useSendApi<PreventDaily>(url_dailyresult, ref(1), ref(10));

// 테이블항목 설정 및 가로크기 조정
const table_setting = {
  순번: { name: "순번", style: "text-align: center;" },
  항목1: { name: "설비명", style: "text-align: center;" },
  항목2: { name: "점검", style: "text-align: center;" },
  항목3: { name: "점검현황", style: "text-align: center;" },
};

// v-tom (모달 실시간 데이터 변동) 에 필요한 함수
const vTom = {
  mounted(el: any, binding: any, vnode: any) {
    const options = binding.value || {};
    const defaultOptions = {
      onInitialize: function () {
        // the onInitialize callback is invoked once the control is completely initialized.
        // console.log("onInitialize", this);
      },
    };
    new TomSelect(el, { ...defaultOptions, ...options });
  },
  unmounted(el: any) {
    const tomSelect = el.tomselect;
    if (tomSelect) {
      tomSelect.destroy();
      delete el.tomselect;
    }
  },
};

// ########################## 알림 기능 ##########################
const noti = (data: string) => {
  Notification.requestPermission();
  new Notification("설비 알림", {
    body: data,
    image: "../assets/image/logo.png",
  });
};

// ########################## 점검시작 Modal ##########################
let updateData: PreventDaily;

const checkCheckBox = ref(false);
const checkModal = ref(false);
const setCheckModal = (value: boolean) => {
  updateData = dailyresult.dataSearchAll;
  // console.log(updateData);
  checkModal.value = value;
};
const checkCheckConfirm = async () => {
  for (var data of updateData.value) {
    if (data.검사방법 == "치수검사") {
      if (
        Number(data.최소) <= Number(data.결과내용) &&
        Number(data.최대) >= Number(data.결과내용)
      ) {
        data.결과 = "적합";
      } else data.결과 = "부적합";

      if (
        data.결과내용 == "" ||
        data.결과내용 == null ||
        data.결과내용 == undefined
      )
        data.결과 = "미점검";
    }
    await dailyresult.editData(data);
  }
  await dataManager.loadDatas();
  await setCheckModal(false);
};
</script>

##############################################################################################################

<template>
  <div v-if="user_level >= 2">
    <div class="p-3">
      <div class="text-center text-lg font-bold">{{ now }} 일상점검 리스트</div>
    </div>

    <!-- BEGIN: Data List -->
    <div class="intro-y">
      <div class="px-3">
        <Table class="border-spacing-y-[8px] border-separate -mt-2">
          <Table.Thead
            class="bg-slate-100"
            style="position: sticky; top: 0px; z-index: 2"
          >
            <Table.Tr>
              <Table.Th
                class="px-2 text-center w-1/12 border-b-0 whitespace-nowrap font-bold"
                :style="table_setting.순번.style"
              >
                {{ table_setting.순번.name }}
              </Table.Th>
              <Table.Th
                class="px-2 text-center w-5/12 border-b-0 whitespace-nowrap font-bold"
                :style="table_setting.항목1.style"
              >
                {{ table_setting.항목1.name }}
              </Table.Th>
              <Table.Th
                class="px-2 text-center w-3/12 border-b-0 whitespace-nowrap font-bold"
                :style="table_setting.항목2.style"
              >
                {{ table_setting.항목2.name }}
              </Table.Th>
              <Table.Th
                class="px-2 text-center w-3/12 border-b-0 whitespace-nowrap font-bold"
                :style="table_setting.항목3.style"
              >
                {{ table_setting.항목3.name }}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody style="position: relative; z-index: 1">
            <Table.Tr
              v-for="(todo, index) in dataManager.datas.value"
              :key="todo.설비NO"
              class="intro-x"
            >
              <Table.Td
                class="px-2 first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_setting.순번.style"
              >
                <div>{{ index + 1 + (currentPage - 1) * rowsPerPage }}</div>
              </Table.Td>
              <Table.Td
                class="px-2 first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_setting.항목1.style"
              >
                <div>{{ todo[table_setting.항목1.name] }}</div>
              </Table.Td>
              <Table.Td
                class="px-2 first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_setting.항목2.style"
              >
                <div>
                  <Button
                    variant="primary"
                    @click="
                      async () => {
                        await dailyresult.searchDatas(
                          dayjs().format('YY/MM/DD - YY/MM/DD'),
                          '설비NO',
                          todo.설비NO,
                          'NO',
                          '오름차순'
                        );
                        await setCheckModal(true);
                      }
                    "
                    >점검</Button
                  >
                </div>
                <!-- <div>
                  <Button class="text-black" variant="secondary"
                    >완료</Button
                  >
                </div> -->
              </Table.Td>
              <Table.Td
                class="px-2 first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_setting.항목3.style"
              >
                <div v-if="todo.점검현황 == '미점검'" class="text-danger">
                  미점검
                </div>
                <div v-if="todo.점검현황 == '점검중'" class="text-pending">
                  점검중
                </div>
                <div v-if="todo.점검현황 == '점검완료'" class="text-success">
                  점검완료
                </div>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <div class="text-center mt-20" v-if="dataManager.dataCount.value == 0">
          저장된 데이터가 없습니다.
        </div>
      </div>
    </div>
    <!-- END: Data List -->
  </div>

  <!-- BEGIN : 권한 경고 -->
  <div class="intro-y" v-if="user_level < 2">
    <div class="mt-20 items-center text-center">
      <div>
        <Lucide icon="AlertTriangle" class="w-20 h-20 mx-auto text-warning" />
      </div>
      <div class="mt-3 text-2xl">ACCESS DENIED</div>
    </div>
    <div class="mt-5 text-center">액세스 권한이 없습니다.</div>
    <div class="mt-2 text-center">
      IT 관리자에게 연락하여 액세스 권한을 요청하세요.
    </div>
  </div>
  <!-- END : 권한 없을 때 -->
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mt-5 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved{{ menu_fix }}</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->

  <!-- BEGIN: 점검목록 Modal -->
  <Dialog :open="checkModal" size="md">
    <Dialog.Panel style="top: -7%">
      <div class="p-1 text-center"></div>
      <div>
        <div class="p-5">
          <div
            class="text-md"
            style="height: 480px; overflow-y: visible; overflow-x: hidden"
          >
            <div v-for="(todo, index) in updateData" :key="todo.NO">
              <table class="w-full">
                <tbody class="border-2 border-primary text-center">
                  <tr>
                    <td
                      class="font-bold border-r-2 border-b-2 border-primary bg-slate-200 h-8"
                    >
                      순서
                    </td>
                    <td
                      class="font-bold border-b-2 border-primary bg-slate-200"
                      colspan="4"
                    >
                      점검항목
                    </td>
                  </tr>
                  <tr>
                    <td class="border-r-2 border-b-2 border-primary h-8">
                      {{ index + 1 }}
                    </td>
                    <td class="border-b-2 border-primary" colspan="4">
                      <div>{{ todo.내용 }}</div>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="font-bold border-r-2 border-b-2 border-primary bg-slate-200 h-8"
                      colspan="3"
                    >
                      판정기준
                    </td>
                    <td
                      class="font-bold border-b-2 border-primary bg-slate-200"
                    >
                      점검결과
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="border-r-2 border-b-2 border-primary h-8"
                      colspan="3"
                    >
                      {{ todo.기준 }}
                    </td>
                    <td rowspan="3">
                      <div v-if="todo.검사방법 == '육안검사'">
                        <!--설비점검-->
                        <div class="text-left ml-4">
                          <label class="cursor-pointer"
                            ><div class="flex items-center mb-3">
                              <input
                                class="mr-2 mb-1 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                                :name="'result' + index"
                                @click="todo.결과 = '양호'"
                                type="radio"
                                :checked="todo.결과 == '양호'"
                              />
                              <div class="text-success">양호</div>
                            </div></label
                          >
                          <label class="cursor-pointer"
                            ><div class="flex items-center mb-3">
                              <input
                                class="mr-2 mb-1 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                                :name="'result' + index"
                                @click="todo.결과 = '점검필요'"
                                type="radio"
                                :checked="todo.결과 == '점검필요'"
                              />
                              <div class="text-pending">점검필요</div>
                            </div></label
                          >
                          <label class="cursor-pointer"
                            ><div class="flex items-center">
                              <input
                                class="mr-2 mb-1 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                                :name="'result' + index"
                                @click="todo.결과 = '불량'"
                                type="radio"
                                :checked="todo.결과 == '불량'"
                              />
                              <div class="text-danger">불량</div>
                            </div></label
                          >
                        </div>
                      </div>

                      <div v-if="todo.검사방법 == '치수검사'">
                        <!--수치점검-->
                        <div class="text-center">
                          <div class="my-3">
                            <FormInput
                              class="text-center px-0 w-24"
                              type="text"
                              placeholder="수치입력"
                              v-model="todo.결과내용"
                              :value="todo.결과내용"
                            />
                          </div>
                          <div v-if="todo.결과 == '적합'">
                            <label class="text-success mr-1">●</label>적합
                          </div>
                          <div v-if="todo.결과 == '부적합'">
                            <label class="text-danger mr-1">●</label>부적합
                          </div>
                          <div v-if="todo.결과 == '미점검'">
                            <label class="mr-1">●</label>미점검
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="font-bold border-r-2 border-b-2 border-primary bg-slate-200 h-8"
                    >
                      단위
                    </td>
                    <td
                      class="font-bold border-r-2 border-b-2 border-primary bg-slate-200"
                    >
                      최소
                    </td>
                    <td
                      class="font-bold border-r-2 border-b-2 border-primary bg-slate-200"
                    >
                      최대
                    </td>
                  </tr>
                  <tr>
                    <td class="border-r-2 border-primary h-8">
                      {{ todo.단위 }}
                    </td>
                    <td class="border-r-2 border-primary">{{ todo.최소 }}</td>
                    <td class="border-r-2 border-primary">{{ todo.최대 }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="mt-5"></div>
            </div>
          </div>
        </div>
      </div>
      <label class="cursor-pointer"
        ><div class="flex text-center text-md mb-5">
          <div class="flex m-auto">
            <div>
              <Input
                class="w-4 h-4 mb-0.5 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed"
                id="checkCheckBox"
                type="checkbox"
                :value="checkCheckBox"
                v-model="checkCheckBox"
              />
            </div>
            <div class="ml-2">위 점검 목록을 모두 확인하였습니다.</div>
          </div>
        </div></label
      >
      <div class="mt-1 mb-3 text-center text-md">
        점검자 : {{ proxy.gstate.account.name }}
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-24 mr-10"
          :disabled="!checkCheckBox"
          @click="checkCheckConfirm()"
        >
          확인
        </Button>

        <Button
          variant="outline-primary"
          type="button"
          class="w-24"
          @click="setCheckModal(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 점검목록 Modal -->
</template>
