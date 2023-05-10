<script setup lang="ts">
import Lucide from "../../../base-components/Lucide";
import Tippy from "../../../base-components/Tippy";

const props = defineProps<{
  name?: string;
  run?: boolean;
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
    <div :class="[
      'p-4 box',
      {'bg-cyan-300' : props?.run == true},
      {'bg-red-300' : props?.run == false},
      ]"
      >
        <div class="flex">
          <Lucide icon="Factory" class="w-[28px] h-[28px] text-primary" />
          <div class="ml-auto">
            <Tippy
              as="div"
              :class="[
                'cursor-pointer py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium',
                { 'bg-success': props?.run == true },
                { 'bg-danger': props?.run == false },
              ]"
              :content="
                props?.run == true
                  ? '장비가 가동중입니다.'
                  : '장비가 비가동중입니다.'
              "
              :key="String(props?.run)"
            >
              <div v-if="props?.run == true" class="mr-1">ON</div>
              <div v-if="props?.run == false" class="mr-1">OFF</div>
            </Tippy>
          </div>
        </div>
        <div class="mt-1 text-2xl font-bold">
          {{ props.name }}
        </div>
        <div v-if="props?.run == true" class="mt-0 text-base">
          가동중
        </div>
        <div v-if="props?.run == false" class="mt-0 text-base">
          비가동중
        </div>
       
      </div>
    </div>
  </div>
</template>
