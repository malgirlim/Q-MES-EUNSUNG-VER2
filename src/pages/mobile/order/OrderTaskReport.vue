<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, Ref } from "vue";
import _ from "lodash";
import { FormLabel } from "../../../base-components/Form";

import Lucide from "../../../base-components/Lucide";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Dialog } from "../../../base-components/Headless";

import dayjs from "dayjs";
import { toast } from "vue3-toastify";

import axios from "axios";
import router from "../../../router";

import FacilityCard from "../../../components/Common/Mobile/Order/FacilityCard.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.MobileOrderTaskReport; //권한레벨

onMounted(async () => {
  setTimeout(() => {
    menu_fix.value = ".";
  }, 500);
});

// 메뉴재정렬 (메뉴 레이아웃 밀리는 문제 해결 코드)
const menu_fix = ref();
</script>

<template>
  <div v-if="user_level >= 2">
    <div class="pl-2 pr-2 pt-8">
      <div
        class="p-3 mb-5 mx-3 font-bold border-2 border-[#3a437c] text-center text-2xl rounded-md bg-white intro-y"
      >
        실적 집계 대상 설비 선택
      </div>

      <div class="p-3 mt-5 mb-5 text-center intro-y">
        <div class="grid grid-cols-2 gap-6">
          <FacilityCard
            name="인쇄기1"
            running="가동중"
            product="제품1"
            worker="박명한"
            @click="$router.push('/mobile/order/task-report/facility1')"
          />
          <FacilityCard
            name="인쇄기2"
            running="가동중"
            product="제품2"
            worker="고범석"
            @click="$router.push('/mobile/order/task-report/facility2')"
          />
        </div>
        <div class="grid grid-cols-2 gap-6 mt-5">
          <FacilityCard
            name="인쇄기3"
            running="비가동"
            product="제품3"
            worker="윤호상"
            @click="$router.push('/mobile/order/task-report/facility3')"
          />
          <FacilityCard
            name="인쇄기4"
            running="가동중"
            product="제품4"
            worker="강민철"
            @click="$router.push('/mobile/order/task-report/facility4')"
          />
        </div>
        <div class="grid grid-cols-2 gap-6 mt-5">
          <FacilityCard
            name="인쇄기5"
            running="미가동"
            product="제품5"
            worker="김주현"
            @click="$router.push('/mobile/order/task-report/facility5')"
          />
          <FacilityCard
            name="인쇄기6"
            running="가동중"
            product="제품6"
            worker="송은아"
            @click="$router.push('/mobile/order/task-report/facility6')"
          />
        </div>
        <div class="grid grid-cols-2 gap-6 mt-5">
          <FacilityCard
            name="인쇄기7"
            running="가동중"
            product="제품7"
            worker="사은미"
            @click="$router.push('/mobile/order/task-report/facility7')"
          />
          <FacilityCard
            name="인쇄기8"
            running="비가동"
            product="제품8"
            worker="이훈노"
            @click="$router.push('/mobile/order/task-report/facility8')"
          />
        </div>
        <div class="grid grid-cols-2 gap-6 mt-5">
          <FacilityCard
            name="검사기"
            running="가동중"
            product="제품9"
            worker="최순우"
            @click="$router.push('/mobile/order/task-report/facility9')"
          />
          <FacilityCard
            name="제판기"
            running="미가동"
            product="제품10"
            worker="손정일"
            @click="$router.push('/mobile/order/task-report/facility10')"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- BEGIN : 권한 경고 -->
  <div class="intro-y" v-if="user_level < 2">
    <div class="mt-20 items-center text-center">
      <div>
        <Lucide icon="AlertTriangle" class="w-20 h-20 mx-auto text-warning" />
      </div>
      <div class="mt-3 text-2xl">ACCESS DENIED</div>
    </div>
    <div class="mt-5 text-center">액세스 권한이 없습니다.</div>
    <div class="mt-2 text-center">
      IT 관리자에게 연락하여 액세스 권한을 요청하세요.
    </div>
  </div>
  <!-- END : 권한 없을 때 -->
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mr-10" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved{{ menu_fix }}</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->
</template>
