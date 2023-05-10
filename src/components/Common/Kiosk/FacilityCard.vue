<script setup lang="ts">
import Lucide from "../../../base-components/Lucide";
import LoadingIcon from "../../../base-components/LoadingIcon";

const props = defineProps<{
  name?: string;
  running?: boolean;
  product?: string;
  worker?: string;
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
      <div class="p-4 box h-44 bg-gray-600" v-if="running == false">
        <div class="p-1 text-3xl bg-gray-400">
          <strong>{{ props.name }}</strong>
        </div>
        <div class="flex text-3xl mt-9">
          <div class="flex m-auto items-center text-slate-200">
            <div><strong>미가동</strong></div>
          </div>
        </div>
      </div>

      <div class="p-4 box h-44 bg-cyan-500" v-if="running == true">
        <div class="p-1 text-3xl bg-slate-200">
          <strong>{{ props.name }}</strong>
        </div>
        <div class="flex text-2xl mt-2">
          <div class="flex m-auto items-center">
            <div><strong>가동중</strong></div>
          </div>
        </div>

        <div class="flex text-xl mt-2 text-slate-200">
          <div class="flex m-auto items-center">
            <div>
              <strong>{{ props.product }}</strong>
            </div>
          </div>
        </div>
        <div class="flex text-xl mt-2">
          <div class="flex m-auto items-center">
            <div>
              <strong>{{ props.worker }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
