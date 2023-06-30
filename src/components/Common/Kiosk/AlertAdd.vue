<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, watch } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { FormSelect } from "../../../base-components/Form";
import dayjs from "dayjs";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import {
  KioskWork,
  KioskNonwork,
} from "../../../interfaces/menu/kioskInterface";
import { MasterNonWork } from "../../../interfaces/menu/masterInterface";

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
  await kiosk_alert.editData({ NO: props.키오스크no } as KioskNonwork); // 고장발생 등록
  await kiosk_modal_work.searchDatas("", "NO", props.키오스크no, "", ""); // 작업현황 불러오기
  await kiosk_modal_nonwork.searchDatas("", "구분", "고장", "", ""); // 비가동 데이터 불러오기

  // 고장 시작일시를 따로 받기
  alertInsertData.value.시작일시 =
    kiosk_modal_work.dataSearchAll.value[0].등록일시;

  // 고장 시작일시로부터 현재 시간의 차이 계산
  setInterval(() => {
    경과시간.value = dayjs.duration(
      dayjs().diff(alertInsertData.value.시작일시)
    );
  }, 1000);
});

const r1 = ref(1);

// 고장발생
const url_kiosk_alert = "/api/kiosk/alert";
const kiosk_alert = useSendApi<KioskNonwork>(url_kiosk_alert, r1, r1);

// 키오스크 작업 현황 데이터 가져오기
const url_kiosk_modal_work = "/api/kiosk/modal/work";
const kiosk_modal_work = useSendApi<KioskWork>(url_kiosk_modal_work, r1, r1);

// 비가동 데이터 가져오기
const url_kiosk_modal_nonwork = "/api/kiosk/modal/nonwork";
const kiosk_modal_nonwork = useSendApi<MasterNonWork>(
  url_kiosk_modal_nonwork,
  r1,
  r1
);

// ##########################  등록  ##########################
const alertInsertData = ref({} as KioskNonwork);

// ##########################  조회  ##########################
const 경과시간 = ref();
</script>

######################################################################################################################
######################################################################################################################
######################################################################################################################

<template>
  <div class="pb-2">
    <div
      class="pl-7 pr-3 text-base"
      style="height: 150px; overflow-y: scroll; overflow-x: hidden"
    >
      <table class="w-full">
        <thead
          class="border-b-2 border-danger bg-slate-200 h-7"
          style="position: sticky; top: 0px; z-index: 2"
        >
          <th class="border-l-2 border-t-2 border-r-2 border-danger w-24">
            코드
          </th>
          <th class="border-t-2 border-r-2 border-danger w-24">구분</th>
          <th class="border-t-2 border-r-2 border-danger w-20">비가동명</th>
          <th class="border-t-2 border-r-2 border-danger w-28">내용</th>
          <th class="border-t-2 border-r-2 border-danger w-20">선택</th>
        </thead>
        <tbody>
          <tr
            class="text-center"
            v-for="todo in kiosk_modal_nonwork.dataSearchAll.value"
            :key="todo.NO"
          >
            <td class="border-l-2 border-b-2 border-r-2 border-danger h-9">
              {{ todo.코드 }}
            </td>
            <td class="border-b-2 border-r-2 border-danger h-7">
              {{ todo.구분 }}
            </td>
            <td class="border-b-2 border-r-2 border-danger h-7">
              {{ todo.비가동명 }}
            </td>
            <td class="border-b-2 border-r-2 border-danger h-7">
              {{ todo.내용 }}
            </td>
            <td class="border-b-2 border-r-2 border-danger h-7">
              <Button class="h-7" variant="primary"
                ><Lucide class="w-6 h-6 mx-auto" icon="CheckSquare"
              /></Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pl-7 pr-7 mt-3 text-base">
      <div>
        <table class="w-full">
          <tbody>
            <tr class="border-t-2 border-l-2 border-b-2 border-danger h-7">
              <td
                class="text-center border-r-2 border-danger bg-slate-200 font-bold w-40"
              >
                조치내역
              </td>
              <td class="p-2 border-r-2 border-danger text-center">
                <FormSelect class="w-full" v-model="alertInsertData.조치내역">
                  <option>미입력</option>
                  <option>수리 접수</option>
                  <option>수리 진행중</option>
                  <option>수리 완료</option>
                </FormSelect>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="pl-7 pr-7 mt-3 text-base">
      <table class="w-full">
        <tbody>
          <tr class="border-t-2 border-l-2 border-b-2 border-danger h-7">
            <td
              class="text-center border-r-2 border-danger bg-slate-200 font-bold w-40"
            >
              코드
            </td>
            <td class="pl-2 border-r-2 border-danger text-left">
              {{ alertInsertData.비가동코드 }}
            </td>
          </tr>
          <tr class="border-b-2 border-l-2 border-danger h-7">
            <td
              class="text-center border-r-2 border-danger bg-slate-200 font-bold"
            >
              구분
            </td>
            <td class="pl-2 border-r-2 border-danger text-left">
              {{ alertInsertData.구분 }}
            </td>
          </tr>
          <tr class="border-b-2 border-danger h-7">
            <td
              class="text-center border-l-2 border-r-2 border-danger bg-slate-200 font-bold"
            >
              비가동명
            </td>
            <td class="pl-2 border-r-2 border-danger text-left">
              {{ alertInsertData.비가동명 }}
            </td>
          </tr>
          <tr class="border-b-2 border-danger h-7">
            <td
              class="text-center border-l-2 border-r-2 border-danger bg-slate-200 font-bold"
            >
              내용
            </td>
            <td class="pl-2 border-r-2 border-danger text-left">
              {{ alertInsertData.내용 }}
            </td>
          </tr>
          <tr class="border-b-2 border-danger h-7">
            <td
              class="text-center border-l-2 border-r-2 border-danger bg-slate-200 font-bold"
            >
              시작일시
            </td>
            <td class="pl-2 border-r-2 border-danger text-left">
              {{ alertInsertData.시작일시 }}
            </td>
          </tr>
          <tr class="border-b-2 border-danger h-7">
            <td
              class="text-center border-l-2 border-r-2 border-danger bg-slate-200 font-bold"
            >
              경과시간
            </td>
            <td class="pl-2 border-r-2 border-danger text-left">
              {{ 경과시간.hours() }}h {{ 경과시간.minutes() }}m
              {{ 경과시간.seconds() }}s
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="px-5 pb-2 text-center">
      <Button
        variant="primary"
        type="button"
        class="w-48 text-base"
        @click="
          () => {
            emit(`update:modalclose`, false);
          }
        "
      >
        설비재개
      </Button>
    </div>
  </div>
</template>
