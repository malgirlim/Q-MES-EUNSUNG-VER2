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
    <div class="pl-7 pr-7 mt-2 text-2xl">
      <table class="w-full">
        <tbody>
          <tr class="border-t-2 border-l-2 border-b-2 border-primary h-20">
            <td
              class="text-center border-r-2 border-primary bg-slate-200 font-bold w-48"
            >
              현재 작업자
            </td>
            <td class="pl-6 border-r-2 border-primary text-left">박명한</td>
          </tr>

          <tr class="border-b-2 border-primary h-20">
            <td
              class="text-center border-l-2 border-r-2 border-primary bg-slate-200 font-bold"
            >
              변경 작업자
            </td>
            <td class="pl-2 pr-2 border-r-2 border-primary text-left">
              <FormSelect
                class="w-full"
                formSelectSize="xxl"
                model-value="강민철"
              >
                <option>강민철</option>
                <option>고범석</option>
                <option>김주현</option>
                <option>박명한</option>
                <option>사은미</option>
                <option>손정일</option>
                <option>송은아</option>
                <option>윤호상</option>
                <option>이훈노</option>
                <option>최순우</option>
              </FormSelect>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
