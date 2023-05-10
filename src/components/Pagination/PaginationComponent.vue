<script lang="ts">
export default {};
</script>

<template>
  <div class="pagination-container" aria-label="row pagination">
    <ul v-if="numberOfPages >= 1" class="pagination">
      <li
        class="page-item"
        aria-label="go to previous page"
        @click="previousEnd()"
        :class="{
          disabled: currentPage === 1,
        }"
      >
        <span class="page-link"
          ><Lucide icon="ChevronsLeft" class="w-4 h-4"
        /></span>
      </li>
      <li
        class="page-item"
        aria-label="go to previous page"
        @click="previous()"
        :class="{
          disabled: currentPage === 1,
        }"
      >
        <span class="page-link"
          ><Lucide icon="ChevronLeft" class="w-4 h-4"
        /></span>
      </li>
      <li
        v-for="index in currentPageList()"
        :key="index"
        :aria-label="'go to page ' + index"
        class="page-item"
        @click="setCurrentPage(index)"
      >
        <div
          class="page-link"
          :class="{
            'active-page': currentPage === index,
          }"
        >
          {{ index }}
        </div>
      </li>
      <li
        class="page-item"
        :class="{
          disabled: currentPage === numberOfPages || !numberOfPages,
        }"
        aria-label="go to next page"
        @click="next()"
      >
        <div class="page-link">
          <Lucide icon="ChevronRight" class="w-4 h-4" />
        </div>
      </li>
      <li
        class="page-item"
        :class="{
          disabled: currentPage === numberOfPages || !numberOfPages,
        }"
        aria-label="go to next page"
        @click="nextEnd()"
      >
        <div class="page-link">
          <Lucide icon="ChevronsRight" class="w-4 h-4" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import Lucide from "../../base-components/Lucide";
import { toRefs } from "vue";

const props = defineProps({
  numberOfPages: {
    required: true,
    type: Number,
  },
  modelValue: {
    required: true,
    type: Number,
  },
});

const { numberOfPages, modelValue: currentPage } = toRefs(props);

const currentPageList = () => {
  var list = [];
  var min = currentPage.value - 2 < 1 ? 1 : currentPage.value - 2;
  var max =
    currentPage.value + 2 >= numberOfPages.value
      ? numberOfPages.value
      : currentPage.value + 2;
  for (var i = min; i <= max; i += 1) list.push(i);
  return list;
};

const emit = defineEmits(["update:modelValue"]);

const setCurrentPage = (number: Number) => {
  emit("update:modelValue", number);
};

const previous = () => {
  if (currentPage.value === 1) return;
  emit("update:modelValue", currentPage.value - 1);
};

const next = () => {
  if (currentPage.value >= numberOfPages.value) return;
  emit("update:modelValue", currentPage.value + 1);
};

const previousEnd = () => {
  if (currentPage.value === 1) return;
  emit("update:modelValue", 1);
};

const nextEnd = () => {
  if (currentPage.value >= numberOfPages.value) return;
  emit("update:modelValue", numberOfPages.value);
};
</script>

<style scoped lang="scss">
.pagination-container {
  display: inline-block;
}

.pagination {
  background: none;
  margin: 0px;
  padding: 0px;
  display: flex;
  gap: 5px;
  align-items: center;
  border: none;
  box-sizing: border-box;
  overflow: hidden;
  word-wrap: break-word;
  align-content: center;
  border-radius: 14px;
}

.page-item {
  display: flex;
  cursor: pointer;
  margin: 0 8px 0 8px;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}

.page-link {
  color: #666b85;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 0;
  &:hover {
    color: #333333;
    background-color: #e9e9e9;
    border: none;
  }
}

.active-page {
  background-color: white !important;
  color: black !important;
  &:hover {
    border: none;
  }
}

.disabled {
  .page-link {
    background-color: none;
  }
  cursor: not-allowed;
}
</style>
