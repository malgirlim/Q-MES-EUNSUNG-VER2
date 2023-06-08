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
} from "chart.js";
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
    labels: props.x_label,
    datasets: [
      {
        label: "목표효율",
        data: [90, 85, 90, 80, 85, 90, 95, 80, 85, 80],
        maxBarThickness: 100,
        datalabels: { display: false },
        type: "bar",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        order: 1,
      },
      {
        label: "측정효율",
        maxBarThickness: 60,
        data: [85, 89, 82, 91, 95, 82, 79, 83, 91, 80],
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
            return value + "%";
          },
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "2023년",
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
