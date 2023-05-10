<script setup lang="ts">
import Lucide from "../../../base-components/Lucide";
import Tippy from "../../../base-components/Tippy";
</script>

<template>
  <div class="col-span-1 sm:col-span-1 xl:col-span-1 intro-y">
    <div>
      <div class="p-4 box bg-light">
        <div class="flex" style="visibility: hidden">
          <Lucide icon="Factory" class="w-[28px] h-[28px] text-primary" />
          <div class="ml-auto">
            <Tippy
              as="div"
              class="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
              content="전월 대비 2% 상승"
            >
              2%
              <Lucide icon="ChevronUp" class="w-4 h-4 ml-0.5" />
            </Tippy>
          </div>
        </div>
        <div class="mt-1 text-xl font-medium" style="visibility: hidden">
          TEST
        </div>
        <div class="mt-1 text-base">
          <div class="text-md text-slate-500" style="visibility: hidden">
            TEST (TEST)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
