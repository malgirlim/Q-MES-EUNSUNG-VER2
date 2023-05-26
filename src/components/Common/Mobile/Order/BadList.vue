<script setup lang="ts">
import { ref } from "vue";
import Button from "../../../../base-components/Button";
import Lucide from "../../../../base-components/Lucide";
import { FormSelect, FormInput } from "../../../../base-components/Form";
</script>
v-for="i in Array(5).fill('10')"
<template>
  <div class="p-5">
    <div
      class="text-md"
      style="height: 250px; overflow-y: visible; overflow-x: hidden"
    >
      <div>
        <div
          class="flex rounded-t-md h-8 pl-1 pr-1 pt-1 bg-[#D9821C] text-white"
        >
          <div class="m-auto"><strong>불량 유형</strong></div>
        </div>
        <div class="border-l-2 border-r-2 border-t-2 border-[#D9821C]">
          <table class="w-full">
            <thead
              class="border-b-2 border-[#D9821C] bg-slate-200 h-8"
              style="position: sticky; top: 0px; z-index: 2"
            >
              <th class="border-r-2 border-[#D9821C] w-14">코드</th>
              <th class="border-r-2 border-[#D9821C] w-22">구분</th>
              <th class="border-r-2 border-[#D9821C] w-32">불량명</th>
              <th class="w-14">선택</th>
            </thead>
            <tbody>
              <tr v-for="i in Array(20).fill('10')">
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  0011
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  오염
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  재질오염
                </td>
                <td class="py-1.5 text-center border-b-2 border-[#D9821C] h-7">
                  <Button variant="primary"
                    ><Lucide class="w-4 h-4" icon="CheckSquare"
                  /></Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div>
      <div class="flex p-2">
        <div class="flex m-auto">
          <div><Lucide class="w-6 h-6 mr-1" icon="ChevronsDown" /></div>
          <div><Lucide class="w-6 h-6 mr-1" icon="ChevronsDown" /></div>
          <div><Lucide class="w-6 h-6" icon="ChevronsDown" /></div>
          <Button>모달닫기테스트</Button>
        </div>
      </div>
    </div>
    <div
      class="text-md"
      style="height: 250px; overflow-y: visible; overflow-x: hidden"
    >
      <div>
        <div
          class="flex rounded-t-md h-8 pl-1 pr-1 pt-1 bg-[#D9821C] text-white"
        >
          <div class="m-auto"><strong>선택 목록</strong></div>
        </div>
        <div class="border-l-2 border-r-2 border-t-2 border-[#D9821C]">
          <table class="w-full">
            <thead class="border-b-2 border-[#D9821C] bg-slate-200 h-8">
              <th class="border-r-2 border-[#D9821C] w-14">코드</th>
              <th class="border-r-2 border-[#D9821C] w-22">구분</th>
              <th class="border-r-2 border-[#D9821C] w-32">불량명</th>
              <th class="w-14">삭제</th>
            </thead>
            <tbody>
              <tr v-for="i in Array(20).fill('10')">
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  0011
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  오염
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  재질오염
                </td>
                <td class="p-1 text-center border-b-2 border-[#D9821C] h-7">
                  <Button variant="danger"
                    ><Lucide class="w-4 h-4" icon="Trash"
                  /></Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
