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
  <div><MobileAlertSelect 수주대비납품예보_variant="primary" /></div>

  <div class="mt-5 grid grid-cols-2 gap-1">
    <div class="col-span-1 border-r-2 border-slate-200" style="height: 530px">
      이것
    </div>
    <div class="col-span-1">저것</div>
  </div>
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mt-3 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->
</template>
