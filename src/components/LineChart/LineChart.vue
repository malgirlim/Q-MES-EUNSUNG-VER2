<script setup lang="ts">
import { computed } from "vue";
import { ChartData, ChartOptions } from "chart.js/auto";
import { useColorSchemeStore } from "../../stores/color-scheme";
import { useDarkModeStore } from "../../stores/dark-mode";
import Chart from "../../base-components/Chart";
import { getColor } from "../../utils/colors";
import { randomNumbers } from "../../utils/helper";

const props = defineProps<{
  width?: number;
  height?: number;
  lineColor?: string;
}>();

const colorScheme = computed(() => useColorSchemeStore().colorScheme);
const darkMode = computed(() => useDarkModeStore().darkMode);

const data = computed<ChartData>(() => {
  return {
    labels: ["1월", "2월", "3월"],
    datasets: [
      {
        label: "인쇄기1",
        data: [86, 75, 95],
        borderWidth: 2,
        borderColor: colorScheme.value ? getColor("primary") : "",
        backgroundColor: "transparent",
        pointBorderColor: "transparent",
        tension: 0.4,
      },
      {
        label: "인쇄기2",
        data: [75, 90, 83],
        borderWidth: 2,
        borderColor: colorScheme.value ? getColor("success") : "",
        backgroundColor: "transparent",
        pointBorderColor: "transparent",
        tension: 0.4,
      },
      {
        label: "인쇄기3",
        data: [83, 85, 95],
        borderWidth: 2,
        borderColor: colorScheme.value ? getColor("warning") : "",
        backgroundColor: "transparent",
        pointBorderColor: "transparent",
        tension: 0.4,
      },
      {
        label: "인쇄기4",
        data: [70, 80, 90],
        borderWidth: 2,
        borderColor: colorScheme.value ? getColor("danger") : "",
        backgroundColor: "transparent",
        pointBorderColor: "transparent",
        tension: 0.4,
      },
      {
        label: "인쇄기5",
        data: [90, 87, 80],
        borderWidth: 2,
        borderColor: colorScheme.value ? getColor("dark") : "",
        backgroundColor: "transparent",
        pointBorderColor: "transparent",
        tension: 0.4,
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
        align: "top",
        offset: 0,
        font: {
          weight: "bold",
          size: "0px",
        },
        color: "#000",
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
          display: true,
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
          text: "가동률",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: getColor("slate.500", 0.8),
          callback: function (value) {
            return value + "%";
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
    type="line"
    :width="props.width"
    :height="props.height"
    :data="data"
    :options="options"
  />
</template>
