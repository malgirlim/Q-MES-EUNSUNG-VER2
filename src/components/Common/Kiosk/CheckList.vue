<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { FormSelect } from "../../../base-components/Form";
import dayjs from "dayjs";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import { PreventDaily } from "../../../interfaces/menu/preventInterface";

// 데이터 가져오기
const props = defineProps<{
  키오스크no?: any;
  설비명?: any;
}>();

// 데이터 내보내기
const output = ref();
const emit = defineEmits(["update:output"]);
emit(`update:output`, output.value); // 실제로 내보낼 때 쓰는 코드

// 페이지 로딩 시 시작
onMounted(async () => {
  await dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
  await dataManager.searchDatas("전체기간", "설비명", props.설비명, "", ""); // 메인으로 쓸 데이터 불러오기

  console.log(dataManager.dataSearchAll.value);
});

// dataManager 만들기
const url = "/api/prevent/dailyresult";
const dataManager = useSendApi<PreventDaily>(url, ref(1), ref(100));

// 오늘날짜
dayjs.locale("ko");
let now = ref(dayjs().format("YYYY-MM-DD"));

const changeDate = (type: any) => {
  if (type == "dayPlus") {
    if (dayjs().diff(now.value, "day") > 0)
      now.value = dayjs(now.value).add(1, "day").format("YYYY-MM-DD");
  }

  if (type == "dayMinus") {
    now.value = dayjs(now.value).subtract(1, "day").format("YYYY-MM-DD");
  }

  if (type == "monthPlus") {
    if (dayjs().diff(now.value, "month") > 0)
      now.value = dayjs(now.value).add(1, "month").format("YYYY-MM-DD");
    else now.value = dayjs().format("YYYY-MM-DD");
  }

  if (type == "monthMinus") {
    now.value = dayjs(now.value).subtract(1, "month").format("YYYY-MM-DD");
  }

  if (type == "today") {
    now.value = dayjs().format("YYYY-MM-DD");
  }
};

// 키패드
const num = ref("0");
const num_show = ref("0");

let num_split = [];
let num_dot = ".";

const insert_num = (numpad_value: any) => {
  if (num.value == "0") num.value = "" + numpad_value;
  else if (num.value.length < 7) num.value += numpad_value;
};

const insert_dot = () => {
  const dot_count = num.value.split(".").length - 1;
  if (dot_count < 1 && num.value.length < 7) num.value += ".";
};

const delete_num = () => {
  if (num.value.length > 1) num.value = num.value.slice(0, -1);
  else num.value = "0";
};

