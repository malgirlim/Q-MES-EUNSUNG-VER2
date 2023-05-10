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

const data = computed<ChartData>(() => {
  return {
    labels: ["1월", "2월", "3월"],
    datasets: [
      {
        label: "인쇄기1",
        barPercentage: 0.5,
        barThickness: 20,
        maxBarThickness: 20,
        minBarLength: 2,
        data: [50, 60, 40],
        backgroundColor: colorScheme.value ? getColor("primary") : "",
      },
      {
        label: "인쇄기2",
        barPercentage: 0.5,
        barThickness: 20,
        maxBarThickness: 20,
        minBarLength: 2,
        data: [43, 57, 54],
        backgroundColor: colorScheme.value ? getColor("success") : "",
      },
      {
        label: "인쇄기3",
        barPercentage: 0.5,
        barThickness: 20,
        maxBarThickness: 20,
        minBarLength: 2,
        data: [50, 20, 37],
        backgroundColor: colorScheme.value ? getColor("warning") : "",
      },
      {
        label: "인쇄기4",
        barPercentage: 0.5,
        barThickness: 20,
        maxBarThickness: 20,
        minBarLength: 2,
        data: [60, 70, 40],
        backgroundColor: colorScheme.value ? getColor("danger") : "",
      },
      {
        label: "인쇄기5",
        barPercentage: 0.5,
        barThickness: 20,
        maxBarThickness: 20,
        minBarLength: 2,
        data: [50, 30, 60],
        backgroundColor: colorScheme.value ? getColor("dark") : "",
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
          var idx = context.dataIndex; // 각 데이터 인덱스
          // 출력 텍스트
          //return context.chart.data.labels[idx] + value + "%";
          return value;
        },
        align: "center",
        offset: 0,
        font: {
          weight: "bold",
          size: "13px",
        },
        color: "#FFF",
      },
    },
    scales: {
      x: {
        title: {
          font: {
            family: "굴림",
            size: 13,
          },
          color: "black",
          display: true,
          text: "월(분기)",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: getColor("slate.500", 0.8),
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
      y: {
        title: {
          font: {
            family: "굴림",
            size: 13,
          },
          color: "black",
          display: true,
          text: "수량",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: getColor("slate.500", 0.8),
          callback: function (value) {
            return value + "개";
          },
        },
        grid: {
          color: darkMode.value
            ? getColor("slate.500", 0.3)
            : getColor("slate.300"),
          borderDash: [2, 2],
          drawBorder: false,
        },
      },
    },
  };
});
</script>

<template>
  <Chart
    type="bar"
    :width="props.width"
    :height="props.height"
    :data="data"
    :options="options"
  />
</template>
