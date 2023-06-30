<script setup lang="ts">
import { getCurrentInstance } from "vue";
import { toast } from "vue3-toastify";
import Lucide from "../../base-components/Lucide";
import OrderFacilityParts from "../../components/Common/Order/OrderFacilityParts.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.OrderFacilityParts; //권한레벨

const companyInfo = {
  사업자등록번호: "126-81-10319",
  상호: "(주)큐이노텍",
  대표자: "차준은",
  주소: "경기도 이천시 이섭대천로1032번길 78 (율현동 91-1)",
  업태: "제조",
  종목: "옵셋인쇄",
};
</script>

<template>
  <div v-if="user_level >= 3">
    <div class="bg-white mt-10 mb-10 border-4 pl-10 pr-10 pt-10 pb-10">
      <div class="text-2xl text-center mb-5 intro-y">
        <strong>설비부품 발주등록</strong>
      </div>
      <div><OrderFacilityParts :data="companyInfo" /></div>
    </div>
  </div>
  <!-- BEGIN : 권한 경고 -->
  <div class="intro-y" v-if="user_level < 3">
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
  <div class="intro-y mt-5 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->
</template>
