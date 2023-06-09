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
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    datasets: [
      {
        label: props.dataset1_label ?? "재고비용",
        maxBarThickness: 60,
        data: props.dataset1_data ?? [
          20, 30, 55, 40, 60, 47, 46, 40, 75, 65, 35, 75,
        ],
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
      {
        label: props.dataset2_label ?? "목표비용",
        data: props.dataset2_data ?? [
          50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50,
        ],
        datalabels: { display: false },
        type: "line",
        pointStyle: false,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 1)",
        order: 1,
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
            return value + (props.y_scale ?? "백만원");
          },
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: props.dataset1_label ?? "2023년",
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
