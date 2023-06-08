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
    labels: [
      "1일",
      "2일",
      "3일",
      "4일",
      "5일",
      "6일",
      "7일",
      "8일",
      "9일",
      "10일",
      "11일",
      "12일",
      "13일",
      "14일",
      "15일",
    ],
    datasets: [
      {
        label: "목표액",
        data: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
        type: "line",
        datalabels: { display: false },
        pointStyle: false,
        order: 1,
      },
      {
        label: "재고금액",
        data: [5, 2, 6, 4.4, 4.9, 5, 4.8, 6, 7.5, 7.5, 12, 8, 8.3, 6, 6.5],
        type: "line",
        datalabels: {
          color: "black",
          anchor: "end",
          font: { size: 15 },
          align: "end",
          offset: -5,
        },
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
        ticks: {
          font: {
            size: 15,
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 15,
          },
          callback: function (value: any) {
            return value.toLocaleString() + "백만원";
          },
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "2022년 5월",
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
