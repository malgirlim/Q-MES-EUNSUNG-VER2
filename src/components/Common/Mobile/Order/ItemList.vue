<script setup lang="ts">
import { ref } from "vue";
import Button from "../../../../base-components/Button";
import Lucide from "../../../../base-components/Lucide";
import { FormSelect, FormInput } from "../../../../base-components/Form";
</script>

<template>
  <div class="p-5">
    <div
      class="text-md"
      style="height: 535px; overflow-y: visible; overflow-x: hidden"
    >
      <div v-for="(i, index) in Array(15).fill('10')">
        <table class="w-full">
          <tbody class="border-2 border-success text-center">
            <tr>
              <td
                class="font-bold border-r-2 border-b-2 border-success bg-slate-200 h-8"
              >
                순서
              </td>
              <td
                class="font-bold border-b-2 border-success bg-slate-200"
                colspan="2"
              >
                작업코드
              </td>
            </tr>
            <tr>
              <td class="border-r-2 border-b-2 border-success h-8">1</td>
              <td class="border-b-2 border-success" colspan="2">
                TAS0022112202
              </td>
            </tr>
            <tr>
              <td
                class="font-bold border-r-2 border-b-2 border-success bg-slate-200 h-8"
              >
                품번
              </td>
              <td
                class="font-bold border-b-2 border-success bg-slate-200"
                colspan="2"
              >
                품명
              </td>
            </tr>
            <tr>
              <td class="border-r-2 border-b-2 border-success h-8">
                2074-G901-1
              </td>
              <td colspan="2">
                <div class="text-center">POWER TERMINAL PRE-MOLD</div>
              </td>
            </tr>
            <tr>
              <td
                class="font-bold border-r-2 border-b-2 border-success bg-slate-200 h-8 w-1/3"
              >
                공정명
              </td>
              <td
                class="font-bold border-t-2 border-r-2 border-b-2 border-success bg-slate-200 w-1/3"
              >
                작업자
              </td>
              <td
                class="font-bold border-t-2 border-r-2 border-b-2 border-success bg-slate-200 w-1/3"
              >
                진행상태
              </td>
            </tr>
            <tr>
              <td class="border-r-2 border-success h-8">℃</td>
              <td class="border-r-2 border-success">100</td>
              <td class="border-r-2 border-success">200</td>
            </tr>
            <tr>
              <td colspan="3" class="p-2 border-t-2 border-success h-8">
                <Button variant="primary" class="p-1 w-32">선택</Button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="mt-7"></div>
      </div>
    </div>
  </div>
</template>
