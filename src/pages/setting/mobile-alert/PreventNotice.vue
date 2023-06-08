<script setup lang="ts">
import Lucide from "../../../base-components/Lucide";
import MobileAlertSelect from "../../../components/Common/Setting/MobileAlertSelect.vue";
</script>
<template>
  <div class="mt-5 mb-3 text-xl font-bold">
    <div class="flex items-center">
      <Lucide class="h-5 w-5 mb-0.5 mr-1" icon="BellPlus" /> 모바일 알림설정
    </div>
  </div>
  <div><MobileAlertSelect 예방보전통보_variant="primary" /></div>
</template>