const init_num = () => {
  num.value = "0";
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
});
</script>
<template>
  <div class="px-7">
    <div class="flex">
      <div class="flex mx-auto mb-3">
        <div class="cursor-pointer mr-5" @click="changeDate('monthMinus')">
          <Lucide class="w-5 h-5" icon="ChevronsLeft" />
        </div>
        <div class="cursor-pointer" @click="changeDate('dayMinus')">
          <Lucide class="w-5 h-5" icon="ChevronLeft" />
        </div>
        <div
          class="text-center mx-10 text-sm font-bold cursor-pointer"
          @click="changeDate('today')"
        >
          {{ dayjs(now).format("YYYY-MM-DD dddd") }}
        </div>
        <div class="cursor-pointer mr-5" @click="changeDate('dayPlus')">
          <Lucide class="w-5 h-5" icon="ChevronRight" />
        </div>
        <div class="cursor-pointer" @click="changeDate('monthPlus')">
          <Lucide class="w-5 h-5" icon="ChevronsRight" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-2">
      <div class="col-span-8">
        <div
          class="text-sm"
          style="height: 376px; overflow-y: visible; overflow-x: hidden"
        >
          <table class="w-full">
            <thead
              class="border-b-2 border-success bg-slate-200 h-8"
              style="position: sticky; top: 0px; z-index: 2"
            >
              <th
                class="border-t-2 border-l-2 border-r-2 border-success w-[6%]"
              >
                순서
              </th>
              <th class="border-t-2 border-r-2 border-success w-[10%]">
                점검항목
              </th>
              <th class="border-t-2 border-r-2 border-success w-[10%]">
                판정기준
              </th>
              <th class="border-t-2 border-r-2 border-success w-[6%]">단위</th>
              <th class="border-t-2 border-r-2 border-success w-[6%]">최소</th>
              <th class="border-t-2 border-r-2 border-success w-[6%]">최대</th>
              <th class="border-t-2 border-r-2 border-success w-[30%]">
                점검결과
              </th>
            </thead>
            <tbody>
              <tr
                class="text-center h-14"
                v-for="(todo, index) in dataManager.dataSearchAll.value.filter(
                  (c) =>
                    c.등록일시?.slice(0, 10) == dayjs(now).format('YYYY-MM-DD')
                )"
              >
                <td class="border-l-2 border-b-2 border-r-2 border-success">
                  {{ index + 1 }}
                </td>
                <td class="text-left px-1 border-b-2 border-r-2 border-success">
                  {{ todo.내용 }}
                </td>
                <td
                  class="text-center px-1 border-b-2 border-r-2 border-success"
                >
                  {{ todo.기준 }}
                </td>
                <td
                  class="text-center px-1 border-b-2 border-r-2 border-success"
                >
                  {{ todo.단위 }}
                </td>
                <td
                  class="text-center px-1 border-b-2 border-r-2 border-success"
                >
                  {{ todo.최소 }}
                </td>
                <td
                  class="text-center px-1 border-b-2 border-r-2 border-success"
                >
                  {{ todo.최대 }}
                </td>
                <td class="border-b-2 border-r-2 border-success">
                  <div class="flex">
                    <div
                      v-if="todo.검사방법 == '육안검사'"
                      class="flex m-auto items-center"
                    >
                      <label class="cursor-pointer">
                        <div class="flex items-center mr-3">
                          <div>
                            <input
                              class="mr-1 mb-1 w-5 h-5 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                              :name="'result' + index"
                              type="radio"
                            />
                          </div>
                          <div>양호</div>
                        </div></label
                      >
                      <label class="cursor-pointer">
                        <div class="flex items-center mr-3">
                          <div>
                            <input
                              class="mr-1 mb-1 w-5 h-5 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                              :name="'result' + index"
                              type="radio"
                            />
                          </div>
                          <div>점검필요</div>
                        </div></label
                      >
                      <label class="cursor-pointer">
                        <div class="flex items-center">
                          <div>
                            <input
                              class="mr-1 mb-1 w-5 h-5 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                              :name="'result' + index"
                              type="radio"
                            />
                          </div>
                          <div>불량</div>
                        </div></label
                      >
                    </div>
                    <div
                      v-if="todo.검사방법 == '치수검사'"
                      class="flex m-auto items-center"
                    >
                      <div class="flex items-center mr-2">
                        <div class="p-2 w-20 border-2 border-slate-200">
                          {{ todo.결과내용 }}
                        </div>
                      </div>

                      <div class="mr-3">
                        <Button class="text-white" variant="success"
                          ><Lucide class="w-5 h-5 mx-auto" icon="Edit"></Lucide
                        ></Button>
                      </div>
                      <div class="flex items-center">
                        <div class="text-success mb-0.5">●</div>
                        <div v-if="true">적합</div>
                        <div v-if="false">부적합</div>
                        <div v-if="false">미점검</div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-span-4">
        <div>
          <div class="text-sm">
            <table class="w-full">
              <thead>
                <tr class="border-t-2 border-l-2 border-b-2 border-success h-8">
                  <th
                    class="text-center border-r-2 border-success bg-slate-200 font-bold w-40"
                  >
                    결과 수정
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="text-2xl text-center border-l-2 border-r-2 border-success h-10"
                >
                  <td class="py-2">{{ num_show }}</td>
                </tr>

                <tr
                  class="text-center border-b-2 border-l-2 border-r-2 border-success h-10"
                >
                  <td class="p-2">
                    <Button
                      class="w-32 h-7 text-sm text-white"
                      variant="success"
                      @click="init_num()"
                      >초기화</Button
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div
          class="mt-4 h-8 py-1 border-l-2 border-r-2 border-t-2 border-success bg-slate-200 text-sm text-center"
        >
          <strong>결과 입력</strong>
        </div>
        <div class="h-10 border-2 border-success" style="height: 200px">
          <div class="grid grid-cols-3 mt-4">
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('1')"
                >1</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('2')"
                >2</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('3')"
                >3</Button
              >
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('4')"
                >4</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('5')"
                >5</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('6')"
                >6</Button
              >
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('7')"
                >7</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('8')"
                >8</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('9')"
                >9</Button
              >
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_dot()">.</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="insert_num('0')"
                >0</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="py-1 w-20 text-xl" @click="delete_num()"
                ><Lucide icon="Delete" class="w-7 h-7 mx-auto text-info"
              /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
