<script setup lang="ts">
import TaskInsert from "../../components/Common/Production/TaskInsert.vue";
import { getCurrentInstance } from "vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.ProductionTaskAddInsert; //권한레벨
</script>

<template>
  <div v-if="user_level >= 3">
    <div class="bg-white mt-10 mb-10 border-4 pl-10 pr-10 pt-10 pb-10">
      <div class="text-2xl text-center mb-5 intro-y">
        <strong>작업지시 등록</strong>
      </div>
      <div><TaskInsert /></div>
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
</template>
