<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, watch } from "vue";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import dayjs from "dayjs";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import { KioskWork, KioskItem } from "../../../interfaces/menu/kioskInterface";
import { StockProcess } from "../../../interfaces/menu/stockInterface";

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
  await kiosk_item.searchDatas("", "작업NO", props.키오스크no, "", ""); // 키오스크 투입자재 데이터 불러오기
  await kiosk_modal_work.searchDatas("", "NO", props.키오스크no, "", ""); // 작업현황 불러오기
  // await kiosk_modal_itemprocessstock.searchDatas("", "전체", "", "", ""); // 재공 데이터 불러오기
  await kiosk_modal_itemprocessstock.loadDatas(); // 재공 데이터 불러오기

  itemInsertData.value.작업NO = props.키오스크no;
});

// ########  등록  ########
const itemInsertData = ref({} as KioskItem);

const r1 = ref(1);

// 키오스크 투입자재
const url_kiosk_item = "/api/kiosk/item";
const kiosk_item = useSendApi<KioskItem>(url_kiosk_item, r1, r1);

// 키오스크 작업 현황 데이터 가져오기
const url_kiosk_modal_work = "/api/kiosk/modal/kioskwork";
const kiosk_modal_work = useSendApi<KioskWork>(url_kiosk_modal_work, r1, r1);

// LOT별품목 재공현황 데이터 가져오기
const url_kiosk_modal_itemprocessstock = "/api/kiosk/modal/itemprocessstock";
const kiosk_modal_itemprocessstock = useSendApi<StockProcess>(
  url_kiosk_modal_itemprocessstock,
  r1,
  r1
);

// ###################################################  키패드  ###################################################
// 키패드
const num = ref("0");
const num_show = ref("0");

let num_split = [];
let num_dot = ".";

const insert_num = (numpad_value: any) => {
  if (num.value == "0") num.value = "" + numpad_value;
  else if (num.value.length < 7) num.value += numpad_value;
};

const insert_dot = () => {
  const dot_count = num.value.split(".").length - 1;
  if (dot_count < 1 && num.value.length < 7) num.value += ".";
};

const delete_num = () => {
  if (num.value.length > 1) num.value = num.value.slice(0, -1);
  else num.value = "0";
};

const init_num = () => {
  num.value = "0";
};

watch([num], (newValue, oldValue) => {
  num_split = num.value.split(".");
  if (num_split[1] == undefined) {
    num_split[1] = "";
    num_dot = "";
  } else num_dot = ".";
  num_show.value = Number(num_split[0]).toLocaleString();
  if (num_split[1] != undefined || num_split[1] != "")
    num_show.value += num_dot;
  num_show.value += num_split[1];
});
</script>

