<script setup lang="ts">
import Lucide from "../../../base-components/Lucide";
import Tippy from "../../../base-components/Tippy";
</script>

<template>
  <div class="col-span-1 sm:col-span-1 xl:col-span-1 intro-y">
    <div>
      <div class="p-1 box bg-light">
        <div class="flex" style="visibility: hidden">
          <Lucide icon="Factory" class="w-[28px] h-[28px] text-primary" />
          <div class="ml-auto">
            <Tippy
              as="div"
              class="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
              content="장비가 가동중입니다."
            >
              <div class="mr-1">ON</div>
            </Tippy>
          </div>
        </div>
        <div
          class="mt-6 text-2xl font-medium leading-8"
          style="visibility: hidden"
        >
          가동중
        </div>
        <div class="mt-1 text-base text-slate-500" style="visibility: hidden">
          설비X 가동현황
        </div>
      </div>
    </div>
  </div>
</template>
