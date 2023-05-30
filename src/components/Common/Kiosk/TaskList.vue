<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import { ProductionTaskCurrent } from "../../../interfaces/menu/productionInterface";
import { KioskWork } from "../../../interfaces/menu/kioskInterface";

// 데이터 가져오기
const props = defineProps<{
  키오스크no?: any;
  설비명?: any;
}>();

// 데이터 내보내기
const output = ref();
const emit = defineEmits(["update:output", "update:modalclose"]);
emit(`update:output`, output.value); // 실제로 내보낼 때 쓰는 코드

// 페이지 로딩 시 시작
onMounted(async () => {
  dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
});

// dataManager 만들기
const url = "/api/kiosk/worklist";
const dataManager = useSendApi<ProductionTaskCurrent>(url, ref(1), ref(100));

// 키오스크 작업관리 데이터
let kiosk_work: KioskWork;
</script>
<template>
  <div class="p-7">
    <div
      class="text-2xl"
      style="height: 650px; overflow-y: visible; overflow-x: hidden"
    >
      <table class="w-full">
        <thead
          class="border-b-2 border-success bg-slate-200 h-20"
          style="position: sticky; top: 0px; z-index: 2"
        >
          <th class="border-t-2 border-l-2 border-r-2 border-success w-8">
            <Lucide class="w-8 h-8 mx-auto" icon="Star" />
          </th>
          <th class="border-t-2 border-r-2 border-success w-24">작업코드</th>
          <th class="border-t-2 border-r-2 border-success w-24">공정명</th>
          <th class="border-t-2 border-r-2 border-success w-20">작업자</th>
          <th class="border-t-2 border-r-2 border-success w-28">품번</th>
          <th class="border-t-2 border-r-2 border-success w-16">구분</th>
          <th class="border-t-2 border-r-2 border-success w-64">품명</th>
          <th class="border-t-2 border-r-2 border-success w-32">규격</th>
          <th class="border-t-2 border-r-2 border-success w-36">작업상태</th>
          <th class="border-t-2 border-r-2 border-success w-20">선택</th>
        </thead>
        <tbody>
          <tr
            class="text-center"
            v-for="(data, index) in dataManager.dataAll.value.filter(
              (c) => c.설비명 == props.설비명 || c.진행상황 != '작업완료'
            )"
            :key="data.NO"
          >
            <td class="border-l-2 border-b-2 border-r-2 border-success h-20">
              {{ index + 1 }}
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              {{ data.작업코드 }}
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              {{ data.공정명 }}
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              {{ data.작업자 }}
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              {{ data.품번 }}
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              {{ data.품목구분 }}
            </td>

            <td class="border-b-2 border-r-2 border-success h-20">
              {{ data.품명 }}
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              {{ data.규격 }}
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              <div
                :class="[
                  { 'text-gray-500': data.진행상황 == '작업보류' },
                  { 'text-danger': data.진행상황 == '작업반려' },
                  { 'text-black': data.진행상황 == '작업미확인' },
                  { 'text-orange-500': data.진행상황 == '작업대기' },
                  { 'text-success': data.진행상황 == '작업중' },
                  // { 'text-danger': data.진행상황 == '작업대기' },
                  // { 'text-indigo-500': data.진행상황 == '작업중' },
                ]"
              >
                {{ data.진행상황 }}
              </div>
              <div class="text-xl">
                ({{ data.생산양품수량 }}/{{ data.지시수량 }}{{ data.단위 }})
              </div>
            </td>
            <td class="border-b-2 border-r-2 border-success h-20">
              <div
                v-if="
                  data.진행상황 == '작업미확인' || data.진행상황 == '작업대기'
                "
              >
                <Button
                  variant="primary"
                  @click="
                    () => {
                      // kiosk_work.NO = props.;
                      // kiosk_work.지시공정NO = data.NO;
                      // kiosk_work.현황 = data.진행상황;
                      dataManager.insertData({
                        NO: props.키오스크no,
                        지시공정NO: data.NO,
                        현황: data.진행상황,
                      });
                      emit(`update:modalclose`, false);
                    }
                  "
                  ><Lucide class="w-8 h-8 mx-auto" icon="CheckSquare" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
