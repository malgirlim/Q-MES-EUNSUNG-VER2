<script setup lang="ts">
import { ref, onMounted } from "vue";
import Button from "../../../../base-components/Button";
import Lucide from "../../../../base-components/Lucide";
import { FormSelect, FormInput } from "../../../../base-components/Form";

const radioSelect: any = ref([]);
</script>

<template>
  <div class="p-5">
    <div
      class="text-md"
      style="height: 480px; overflow-y: visible; overflow-x: hidden"
    >
      <div v-for="(i, index) in Array(15).fill('10')">
        <table class="w-full">
          <tbody class="border-2 border-primary text-center">
            <tr>
              <td
                class="font-bold border-r-2 border-b-2 border-primary bg-slate-200 h-8"
              >
                순서
              </td>
              <td
                class="font-bold border-b-2 border-primary bg-slate-200"
                colspan="4"
              >
                점검항목
              </td>
            </tr>
            <tr>
              <td class="border-r-2 border-b-2 border-primary h-8">1</td>
              <td class="border-b-2 border-primary" colspan="4">
                <div>불잘끄기</div>
                <div>정말로</div>
              </td>
            </tr>
            <tr>
              <td
                class="font-bold border-r-2 border-b-2 border-primary bg-slate-200 h-8"
                colspan="3"
              >
                판정기준
              </td>
              <td class="font-bold border-b-2 border-primary bg-slate-200">
                점검결과
              </td>
            </tr>
            <tr>
              <td class="border-r-2 border-b-2 border-primary h-8" colspan="3">
                불이꺼짐
              </td>
              <td rowspan="3">
                <div v-if="false">
                  <!--설비점검-->
                  <div class="text-left ml-4">
                    <label class="cursor-pointer"
                      ><div class="flex items-center mb-3">
                        <input
                          class="mr-2 mb-1 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                          :name="'result' + index"
                          @click="radioSelect[index] = false"
                          type="radio"
                        />
                        <div class="text-success">양호</div>
                      </div></label
                    >
                    <label class="cursor-pointer"
                      ><div class="flex items-center mb-3">
                        <input
                          class="mr-2 mb-1 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                          :name="'result' + index"
                          @click="radioSelect[index] = false"
                          type="radio"
                        />
                        <div class="text-pending">점검필요</div>
                      </div></label
                    >
                    <label class="cursor-pointer"
                      ><div class="flex items-center">
                        <input
                          class="mr-2 mb-1 transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                          :name="'result' + index"
                          @click="radioSelect[index] = false"
                          type="radio"
                        />
                        <div class="text-danger">불량</div>
                      </div></label
                    >
                  </div>
                </div>

                <div v-if="true">
                  <!--수치점검-->
                  <div class="text-center">
                    <div class="my-3">
                      <FormInput
                        class="text-center px-0 w-24"
                        type="text"
                        placeholder="수치입력"
                      />
                    </div>
                    <!-- <div><label class="text-success mr-1">●</label>적합</div>
                    <div><label class="text-danger mr-1">●</label>부적합</div> -->
                    <div><label class="mr-1">●</label>미점검</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td
                class="font-bold border-r-2 border-b-2 border-primary bg-slate-200 h-8"
              >
                단위
              </td>
              <td
                class="font-bold border-r-2 border-b-2 border-primary bg-slate-200"
              >
                최소
              </td>
              <td
                class="font-bold border-r-2 border-b-2 border-primary bg-slate-200"
              >
                최대
              </td>
            </tr>
            <tr>
              <td class="border-r-2 border-primary h-8">℃</td>
              <td class="border-r-2 border-primary">100</td>
              <td class="border-r-2 border-primary">200</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-5"></div>
      </div>
    </div>
  </div>
</template>
