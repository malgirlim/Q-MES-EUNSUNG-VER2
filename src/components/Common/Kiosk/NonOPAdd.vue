<script setup lang="ts">
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { FormSelect } from "../../../base-components/Form";
import moment from "moment";

// 날짜 구하기
const now = moment().format("YYYY-MM-DD HH:mm:ss");

// 임시 데이터
</script>
<template>
  <div class="pb-7">
    <div
      class="pl-7 pr-3 text-xl"
      style="height: 298px; overflow-y: scroll; overflow-x: hidden"
    >
      <table class="w-full">
        <thead
          class="border-b-2 border-[#D9821C] bg-slate-200 h-10"
          style="position: sticky; top: 0px; z-index: 2"
        >
          <th class="border-l-2 border-t-2 border-r-2 border-[#D9821C] w-24">
            코드
          </th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-24">구분</th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-20">비가동명</th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-28">내용</th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-20">선택</th>
        </thead>
        <tbody>
          <tr class="text-center" v-for="i in Array(10).fill('10')">
            <td class="border-l-2 border-b-2 border-r-2 border-[#D9821C] h-16">
              NOP0023
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
              계획정지
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-10">휴식</td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
              휴게시간
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
    <div class="pl-7 pr-7 mt-3 text-lg">
      <table class="w-full">
        <tbody>
          <tr class="border-t-2 border-l-2 border-b-2 border-[#D9821C] h-9">
            <td
              class="text-center border-r-2 border-[#D9821C] bg-slate-200 font-bold w-40"
            >
              코드
            </td>
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">NOP0023</td>
          </tr>
          <tr class="border-b-2 border-l-2 border-[#D9821C] h-9">
            <td
              class="text-center border-r-2 border-[#D9821C] bg-slate-200 font-bold"
            >
              구분
            </td>
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">계획정지</td>
          </tr>
          <tr class="border-b-2 border-[#D9821C] h-9">
            <td
              class="text-center border-l-2 border-r-2 border-[#D9821C] bg-slate-200 font-bold"
            >
              비가동명
            </td>
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">휴식</td>
          </tr>
          <tr class="border-b-2 border-[#D9821C] h-9">
            <td
              class="text-center border-l-2 border-r-2 border-[#D9821C] bg-slate-200 font-bold"
            >
              내용
            </td>
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">휴게시간</td>
          </tr>
          <tr class="border-b-2 border-[#D9821C] h-9">
            <td
              class="text-center border-l-2 border-r-2 border-[#D9821C] bg-slate-200 font-bold"
            >
              시작일시
            </td>
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">
              {{ now }}
            </td>
          </tr>
          <tr class="border-b-2 border-[#D9821C] h-9">
            <td
              class="text-center border-l-2 border-r-2 border-[#D9821C] bg-slate-200 font-bold"
            >
              경과시간
            </td>
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">00:00:00</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