<template>
  <div class="p-3">
    <div class="grid grid-cols-10 gap-2 text-lg">
      <div class="col-span-7">
        <div>
          <div
            class="text-base mx-auto h-8 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
            style="width: 570px"
          >
            <strong>투입자재 선택</strong>
          </div>
          <div
            class="pl-7 pr-3 text-sm"
            style="height: 210px; overflow-y: scroll; overflow-x: hidden"
          >
            <table class="w-full">
              <thead
                class="border-b-2 border-[#D9821C] bg-slate-200 h-8"
                style="position: sticky; top: 0px; z-index: 2"
              >
                <th
                  class="border-l-2 border-t-2 border-r-2 border-[#D9821C] w-20"
                >
                  작업코드
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  LOT코드
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-10">
                  품목구분
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  품명
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  규격
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-10">
                  단위
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-10">
                  재공수
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  선택
                </th>
              </thead>
              <tbody>
                <tr
                  class="text-center"
                  v-for="todo in kiosk_modal_itemprocessstock.dataSearchAll
                    .value"
                  :key="todo.LOT코드"
                >
                  <td
                    class="break-all border-l-2 border-b-2 border-r-2 border-[#D9821C] h-16"
                  >
                    {{ todo.작업코드 }}
                  </td>
                  <td
                    class="break-all border-b-2 border-r-2 border-[#D9821C] h-9"
                  >
                    {{ todo.LOT코드 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    {{ todo.품목구분 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    {{ todo.품명 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    {{ todo.규격 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    {{ todo.단위 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    {{ todo.재공수 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-9">
                    <Button
                      class="h-7 w-16"
                      variant="primary"
                      @click="
                        async () => {
                          itemInsertData.작업NO = props.키오스크no;
                          itemInsertData.품목NO = todo.품목NO ?? 0;
                          itemInsertData.LOT코드 = todo.LOT코드 ?? '';
                          itemInsertData.수량 = '0';
                          await kiosk_item.insertData(itemInsertData);
                          await kiosk_item.searchDatas(
                            '',
                            '작업NO',
                            props.키오스크no,
                            '',
                            ''
                          );
                        }
                      "
                    >
                      <Lucide class="w-5 h-5 mx-auto" icon="CheckSquare" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="flex p-2">
          <div class="flex m-auto">
            <div><Lucide class="w-5 h-5 mr-1" icon="ChevronsDown" /></div>
            <div><Lucide class="w-5 h-5 mr-1" icon="ChevronsDown" /></div>
            <div><Lucide class="w-5 h-5" icon="ChevronsDown" /></div>
          </div>
        </div>
        <div>
          <div
            class="text-base mx-auto h-8 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
            style="width: 570px"
          >
            <strong>투입자재 등록 목록</strong>
          </div>
          <div
            class="pl-7 pr-3 text-sm"
            style="height: 210px; overflow-y: scroll; overflow-x: hidden"
          >
            <table class="w-full">
              <thead
                class="border-b-2 border-[#D9821C] bg-slate-200 h-8"
                style="position: sticky; top: 0px; z-index: 2"
              >
                <th
                  class="border-l-2 border-t-2 border-r-2 border-[#D9821C] w-20"
                >
                  LOT코드
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-10">
                  품목구분
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  품명
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  규격
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-10">
                  단위
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-10">
                  수량
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  수량수정
                </th>
                <th class="border-t-2 border-r-2 border-[#D9821C] w-20">
                  삭제
                </th>
              </thead>
              <tbody>
                <tr
                  class="text-center"
                  v-for="todo in kiosk_item.dataSearchAll.value"
                  :key="todo.NO"
                >
                  <td
                    class="break-all border-l-2 border-b-2 border-r-2 border-[#D9821C] h-16"
                  >
                    {{ todo.LOT코드 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    {{ todo.품목구분 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    {{ todo.품명 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    {{ todo.규격 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    {{ todo.단위 }}
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    <div class="mx-auto p-2 w-20 border-2 border-slate-200">
                      {{ todo.수량 }}
                    </div>
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    <Button
                      class="h-7 w-16"
                      variant="pending"
                      @click="
                        async () => {
                          itemInsertData = todo;
                          itemInsertData.수량 = num;
                          await kiosk_item.editData(itemInsertData);
                          await kiosk_item.searchDatas(
                            '',
                            '작업NO',
                            props.키오스크no,
                            '',
                            ''
                          );
                        }
                      "
                    >
                      <Lucide class="w-5 h-5 mx-auto" icon="Edit" />
                    </Button>
                  </td>
                  <td class="border-b-2 border-r-2 border-[#D9821C] h-8">
                    <Button
                      class="h-7 w-16"
                      variant="danger"
                      @click="
                        async () => {
                          await kiosk_item.deleteData([todo.NO]);
                          await kiosk_item.searchDatas(
                            '',
                            '작업NO',
                            props.키오스크no,
                            '',
                            ''
                          );
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
      </div>
      <div class="col-span-3">
        <div>
          <div class="text-sm">
            <table class="w-full">
              <thead>
                <tr
                  class="border-t-2 border-l-2 border-b-2 border-[#D9821C] h-8"
                >
                  <th
                    class="text-center border-r-2 border-[#D9821C] bg-slate-200 font-bold w-40"
                  >
                    수량 수정
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="text-2xl text-center border-b-2 border-l-2 border-r-2 border-[#D9821C] h-8"
                >
                  <td class="" style="height: 142px">{{ num_show }}</td>
                </tr>

                <tr
                  class="text-center border-b-2 border-l-2 border-r-2 border-[#D9821C] h-8"
                >
                  <td class="p-5">
                    <Button
                      class="w-32 h-6 text-lg"
                      variant="pending"
                      @click="init_num()"
                      >초기화</Button
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div
          class="text-base mt-9 h-8 py-1 border-l-2 border-r-2 border-t-2 border-[#D9821C] bg-slate-200 text-xl text-center"
        >
          <strong>수량 입력</strong>
        </div>
        <div class="h-8 border-2 border-[#D9821C]" style="height: 210px">
          <div class="grid grid-cols-3 mt-4">
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('1')"
                >1</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('2')"
                >2</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('3')"
                >3</Button
              >
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('4')"
                >4</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('5')"
                >5</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('6')"
                >6</Button
              >
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('7')"
                >7</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('8')"
                >8</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('9')"
                >9</Button
              >
            </div>
          </div>
          <div class="grid grid-cols-3 mt-1">
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_dot()">.</Button>
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="insert_num('0')"
                >0</Button
              >
            </div>
            <div class="cols-span-1 text-center">
              <Button class="p-1 w-20 text-2xl" @click="delete_num()"
                ><Lucide icon="Delete" class="w-8 h-8 mx-auto text-info"
              /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="px-5 pb-3 text-center mt-3">
      <!-- <Button
          variant="primary"
          type="button"
          @click="
            () => {
              setItemAddModal(false);
            }
          "
          class="w-40 py-1 text-base mr-10"
        >
          확인
        </Button> -->
      <Button
        variant="outline-primary"
        type="button"
        class="w-40 py-1 text-base"
        @click="emit(`update:modalclose`, false)"
      >
        닫기
      </Button>
    </div>
  </div>
</template>
