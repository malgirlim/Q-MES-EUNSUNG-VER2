<script setup lang="ts">
import { ref } from "vue";
import Button from "../../../../base-components/Button";
import Lucide from "../../../../base-components/Lucide";
import { FormSelect, FormInput } from "../../../../base-components/Form";

// 데이터 내보내기 (부모모달끄기)
const output = ref();
const emit = defineEmits(["update:output", "update:modalclose"]);
// emit(`update:modalclose`, false); // 버튼에 넣을 함수
</script>
<template>
  <div class="p-5">
    <div class="flex p-1">
      <div class="flex m-auto items-center">
        <Lucide class="w-5 h-5 mr-1" icon="List" /><strong>비가동 유형</strong>
      </div>
    </div>
    <div
      class="text-md"
      style="height: 220px; overflow-y: visible; overflow-x: hidden"
    >
      <div>
        <div class="border-l-2 border-r-2 border-t-2 border-[#D9821C]">
          <table class="w-full">
            <thead
              class="border-b-2 border-[#D9821C] bg-slate-200 h-8"
              style="position: sticky; top: 0px; z-index: 2"
            >
              <th class="border-r-2 border-[#D9821C] w-14">코드</th>
              <th class="border-r-2 border-[#D9821C] w-22">비가동명</th>
              <th class="w-14">선택</th>
            </thead>
            <tbody>
              <tr v-for="i in Array(10).fill('10')">
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  0012
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  계획정지
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
        </div>
      </div>
    </div>
    <div class="flex p-1">
      <div class="flex m-auto items-center">
        <Lucide class="w-5 h-5 mr-1" icon="List" /><strong>선택 목록</strong>
      </div>
    </div>
    <div
      class="text-md"
      style="height: 220px; overflow-y: visible; overflow-x: hidden"
    >
      <div>
        <div class="border-l-2 border-r-2 border-t-2 border-[#D9821C]">
          <table class="w-full">
            <thead
              class="border-b-2 border-[#D9821C] bg-slate-200 h-8"
              style="position: sticky; top: 0px; z-index: 2"
            >
              <th class="border-r-2 border-[#D9821C] w-14">코드</th>
              <th class="border-r-2 border-[#D9821C] w-22">비가동명</th>
              <th class="w-14">선택</th>
            </thead>
            <tbody>
              <tr v-for="i in Array(10).fill('10')">
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  0012
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  계획정지
                </td>
                <td class="py-1.5 text-center border-b-2 border-[#D9821C] h-7">
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
    <div class="px-5 pt-5 pb-3 text-center">
      <Button
        class="mr-5 w-20"
        variant="primary"
        @click="
          () => {
            emit(`update:modalclose`, false);
          }
        "
        >저장</Button
      >
      <Button
        class="w-20"
        variant="outline-primary"
        @click="
          () => {
            emit(`update:modalclose`, false);
          }
        "
        >닫기</Button
      >
    </div>
  </div>
</template>
