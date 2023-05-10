<script setup lang="ts">
import Lucide from "../../../base-components/Lucide";
import Tippy from "../../../base-components/Tippy";

const props = defineProps<{
  data?: string;
  name?: string;
  name2?: string;
}>();
</script>

<template>
  <div class="col-span-1 sm:col-span-1 xl:col-span-1 intro-y">
    <div
      :class="[
        'relative zoom-in',
        'before:content-[\'\'] before:w-[90%] before:shadow-[0px_3px_20px_#0000000b] before:bg-slate-50 before:h-full before:mt-3 before:absolute before:rounded-md before:mx-auto before:inset-x-0 before:dark:bg-darkmode-400/70',
      ]"
    >
      <div class="p-4 box">
        <div class="flex">
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
        <div class="mt-1 text-xl font-medium">
          {{ props.data }}
        </div>
        <div class="mt-1 text-base">
          <div class="text-md text-slate-500">
            {{ props.name }} ({{ props.name2 }})
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
