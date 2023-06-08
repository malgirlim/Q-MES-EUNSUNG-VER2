<script setup lang="ts">
import Button from "../../../base-components/Button";

const props = defineProps<{
  수주대비납품예보_variant?: string;
  수주대비납품통보_variant?: string;
  예방보전예보_variant?: string;
  예방보전통보_variant?: string;
  설비고장발생통보_variant?: string;
  일상점검확인통보_variant?: string;
  설비수리통보_variant?: string;
  설비수리예보_variant?: string;
  설비부품교체시기통보_variant?: string;
}>();
</script>
<template>
  <div class="text-center text-md">
    <div class="text-lg font-bold mb-3">설정메뉴 선택</div>
    <Button
      @click="$router.push('/setting/mobile-alert/order-forecast')"
      :variant="props.수주대비납품예보_variant ?? 'outline-primary'"
      class="mr-5"
      >수주대비납품 예보</Button
    >
    <Button
      @click="$router.push('/setting/mobile-alert/order-notify')"
      :variant="props.수주대비납품통보_variant ?? 'outline-primary'"
      class="mr-5"
      >수주대비납품 통보</Button
    >
    <Button
      @click="$router.push('/setting/mobile-alert/prevent-forecast')"
      :variant="props.예방보전예보_variant ?? 'outline-primary'"
      class="mr-5"
      >예방보전 예보</Button
    >
    <Button
      @click="$router.push('/setting/mobile-alert/prevent-notice')"
      :variant="props.예방보전통보_variant ?? 'outline-primary'"
      class="mr-5"
      >예방보전 통보</Button
    >
    <Button
      @click="$router.push('/setting/mobile-alert/prevent-error-notify')"
      :variant="props.설비고장발생통보_variant ?? 'outline-primary'"
      class="mr-5"
      >설비고장발생 통보</Button
    >
    <Button
      @click="$router.push('/setting/mobile-alert/prevent-daily-notify')"
      :variant="props.일상점검확인통보_variant ?? 'outline-primary'"
      class="mr-5"
      >일상점검 확인통보</Button
    >
    <Button
      @click="$router.push('/setting/mobile-alert/prevent-repair-forecast')"
      :variant="props.설비수리예보_variant ?? 'outline-primary'"
      class="mr-5"
      >설비수리 예보</Button
    >
    <Button
      @click="$router.push('/setting/mobile-alert/prevent-repair-notify')"
      :variant="props.설비수리통보_variant ?? 'outline-primary'"
      class="mr-5"
      >설비수리 통보</Button
    >
    <Button
      @click="$router.push('/setting/mobile-alert/prevent-change-notify')"
      :variant="props.설비부품교체시기통보_variant ?? 'outline-primary'"
      class=""
      >설비부품교체시기 통보</Button
    >
  </div>
  <hr class="text-slate-200 mt-5 mb-1" style="border: solid 1px" />
</template>
