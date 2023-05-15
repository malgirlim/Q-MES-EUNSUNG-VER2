<script setup lang="ts">
import Lucide from "../../../base-components/Lucide";
import LoadingIcon from "../../../base-components/LoadingIcon";

const props = defineProps<{
  name?: string;
  running?: string;
  product?: string;
  worker?: string;
  time?: string;
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
      <div class="p-4 box h-44 bg-gray-600" v-if="running == '미가동'">
        <div class="p-1 text-3xl bg-gray-400">
          <strong>{{ props.name }}</strong>
        </div>
        <div class="flex text-3xl mt-9">
          <div class="flex m-auto items-center text-slate-200">
            <div><strong>미가동</strong></div>
          </div>
        </div>
      </div>

      <div class="p-4 box h-44 bg-lime-500" v-if="running == '가동중'">
        <div class="p-1 text-3xl bg-slate-200">
          <strong>{{ props.name }}</strong>
        </div>
        <div class="flex text-2xl mt-2">
          <div class="flex m-auto">
            <img
              class="h-7 mr-1 mb-0.5"
              src="../../../assets/images/running_gear.gif"
            />
            <strong>가동중</strong>
          </div>
        </div>

        <div class="flex text-xl mt-2">
          <div class="flex m-auto items-center">
            <div>
              <strong>{{ props.product }}</strong>
            </div>
          </div>
        </div>
        <div class="flex text-xl mt-2">
          <div class="flex m-auto items-center text-white">
            <div>
              <strong>{{ props.time }} - {{ props.worker }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 box h-44 bg-orange-500" v-if="running == '비가동'">
        <div class="p-1 text-3xl bg-slate-200">
          <strong>{{ props.name }}</strong>
        </div>
        <div class="flex text-2xl mt-2">
          <div class="flex m-auto">
            <img
              class="h-7 mr-1 mb-0.5"
              src="../../../assets/images/standby_gear.png"
            />
            <strong>비가동</strong>
          </div>
        </div>

        <div class="flex text-xl mt-2">
          <div class="flex m-auto items-center">
            <div>
              <strong>{{ props.product }}</strong>
            </div>
          </div>
        </div>
        <div class="flex text-xl mt-2">
          <div class="flex m-auto items-center text-white">
            <div>
              <strong>{{ props.time }} - {{ props.worker }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
