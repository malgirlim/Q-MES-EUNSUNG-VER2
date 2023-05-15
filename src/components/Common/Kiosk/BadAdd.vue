<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import moment from "moment";

// 날짜 구하기
const now = moment().format("YYYY-MM-DD HH:mm:ss");

// 임시 데이터

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
  <div class="p-7">
    <div class="grid grid-cols-5 gap-2 text-2xl">
      <div class="col-span-2">
        <div
          class="mx-auto h-10 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
          style="width: 608px"
        >
          <strong>불량 등록 목록</strong>
        </div>
        <div
          class="pl-7 pr-3 text-xl"
          style="height: 554px; overflow-y: scroll; overflow-x: hidden"
        >
          <table class="w-full">
            <thead
              class="border-b-2 border-[#D9821C] bg-slate-200 h-10"
              style="position: sticky; top: 0px; z-index: 2"
            >
              <th
                class="border-l-2 border-t-2 border-r-2 border-[#D9821C] w-24"
              >
                코드
              </th>
              <th class="border-t-2 border-r-2 border-[#D9821C] w-24">구분</th>
              <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                불량명
              </th>
              <th class="border-t-2 border-r-2 border-[#D9821C] w-28">내용</th>
              <th class="border-t-2 border-r-2 border-[#D9821C] w-16">수량</th>
              <th class="border-t-2 border-r-2 border-[#D9821C] w-20">삭제</th>
            </thead>
            <tbody>
              <tr class="text-center" v-for="i in Array(10).fill('10')">
                <td
                  class="border-l-2 border-b-2 border-r-2 border-[#D9821C] h-16"
                >
                  BA0023
                </td>
                <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
                  소재불량
                </td>
                <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
                  오염
                </td>
                <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
                  원단오염
                </td>
                <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
                  10,000
                </td>
                <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
                  <Button class="h-10" variant="danger"
                    ><Lucide class="w-6 h-6 mx-auto" icon="Trash2"
                  /></Button>
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
                  class="border-t-2 border-l-2 border-b-2 border-[#D9821C] h-10"
                >
                  <th
                    class="text-center border-r-2 border-[#D9821C] bg-slate-200 font-bold w-40"
                  >
                    불량수
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="text-6xl text-center border-b-2 border-l-2 border-r-2 border-[#D9821C] h-10"
                >
                  <td class="py-9">{{ num_show }}</td>
                </tr>

                <tr
                  class="text-center border-b-2 border-l-2 border-r-2 border-[#D9821C] h-10"
                >
                  <td class="p-5">
                    <Button class="w-32 h-16 text-2xl" variant="primary"
                      ><Lucide
                        class="w-9 h-9 mb-0.5"
                        icon="ChevronsLeft"
                      />등록</Button
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div
          class="mt-4 h-10 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
        >
          <strong>불량수 입력</strong>
        </div>
        <div class="h-10 border-2 border-[#D9821C]" style="height: 279px">
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
      <div class="col-span-2">
        <div
          class="mx-auto h-10 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
          style="width: 608px"
        >
          <strong>불량 유형 선택</strong>
        </div>
        <div
          class="pl-7 pr-3 text-xl"
          style="height: 362px; overflow-y: scroll; overflow-x: hidden"
        >
          <table class="w-full">
            <thead
              class="border-b-2 border-[#D9821C] bg-slate-200 h-10"
              style="position: sticky; top: 0px; z-index: 2"
            >
              <th
                class="border-l-2 border-t-2 border-r-2 border-[#D9821C] w-24"
              >
                코드
              </th>
              <th class="border-t-2 border-r-2 border-[#D9821C] w-24">구분</th>
              <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                불량명
              </th>
              <th class="border-t-2 border-r-2 border-[#D9821C] w-28">내용</th>
              <th class="border-t-2 border-r-2 border-[#D9821C] w-20">선택</th>
            </thead>
            <tbody>
              <tr class="text-center" v-for="i in Array(10).fill('10')">
                <td
                  class="border-l-2 border-b-2 border-r-2 border-[#D9821C] h-16"
                >
                  BA0023
                </td>
                <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
                  소재불량
                </td>
                <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
                  오염
                </td>
                <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
                  원단오염
                </td>

                <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
                  <Button class="h-10" variant="primary"
                    ><Lucide class="w-6 h-6 mx-auto" icon="CheckSquare"
                  /></Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pl-7 pr-7 mt-3 text-xl">
          <div
            class="h-10 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
          >
            <strong>선택된 불량 유형</strong>
          </div>
          <table class="w-full">
            <tbody>
              <tr
                class="border-t-2 border-l-2 border-b-2 border-[#D9821C] h-10"
              >
                <td
                  class="text-center border-r-2 border-[#D9821C] bg-slate-200 font-bold w-40"
                >
                  코드
                </td>
                <td class="pl-2 border-r-2 border-[#D9821C] text-left">
                  BA0023
                </td>
              </tr>
              <tr class="border-b-2 border-l-2 border-[#D9821C] h-10">
                <td
                  class="text-center border-r-2 border-[#D9821C] bg-slate-200 font-bold"
                >
                  구분
                </td>
                <td class="pl-2 border-r-2 border-[#D9821C] text-left">
                  소재불량
                </td>
              </tr>
              <tr class="border-b-2 border-[#D9821C] h-10">
                <td
                  class="text-center border-l-2 border-r-2 border-[#D9821C] bg-slate-200 font-bold"
                >
                  불량명
                </td>
                <td class="pl-2 border-r-2 border-[#D9821C] text-left">오염</td>
              </tr>
              <tr class="border-b-2 border-[#D9821C] h-10">
                <td
                  class="text-center border-l-2 border-r-2 border-[#D9821C] bg-slate-200 font-bold"
                >
                  내용
                </td>
                <td class="pl-2 border-r-2 border-[#D9821C] text-left">
                  원단오염
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
