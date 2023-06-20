<script setup lang="ts">
import { ref, watch } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import dayjs from "dayjs";

// 날짜 구하기
const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

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
  <div class="p-3">
    <div class="grid grid-cols-10 gap-2 text-lg">
      <div class="col-span-7">
        <div>
          <div
            class="text-base mx-auto h-8 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
            style="width: 570px"
          >
            <strong>투입자재 선택</strong>
          </div>
          <div
            class="pl-7 pr-3 text-sm"
            style="height: 210px; overflow-y: scroll; overflow-x: hidden"
          >
            <table class="w-full">
              <thead
                class="border-b-2 border-[#D9821C] bg-slate-200 h-8"
                style="position: sticky; top: 0px; z-index: 2"
              >
                <th
                  class="border-l-2 border-t-2 border-r-2 border-[#D9821C] w-24"
                >
                  입고코드
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-24">
                  품목코드
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-14">
                  품목구분
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-28">
                  품명
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-28">
                  규격
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-16">
                  단위
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-16">
                  수량
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  선택
                </th>
              </thead>
              <tbody>
                <tr class="text-center" v-for="i in Array(10).fill('10')">
                  <td
                    class="border-l-2 border-b-2 border-r-2 border-[#D9821C] h-16"
                  >
                    IN0023
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    A0003
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    원부자재
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    MOLD
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    200mm
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">장</td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    100
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    <Button class="h-7 w-16" variant="primary"
                      ><Lucide class="w-5 h-5 mx-auto" icon="CheckSquare"
                    /></Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="flex p-2">
          <div class="flex m-auto">
            <div><Lucide class="w-5 h-5 mr-1" icon="ChevronsDown" /></div>
            <div><Lucide class="w-5 h-5 mr-1" icon="ChevronsDown" /></div>
            <div><Lucide class="w-5 h-5" icon="ChevronsDown" /></div>
          </div>
        </div>
        <div>
          <div
            class="text-base mx-auto h-8 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
            style="width: 570px"
          >
            <strong>투입자재 등록 목록</strong>
          </div>
          <div
            class="pl-7 pr-3 text-sm"
            style="height: 210px; overflow-y: scroll; overflow-x: hidden"
          >
            <table class="w-full">
              <thead
                class="border-b-2 border-[#D9821C] bg-slate-200 h-8"
                style="position: sticky; top: 0px; z-index: 2"
              >
                <th
                  class="border-l-2 border-t-2 border-r-2 border-[#D9821C] w-24"
                >
                  입고코드
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-24">
                  품목코드
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  품목구분
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-28">
                  품명
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-28">
                  규격
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-16">
                  단위
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-16">
                  수량
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  수량수정
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  삭제
                </th>
              </thead>
              <tbody>
                <tr class="text-center" v-for="i in Array(10).fill('10')">
                  <td
                    class="border-l-2 border-b-2 border-r-2 border-[#D9821C] h-16"
                  >
                    IN0023
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    A0003
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    원부자재
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    MOLD
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    200mm
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">장</td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    <div class="mx-auto p-2 w-20 border-2 border-slate-200">
                      24
                    </div>
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    <Button class="h-7 w-16" variant="pending"
                      ><Lucide class="w-5 h-5 mx-auto" icon="Edit"
                    /></Button>
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    <Button class="h-7 w-16" variant="danger"
                      ><Lucide class="w-5 h-5 mx-auto" icon="Trash2"
                    /></Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-span-3">
        <div>
          <div class="text-sm">
            <table class="w-full">
              <thead>
                <tr
                  class="border-t-2 border-l-2 border-b-2 border-[#D9821C] h-8"
                >
                  <th
                    class="text-center border-r-2 border-[#D9821C] bg-slate-200 font-bold w-40"
                  >
                    수량 수정
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="text-2xl text-center border-b-2 border-l-2 border-r-2 border-[#D9821C] h-8"
                >
                  <td class="" style="height: 142px">{{ num_show }}</td>
                </tr>

                <tr
                  class="text-center border-b-2 border-l-2 border-r-2 border-[#D9821C] h-8"
                >
                  <td class="p-5">
                    <Button
                      class="w-32 h-6 text-lg"
                      variant="pending"
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
          class="text-base mt-9 h-8 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
        >
          <strong>수량 입력</strong>
        </div>
        <div class="h-8 border-2 border-[#D9821C]" style="height: 210px">
          <div class="grid grid-cols-3 mt-4">
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('1')"
                >1</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('2')"
                >2</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('3')"
                >3</Button
              >
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('4')"
                >4</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('5')"
                >5</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('6')"
                >6</Button
              >
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('7')"
                >7</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('8')"
                >8</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('9')"
                >9</Button
              >
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_dot()">.</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('0')"
                >0</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="delete_num()"
                ><Lucide icon="Delete" class="w-8 h-8 mx-auto text-info"
              /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
