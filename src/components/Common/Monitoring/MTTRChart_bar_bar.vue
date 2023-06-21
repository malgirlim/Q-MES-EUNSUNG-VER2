<script setup lang="ts">
import { computed } from "vue";
import { ChartData, ChartOptions } from "chart.js/auto";
import { Line } from "vue-chartjs";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js/auto";
import { dropRight } from "lodash";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  ChartDataLabels,
  LinearScale
);

const props = defineProps<{
  x_label?: any;
  y_scale?: any;
  dataset1_label?: any;
  dataset1_data?: any;
  dataset2_label?: any;
  dataset2_data?: any;
  title_text?: any;
}>();

const chartData = computed<ChartData>(() => {
  return {
    labels: props.x_label ?? [
      "검사기",
      "제판기",
      "인쇄1호기",
      "인쇄2호기",
      "인쇄3호기",
      "인쇄4호기",
      "인쇄5호기",
      "인쇄6호기",
      "인쇄7호기",
      "인쇄8호기",
    ],
    datasets: [
      {
        label: props.dataset2_label ?? "목표시간",
        data: props.dataset2_data ?? [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        maxBarThickness: 100,
        datalabels: { display: false },
        type: "bar",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        order: 1,
      },
      {
        label: props.dataset1_label ?? "측정시간",
        maxBarThickness: 60,
        data: props.dataset1_data ?? [3, 7, 6, 5, 12, 8, 6, 8, 7, 6],
        type: "bar",
        datalabels: {
          color: "black",
          anchor: "end",
          font: { size: 15 },
          align: "end",
          offset: -5,
        },
        backgroundColor: "rgba(255, 99, 132, 1)",

        order: 0,
      },
    ],
  };
});

const chartOptions = computed<ChartOptions>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 15,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 15,
          },
          callback: function (value: any) {
            return value + (props.y_scale ?? "hr");
          },
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: props.title_text ?? "2023년",
        font: { size: 15 },
        padding: { bottom: 5, top: 5 },
      },
      legend: {
        align: "center",
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
  };
});
</script>

<template>
  <Line id="my-chart-id" :options="chartOptions" :data="chartData" />
</template>
