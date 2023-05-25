<script setup lang="ts">
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { FormSelect } from "../../../base-components/Form";
import dayjs from "dayjs";

// 날짜 구하기
const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

// 임시 데이터
</script>
<template>
  <div class="pb-7">
    <div
      class="pl-7 pr-3 text-xl"
      style="height: 234px; overflow-y: scroll; overflow-x: hidden"
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
              NOE0021
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
              설비고장
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
              고장수리
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-10">
              설비 고장 수리중
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
      <div>
        <table class="w-full">
          <tbody>
            <tr class="border-t-2 border-l-2 border-b-2 border-[#D9821C] h-9">
              <td
                class="text-center border-r-2 border-[#D9821C] bg-slate-200 font-bold w-40"
              >
                조치내역
              </td>
              <td class="p-2 border-r-2 border-[#D9821C] text-center">
                <FormSelect
                  class="w-full"
                  formSelectSize="lg"
                  model-value="미입력"
                >
                  <option>미입력</option>
                  <option>수리 접수</option>
                  <option>수리 진행중</option>
                  <option>수리 완료</option>
                </FormSelect>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">NOE0021</td>
          </tr>
          <tr class="border-b-2 border-l-2 border-[#D9821C] h-9">
            <td
              class="text-center border-r-2 border-[#D9821C] bg-slate-200 font-bold"
            >
              구분
            </td>
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">설비고장</td>
          </tr>
          <tr class="border-b-2 border-[#D9821C] h-9">
            <td
              class="text-center border-l-2 border-r-2 border-[#D9821C] bg-slate-200 font-bold"
            >
              비가동명
            </td>
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">고장수리</td>
          </tr>
          <tr class="border-b-2 border-[#D9821C] h-9">
            <td
              class="text-center border-l-2 border-r-2 border-[#D9821C] bg-slate-200 font-bold"
            >
              내용
            </td>
            <td class="pl-2 border-r-2 border-[#D9821C] text-left">
              설비 고장 수리중
            </td>
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
