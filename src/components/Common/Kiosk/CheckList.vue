<script setup lang="ts">
import { ref } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { FormSelect } from "../../../base-components/Form";

const radioSelect: any = ref([]);
</script>
<template>
  <div class="p-7">
    <div
      class="text-2xl"
      style="height: 560px; overflow-y: visible; overflow-x: hidden"
    >
      <table class="w-full">
        <thead
          class="border-b-2 border-success bg-slate-200 h-20"
          style="position: sticky; top: 0px; z-index: 2"
        >
          <th class="border-t-2 border-l-2 border-r-2 border-success w-1/12">
            순서
          </th>
          <th class="border-t-2 border-r-2 border-success w-7/12">점검항목</th>
          <th class="border-t-2 border-r-2 border-success w-4/12">점검결과</th>
        </thead>
        <tbody>
          <tr class="text-center" v-for="(i, index) in Array(15).fill('10')">
            <td class="border-l-2 border-b-2 border-r-2 border-success h-20">
              1
            </td>
            <td
              class="text-left pl-2 border-b-2 border-r-2 border-success h-20"
            >
              제품 표면 확인
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              <div class="flex">
                <div class="flex m-auto items-center">
                  <label class="cursor-pointer">
                    <div class="flex items-center mr-10">
                      <div>
                        <input
                          class="mr-2 mb-1 w-6 h-6 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                          :name="'result' + index"
                          @click="radioSelect[index] = false"
                          type="radio"
                        />
                      </div>
                      <div>예</div>
                    </div></label
                  >
                  <label class="cursor-pointer">
                    <div class="flex items-center">
                      <div>
                        <input
                          class="mr-2 mb-1 w-6 h-6 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                          :name="'result' + index"
                          @click="radioSelect[index] = true"
                          type="radio"
                        />
                      </div>
                      <div>아니오</div>
                    </div></label
                  >
                  <div class="ml-5">
                    <FormSelect
                      class="w-64"
                      formSelectSize="xxl"
                      model-value="미입력"
                      :disabled="!radioSelect[index]"
                    >
                      <option>미입력</option>
                      <option>기준치 초과</option>
                      <option>기준치 미달</option>
                      <option>외관 불량</option>
                      <option>기능 불량</option>
                    </FormSelect>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
