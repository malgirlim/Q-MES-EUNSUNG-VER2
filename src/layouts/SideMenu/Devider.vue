<script setup lang="ts">
import _ from "lodash";
import { withDefaults } from "vue";

interface DeviderProps {
  as?: string | object;
}

const { as } = withDefaults(defineProps<DeviderProps>(), {
  as: "div",
});
</script>

<template>
  <component
    :is="as"
    class="w-full h-px bg-white/[0.08] z-10 relative dark:bg-white/[0.07]"
  >
    <slot></slot>
  </component>
</template>
