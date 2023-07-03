<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, watch } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import { Dialog } from "../../../base-components/Headless";
import dayjs from "dayjs";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import { KioskNonwork } from "../../../interfaces/menu/kioskInterface";

// 데이터 가져오기
const props = defineProps<{
  키오스크no?: any;
  설비명?: any;
}>();

// 페이지 로딩 시 시작
onMounted(async () => {
  await kiosk_nonwork.searchDatas("", "작업NO", props.키오스크no, "", ""); // 작업현황 불러오기
});

const r1 = ref(1);

// 비가동발생
const url_kiosk_nonwork = "/api/kiosk/nonwork";
const kiosk_nonwork = useSendApi<KioskNonwork>(url_kiosk_nonwork, r1, r1);

/* 비가동 내역 삭제 Modal */
const deleteCheck = ref(false);
const deleteData = ref();
const setDeleteCheck = (value: boolean) => {
  kiosk_nonwork.searchDatas("", "작업NO", props.키오스크no, "", "");
  deleteCheck.value = value;
};
</script>

######################################################################################################################
######################################################################################################################
######################################################################################################################

<template>
  <div class="p-3">
    <div
      class="pl-7 pr-3 text-sm"
      style="
        width: 850px;
        height: 350px;
        overflow-y: scroll;
        overflow-x: hidden;
      "
    >
      <table class="w-full">
        <thead
          class="border-b-2 border-[#D9821C] bg-slate-200 h-8"
          style="position: sticky; top: 0px; z-index: 2"
        >
          <th class="border-l-2 border-t-2 border-r-2 border-[#D9821C] w-28">
            시작일시
          </th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-28">종료일시</th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-20">코드</th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-20">구분</th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-24">비가동명</th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-30">내용</th>
          <th class="border-t-2 border-r-2 border-[#D9821C] w-20">삭제</th>
        </thead>
        <tbody>
          <tr
            class="text-center"
            v-for="todo in kiosk_nonwork.dataSearchAll.value"
            :key="todo.NO"
          >
            <td class="border-l-2 border-b-2 border-r-2 border-[#D9821C] h-9">
              {{ todo.시작일시 }}
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
              {{ todo.종료일시 }}
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
              {{ todo.비가동코드 }}
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
              {{ todo.구분 }}
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
              {{ todo.비가동명 }}
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
              {{ todo.내용 }}
            </td>
            <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
              <Button
                class="h-7 w-16"
                variant="danger"
                @click="
                  () => {
                    deleteData = todo.NO;
                    setDeleteCheck(true);
                  }
                "
              >
                <Lucide class="w-5 h-5 mx-auto" icon="Trash2" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- BEGIN: 비가동내역삭제 확인 Modal -->
  <Dialog :open="deleteCheck" size="lg" @close="setDeleteCheck(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-24 h-24 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl"><strong>비가동 내역 삭제</strong></div>
        <div class="mt-3 text-2xl">정말 삭제하시겠습니까?</div>
        <div class="mt-2 text-2xl">삭제하시면 복구가 되지 않습니다.</div>
      </div>

      <div class="mt-5 px-5 pb-8 text-center">
        <Button
          variant="danger"
          type="button"
          @click="
            async () => {
              await kiosk_nonwork.deleteData([deleteData]);
              setDeleteCheck(false);
            }
          "
          class="w-48 text-2xl mr-10"
        >
          삭제
        </Button>
        <Button
          variant="outline-primary"
          type="button"
          class="w-48 text-2xl"
          @click="setDeleteCheck(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 비가동내역삭제 확인 Modal -->
</template>
