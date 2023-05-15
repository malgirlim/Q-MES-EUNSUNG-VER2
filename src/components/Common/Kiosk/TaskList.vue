<script setup lang="ts">
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";

// 임시 작업지시 데이터

const task_status = "생산대기";
const task_status_tmp = "생산중";
const task_qty_current = "0";
const task_qty = "10,000";
const task_qty_std = "개";
</script>
<template>
  <div class="p-7">
    <div
      class="text-2xl"
      style="height: 650px; overflow-y: visible; overflow-x: hidden"
    >
      <table class="w-full">
        <thead
          class="border-b-2 border-success bg-slate-200 h-20"
          style="position: sticky; top: 0px; z-index: 2"
        >
          <th class="border-t-2 border-l-2 border-r-2 border-success w-8">
            <Lucide class="w-8 h-8 mx-auto" icon="Star" />
          </th>
          <th class="border-t-2 border-r-2 border-success w-24">작업코드</th>
          <th class="border-t-2 border-r-2 border-success w-24">공정명</th>
          <th class="border-t-2 border-r-2 border-success w-20">작업자</th>
          <th class="border-t-2 border-r-2 border-success w-28">품번</th>
          <th class="border-t-2 border-r-2 border-success w-16">구분</th>
          <th class="border-t-2 border-r-2 border-success w-64">품명</th>
          <th class="border-t-2 border-r-2 border-success w-32">규격</th>
          <th class="border-t-2 border-r-2 border-success w-36">작업상태</th>
          <th class="border-t-2 border-r-2 border-success w-20">선택</th>
        </thead>
        <tbody>
          <tr class="text-center">
            <td class="border-l-2 border-b-2 border-r-2 border-success h-20">
              1
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              TAS0022112202
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">인쇄2공정</td>
            <td class="border-b-2 border-r-2 border-success h-20">박명한</td>
            <td class="border-b-2 border-r-2 border-success h-20">
              2074-G901-1
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">반제품</td>

            <td class="border-b-2 border-r-2 border-success h-20">
              POWER TERMINAL PRE-MOLD
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">A2 E-EGR</td>
            <td class="border-b-2 border-r-2 border-success h-20">
              <div
                :class="[
                  { 'text-danger': task_status_tmp == '생산대기' },
                  { 'text-indigo-500': task_status_tmp == '생산중' },
                ]"
              >
                {{ task_status_tmp }}
              </div>
              <div class="text-xl">
                ({{ task_qty_current }}/{{ task_qty }}{{ task_qty_std }})
              </div>
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              <div v-if="task_status_tmp == '생산대기'">
                <Button variant="primary"
                  ><Lucide class="w-8 h-8 mx-auto" icon="CheckSquare"
                /></Button>
              </div>
            </td>
          </tr>
          <tr class="text-center" v-for="i in Array(10).fill('10')">
            <td class="border-l-2 border-b-2 border-r-2 border-success h-20">
              1
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              TAS0022112202
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">인쇄2공정</td>
            <td class="border-b-2 border-r-2 border-success h-20">박명한</td>
            <td class="border-b-2 border-r-2 border-success h-20">
              2074-G901-1
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">반제품</td>

            <td class="border-b-2 border-r-2 border-success h-20">
              POWER TERMINAL PRE-MOLD
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">A2 E-EGR</td>
            <td class="border-b-2 border-r-2 border-success h-20">
              <div
                :class="[
                  { 'text-danger': task_status == '생산대기' },
                  { 'text-indigo-500': task_status == '생산중' },
                ]"
              >
                {{ task_status }}
              </div>
              <div class="text-xl">
                ({{ task_qty_current }}/{{ task_qty }}{{ task_qty_std }})
              </div>
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              <div v-if="task_status == '생산대기'">
                <Button variant="primary"
                  ><Lucide class="w-8 h-8 mx-auto" icon="CheckSquare"
                /></Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
