<script setup lang="ts">
import { computed } from "vue";
import { ChartData, ChartOptions } from "chart.js/auto";
import { useColorSchemeStore } from "../../stores/color-scheme";
import { useDarkModeStore } from "../../stores/dark-mode";
import Chart from "../../base-components/Chart";
import { getColor } from "../../utils/colors";

const props = defineProps<{
  width?: number;
  height?: number;
}>();

const colorScheme = computed(() => useColorSchemeStore().colorScheme);
const darkMode = computed(() => useDarkModeStore().darkMode);

const chartData = [65, 25, 10];
const chartColors = () => [
  getColor("warning", 0.9),
  getColor("danger", 0.9),
  getColor("primary", 0.9),
];
const data = computed<ChartData>(() => {
  return {
    labels: ["오염", "박리", "파손"],
    datasets: [
      {
        data: chartData,
        backgroundColor: colorScheme.value ? chartColors() : "",
        hoverBackgroundColor: colorScheme.value ? chartColors() : "",
        borderWidth: 5,
        borderColor: darkMode.value
          ? getColor("darkmode.700")
          : getColor("white"),
      },
    ],
  };
});

const options = computed<ChartOptions>(() => {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: getColor("slate.500", 0.8),
        },
      },
      datalabels: {
        formatter: function (value: any, context: any) {
          var idx = context.dataIndex;

          // 출력 텍스트
          //return context.chart.data.labels[idx] + value + "%";
          return value + "%";
        },
        align: "end",
        offset: 0,
        font: {
          // font 설정
          weight: "bold",
          size: "14px",
        },
        color: "#FFF",
      },
    },
  };
});
</script>

<template>
  <Chart
    type="pie"
    :width="props.width"
    :height="props.height"
    :data="data"
    :options="options"
  />
</template>
