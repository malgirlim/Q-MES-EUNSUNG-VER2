<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, watch } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { FormSelect } from "../../../base-components/Form";
import dayjs from "dayjs";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import { KioskWork } from "../../../interfaces/menu/kioskInterface";
import { MasterUser } from "../../../interfaces/menu/masterInterface";

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
  await kiosk_modal_user.loadDatas(); // 작업자 불러오기
  await kiosk_modal_work.searchDatas("", "NO", props.키오스크no, "", ""); // 작업현황 불러오기

  workerupdateData.value.NO = props.키오스크no;
  workerupdateData.value.작업자ID =
    kiosk_modal_work.dataSearchAll.value[0].작업자ID[0];
});

const r1 = ref(1);

// 고장발생
const url_kiosk_worker_change = "/api/kiosk/workerchange";
const kiosk_worker_change = useSendApi<KioskWork>(
  url_kiosk_worker_change,
  r1,
  r1
);

// 키오스크 작업 현황 데이터 가져오기
const url_kiosk_modal_work = "/api/kiosk/modal/kioskwork";
const kiosk_modal_work = useSendApi<KioskWork>(url_kiosk_modal_work, r1, r1);

// 작업자 데이터 가져오기
const url_kiosk_modal_user = "/api/kiosk/modal/user";
const kiosk_modal_user = useSendApi<MasterUser>(url_kiosk_modal_user, r1, r1);

// ##########################  등록  ##########################
const workerupdateData = ref({} as KioskWork);
</script>

######################################################################################################################
######################################################################################################################
######################################################################################################################

<template>
  <div class="pb-7">
    <div class="pl-7 pr-7 mt-2 text-2xl">
      <table class="w-full">
        <tbody>
          <tr class="border-t-2 border-l-2 border-b-2 border-primary h-20">
            <td
              class="text-center border-r-2 border-primary bg-slate-200 font-bold w-48"
            >
              현재 작업자
            </td>
            <td class="pl-6 border-r-2 border-primary text-left">
              {{ kiosk_modal_work.dataSearchAll.value[0]?.작업자[0] ?? "" }}
            </td>
          </tr>

          <tr class="border-b-2 border-primary h-20">
            <td
              class="text-center border-l-2 border-r-2 border-primary bg-slate-200 font-bold"
            >
              변경 작업자
            </td>
            <td class="pl-2 pr-2 border-r-2 border-primary text-left">
              <FormSelect
                class="w-full"
                formSelectSize="xxl"
                v-model="workerupdateData.작업자ID"
              >
                <option
                  v-for="todo in kiosk_modal_user.dataSearchAll.value.filter(
                    (u) => u.부서명 == '생산'
                  )"
                  :key="todo.아이디"
                  :value="todo.아이디"
                >
                  {{ todo.이름 }}
                </option>
              </FormSelect>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-5 px-5 pb-8 text-center">
      <Button
        variant="primary"
        type="button"
        @click="
          async () => {
            await kiosk_worker_change.editData(workerupdateData);
            emit(`update:modalclose`, false);
          }
        "
        class="w-48 text-2xl mr-10"
      >
        변경
      </Button>
      <Button
        variant="outline-primary"
        type="button"
        class="w-48 text-2xl"
        @click="emit(`update:modalclose`, false)"
      >
        취소
      </Button>
    </div>
  </div>
</template>
