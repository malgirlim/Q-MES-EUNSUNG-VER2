<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { FormSelect } from "../../../base-components/Form";
import dayjs from "dayjs";

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
  <div class="px-7 py-3">
    <div class="flex">
      <div class="flex mx-auto mb-3">
        <div class="cursor-pointer mr-5" @click="changeDate('monthMinus')">
          <Lucide class="w-10 h-10" icon="ChevronsLeft" />
        </div>
        <div class="cursor-pointer" @click="changeDate('dayMinus')">
          <Lucide class="w-10 h-10" icon="ChevronLeft" />
        </div>
        <div
          class="text-center mx-10 mt-1 text-2xl font-bold cursor-pointer"
          @click="changeDate('today')"
        >
          {{ dayjs(now).format("YYYY-MM-DD dddd") }}
        </div>
        <div class="cursor-pointer mr-5" @click="changeDate('dayPlus')">
          <Lucide class="w-10 h-10" icon="ChevronRight" />
        </div>
        <div class="cursor-pointer" @click="changeDate('monthPlus')">
          <Lucide class="w-10 h-10" icon="ChevronsRight" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-5 gap-2">
      <div class="col-span-4">
        <div
          class="text-2xl"
          style="height: 499px; overflow-y: visible; overflow-x: hidden"
        >
          <table class="w-full">
            <thead
              class="border-b-2 border-success bg-slate-200 h-20"
              style="position: sticky; top: 0px; z-index: 2"
            >
              <th
                class="border-t-2 border-l-2 border-r-2 border-success w-[5%]"
              >
                순서
              </th>
              <th class="border-t-2 border-r-2 border-success w-[25%]">
                점검항목
              </th>
              <th class="border-t-2 border-r-2 border-success w-[15%]">
                판정기준
              </th>
              <th class="border-t-2 border-r-2 border-success w-[7.5%]">
                단위
              </th>
              <th class="border-t-2 border-r-2 border-success w-[7.5%]">
                최소
              </th>
              <th class="border-t-2 border-r-2 border-success w-[7.5%]">
                최대
              </th>
              <th class="border-t-2 border-r-2 border-success w-[35%]">
                점검결과
              </th>
            </thead>
            <tbody>
              <tr
                class="text-center"
                v-for="(i, index) in Array(15).fill('10')"
              >
                <td
                  class="border-l-2 border-b-2 border-r-2 border-success h-20"
                >
                  1
                </td>
                <td
                  class="text-left pl-2 border-b-2 border-r-2 border-success h-20"
                >
                  불이 잘 꺼져 있나요
                </td>
                <td
                  class="text-center pl-2 border-b-2 border-r-2 border-success h-20"
                >
                  불이 꺼짐
                </td>
                <td
                  class="text-center pl-2 border-b-2 border-r-2 border-success h-20"
                >
                  -
                </td>
                <td
                  class="text-center pl-2 border-b-2 border-r-2 border-success h-20"
                >
                  -
                </td>
                <td
                  class="text-center pl-2 border-b-2 border-r-2 border-success h-20"
                >
                  -
                </td>
                <td class="border-b-2 border-r-2 border-success h-20">
                  <div class="flex">
                    <div v-if="false" class="flex m-auto items-center">
                      <label class="cursor-pointer">
                        <div class="flex items-center mr-10">
                          <div>
                            <input
                              class="mr-2 mb-1 w-6 h-6 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                              :name="'result' + index"
                              type="radio"
                            />
                          </div>
                          <div>양호</div>
                        </div></label
                      >
                      <label class="cursor-pointer">
                        <div class="flex items-center mr-10">
                          <div>
                            <input
                              class="mr-2 mb-1 w-6 h-6 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
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
                              class="mr-2 mb-1 w-6 h-6 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                              :name="'result' + index"
                              type="radio"
                            />
                          </div>
                          <div>불량</div>
                        </div></label
                      >
                    </div>
                    <div v-if="true" class="flex m-auto items-center">
                      <div class="flex items-center mr-2">
                        <div class="p-2 w-32 border-2 border-slate-200">24</div>
                      </div>

                      <div class="mr-16">
                        <Button class="text-white" variant="success"
                          ><Lucide class="w-6 h-6 mx-auto" icon="Edit"></Lucide
                        ></Button>
                      </div>
                      <div class="flex items-center">
                        <div class="text-success mb-1 mr-1">●</div>
                        <div v-if="true">양호</div>
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
      <div class="col-span-1">
        <div>
          <div class="text-xl">
            <table class="w-full">
              <thead>
                <tr
                  class="border-t-2 border-l-2 border-b-2 border-success h-10"
                >
                  <th
                    class="text-center border-r-2 border-success bg-slate-200 font-bold w-40"
                  >
                    결과 수정
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="text-5xl text-center border-l-2 border-r-2 border-success h-10"
                >
                  <td class="py-2">{{ num_show }}</td>
                </tr>

                <tr
                  class="text-center border-b-2 border-l-2 border-r-2 border-success h-10"
                >
                  <td class="p-2">
                    <Button
                      class="w-32 h-10 text-2xl text-white"
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
          class="mt-4 h-10 py-1 border-l-2 border-r-2 border-t-2 border-success bg-slate-200 text-xl text-center"
        >
          <strong>결과 입력</strong>
        </div>
        <div class="h-10 border-2 border-success" style="height: 279px">
          <div class="grid grid-cols-3 mt-4">
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('1')">1</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('2')">2</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('3')">3</Button>
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('4')">4</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('5')">5</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('6')">6</Button>
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('7')">7</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('8')">8</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('9')">9</Button>
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_dot()">.</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="insert_num('0')">0</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="w-24 text-4xl" @click="delete_num()"
                ><Lucide icon="Delete" class="w-8 h-10 mx-auto text-info"
              /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
