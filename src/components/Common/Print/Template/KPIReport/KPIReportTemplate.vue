<script setup lang="ts">
import KPI_OEE_Chart_bar_line from "../../../Monitoring/KPI_OEE_Chart_bar_line.vue";
import Test from "../../../Main/KPICard.vue";
import dayjs from "dayjs";
dayjs.locale("ko");

const props = defineProps<{
  modelValue?: any;
}>();

const now = dayjs().format("YYYY-MM-DD(dd) HH:mm:ss");
</script>
<template>
  <div
    style="display: flex; align-items: center; justify-content: space-between"
  >
    <div>{{ now }}</div>
    <div>KPI 보고서출력</div>
  </div>
  <div
    style="
      margin-top: 50px;
      margin-bottom: 30px;
      text-align: center;
      font-size: larger;
    "
  >
    <strong>KPI 설비 종합효율</strong>
  </div>
  <div>
    <KPI_OEE_Chart_bar_line
      :x_label="[
        '1월',
        '2월',
        '3월',
        '4월',
        '5월',
        '6월',
        '7월',
        '8월',
        '9월',
        '10월',
        '11월',
        '12월',
      ]"
      :dataset1_label="'OEE'"
      :dataset1_data="Object.values(props.modelValue.월별_OEE)"
      :dataset1_type="'line'"
      :dataset2_label="'목표'"
      :dataset2_data="Object.values(props.modelValue.월별_목표)"
      :dataset2_type="'line'"
      :title_text="props.modelValue.selectYear + '년'"
      :height="300"
    />
  </div>
  <div style="margin-top: 30px">
    <div>□평균 측정치</div>
    <table style="width: 100%; border-collapse: collapse">
      <tbody>
        <tr style="text-align: center">
          <td style="width: 14%; border: 1px solid black">가동효율</td>
          <td style="width: 14%; border: 1px solid black">품질효율</td>
          <td style="width: 14%; border: 1px solid black">성능효율</td>
          <td style="width: 14%; border: 1px solid black">목표</td>
          <td style="width: 14%; border: 1px solid black">OEE</td>
          <td style="width: 20%; border: 1px solid black">목표대비달성률</td>
        </tr>
        <tr style="text-align: right">
          <td style="border: 1px solid black; padding-right: 5px">
            {{
              Number(
                props.modelValue.월별_데이터.reduce(
                  (sum, data) => Number(sum) + Number(data.가동효율),
                  0
                ) / props.modelValue.월별_데이터.length
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })
            }}%
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{
              Number(
                props.modelValue.월별_데이터.reduce(
                  (sum, data) => Number(sum) + Number(data.품질효율),
                  0
                ) / props.modelValue.월별_데이터.length
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })
            }}%
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{
              Number(
                props.modelValue.월별_데이터.reduce(
                  (sum, data) => Number(sum) + Number(data.성능효율),
                  0
                ) / props.modelValue.월별_데이터.length
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })
            }}%
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{
              Number(
                props.modelValue.월별_데이터.reduce(
                  (sum, data) => Number(sum) + Number(data.목표),
                  0
                ) / props.modelValue.월별_데이터.length
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })
            }}%
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{
              Number(
                props.modelValue.월별_데이터.reduce(
                  (sum, data) => Number(sum) + Number(data.OEE),
                  0
                ) / props.modelValue.월별_데이터.length
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })
            }}%
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{
              Number(
                (props.modelValue.월별_데이터.reduce(
                  (sum, data) =>
                    Number(sum) + Number(data.OEE) / Number(data.목표),
                  0
                ) /
                  props.modelValue.월별_데이터.length) *
                  100
              ).toLocaleString(undefined, { maximumFractionDigits: 2 })
            }}%
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div style="margin-top: 30px">
    <div>□측정치 데이터</div>
    <table style="width: 100%; text-align: center; border-collapse: collapse">
      <tbody>
        <tr style="text-align: center">
          <td style="width: 14%; border: 1px solid black">년월</td>
          <td style="width: 14%; border: 1px solid black">가동효율(%)</td>
          <td style="width: 14%; border: 1px solid black">품질효율(%)</td>
          <td style="width: 14%; border: 1px solid black">성능효율(%)</td>
          <td style="width: 14%; border: 1px solid black">OEE(%)</td>
          <td style="width: 20%; border: 1px solid black">목표(%)</td>
        </tr>
        <tr style="text-align: right" v-for="i in props.modelValue.월별_데이터">
          <td style="border: 1px solid black; padding-right: 5px">
            {{ i.년월 }}
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{ i.가동효율 }}
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{ i.품질효율 }}
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{ i.성능효율 }}
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{ i.OEE }}
          </td>
          <td style="border: 1px solid black; padding-right: 5px">
            {{ i.목표 }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
