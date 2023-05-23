<script setup lang="ts">
import { ref, Ref, onMounted, watch, getCurrentInstance } from "vue";
import router from "../../router";
import Button from "../../base-components/Button";
import { FormInput, FormSelect, FormCheck } from "../../base-components/Form";
import Lucide from "../../base-components/Lucide";
import { Dialog, Menu } from "../../base-components/Headless";
import Table from "../../base-components/Table";
import dayjs from "dayjs";
import Litepicker from "../../base-components/Litepicker";
import TomSelect from "tom-select";
import { Tab } from "../../base-components/Headless";
import * as XLSX from "xlsx";
import { read, utils, writeFileXLSX } from "xlsx";
import printJS from "print-js";
import PaginationComponent from "../../components/Pagination/PaginationComponent.vue"; // 페이징설정
import { toast } from "vue3-toastify";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../composables/useSendApi";
import {
  StockStock,
  StockStockLOT,
} from "../../interfaces/menu/stockInterface";

// 컴포넌트 로드
import Detail from "../../components/Common/Detail/StockReceiveRawDetail.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.StockMonitorHalf; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
  stock_stockLot.loadDatas(); // LOT별 품목재고현황 불러오기
});

// 페이징기능
const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst = () => {
  currentPage.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// dataManager 만들기
const url = "/api/stock/stock/half";
const dataManager = useSendApi<StockStock>(url, currentPage, rowsPerPage);

// 테이블항목 설정 및 가로크기 조정
const table_setting = {
  체크박스: { name: "체크박스", style: "width: 50px" },
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목2: { name: "품번", style: "width: 50px; text-align: center;" },
  항목3: { name: "품명", style: "width: 50px; text-align: center;" },
  항목4: { name: "규격", style: "width: 50px; text-align: center;" },
  항목5: { name: "단위", style: "width: 50px; text-align: center;" },
  항목6: { name: "기초재공재고", style: "width: 5px; text-align: center;" },
  항목7: { name: "기초재고", style: "width: 5px; text-align: center;" },
  항목8: { name: "입고", style: "width: 5px; text-align: center;" },
  항목9: { name: "재공", style: "width: 5px; text-align: center;" },
  항목10: { name: "사용", style: "width: 5px; text-align: center;" },
  항목11: { name: "기말재공재고", style: "width: 5px; text-align: center;" },
  항목12: { name: "기말재고", style: "width: 5px; text-align: center;" },
  항목13: { name: "안전재고", style: "width: 5px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 50px; text-align: center;" },
  편집: { name: "편집", style: "width: 50px; text-align: center;" },
};

// v-tom (모달 실시간 데이터 변동) 에 필요한 함수
const vTom = {
  mounted(el: any, binding: any, vnode: any) {
    const options = binding.value || {};
    const defaultOptions = {
      onInitialize: function () {
        // the onInitialize callback is invoked once the control is completely initialized.
        // console.log("onInitialize", this);
      },
    };
    new TomSelect(el, { ...defaultOptions, ...options });
  },
  unmounted(el: any) {
    const tomSelect = el.tomselect;
    if (tomSelect) {
      tomSelect.destroy();
      delete el.tomselect;
    }
  },
};

// ########################## 조회기간 설정 ##########################
// 날짜 구하기
const searchDate = ref("전체기간");
const max_year = dayjs().format("YYYY");
const min_year = dayjs().add(-3, "years").format("YYYY");
// searchDate가  변경되면 실행
watch([searchDate], (newValue, oldValue) => {
  search();
  pageChangeFirst();
});
// 날짜 리셋
const reset_date = () => {
  searchDate.value = "전체기간";
  const litepicker_init = document.querySelector("#litepicker") as any;
  litepicker_init.value = "전체기간";
};
// Litepicker ButtonText가 오류나서 없애기
const litepikerButtonText: any = {
  reset: "새로고침",
  apply: "적용",
  cancel: "취소",
};

// ########################## 조회  ##########################
const searchKey = ref("전체");
const searchInput = ref("");
const sortKey = ref("등록일");
const sortOrder = ref("내림차순");
const sortOrderToggle = () => {
  sortOrder.value = sortOrder.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey, sortOrder], (newValue, oldValue) => {
  search();
  pageChangeFirst();
});
const search = () => {
  // console.log(searchKey.value, searchInput.value);
  dataManager.searchDatas(
    searchDate.value,
    searchKey.value,
    searchInput.value,
    sortKey.value,
    sortOrder.value
  );
};

// ########################## 등록, 수정, 삭제, 상세 Modal ##########################
// ##### 등록 Modal #####
let insertModalData: StockStock;
const insertModal = ref(false);
const setInsertModal = (value: boolean) => {
  router.push("/production/task-add");
  // insertModal.value = value;
  // insertModalData = {}; // 변수 초기화
};
// 등록버튼 누르면 실행되는 함수
const insertDataFunction = async () => {
  await dataManager.insertData(insertModalData);
  await setInsertModal(false);
  await search();
  await pageChangeFirst();
};

// ##### 수정 Modal #####
const editModal = ref(false);
const setEditModal = (value: boolean) => {
  editModal.value = value;
  search();
};
let editModalData: StockStock; // 수정할 변수
// 수정버튼 누르면 실행되는 함수
const editDataFunction = async () => {
  await dataManager.editData(editModalData); // await : 이 함수가 끝나야 다음으로 넘어간다
  search();
};

// ##### 삭제 Modal #####
const deleteModal = ref(false);
const setDeleteModal = (value: boolean) => {
  if (user_level >= 4) {
    deleteModal.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};

const deleteButtonRef = ref(null);
// 삭제버튼 누르면 실행되는 함수
const deleteDataFunction = async () => {
  await dataManager.deleteData(checkDebug.value); // await : 이 함수가 끝나야 다음으로 넘어간다
  resetCheckBox();
  search();
};

// ##### 상세 Modal #####
const detailModal = ref(false);
const setDetailModal = (value: boolean) => {
  detailModal.value = value;
};

// ########################## 체크박스 설정 ##########################
const checkDebug: any = ref([]); // 체크박스 선택 데이터 저장변수
const mainCheckBox = ref(true); // 메인 체크박스 상태
// 메인 체크박스가 눌릴 때 모두 체크
const checkAll = (value: boolean) => {
  const checkboxes = document.querySelectorAll("input[id=checkbox]"); // input의 id가 checkbox인 요소를 가져오기
  // 만약 메인 체크박스가 눌렸다면
  if (value === true) {
    checkDebug.value = []; // 체크박스 선택 데이터 초기화
    checkboxes.forEach((cb: any) => {
      cb.checked = value; // 모든 체크박스를 메인체크박스에 맞춰서 바꿈
      checkDebug.value.push(cb.value); // 모든 체크박스의 value를 가져와 저장
    });
  } else {
    checkboxes.forEach((cb: any) => {
      cb.checked = value;
      checkDebug.value = [];
    });
  }
};
// 페이징 넘기면 체크박스 데이터 초기화
const resetCheckBox = () => {
  const mBox = document.querySelector<HTMLElement>(
    "input[id=checkbox_all]"
  ) as HTMLInputElement | null; // 오류 안뜨게 하려고 넣어둔것
  if (!mBox) return; // 오류 안뜨게 하려고 넣어둔것
  mBox.checked = false; // 메인체크박스 체크해제
  mainCheckBox.value = true; // 메인체크박스 데이터 초기화
  checkDebug.value = [];
};

// ########################## Print 다운로드 ##########################
// Print.js  Modal
const printModal = ref(false);
const setPrintModal = (value: boolean) => {
  printModal.value = value;
};
// print.js 프린트 기능
const printPage = (data: any) => {
  printJS({
    printable: data,
    properties: [
      "구분",
      "입고일시",
      "입고코드",
      "품목구분",
      "품번",
      "품명",
      "입고수",
    ],
    type: "json",
    documentTitle: "재고관리 > 원부자재 입고",
    repeatTableHeader: true,
    style: "*{font-size:12px;}",
  });
};

// ########################## 엑셀 다운로드 및 업로드 ##########################
// 엑셀 다운로드 Modal
const excelExportModal = ref(false);
const setExcelExportModal = (value: boolean) => {
  excelExportModal.value = value;
};
// SheetJS(엑셀출력) 용
function exportFile(data: any) {
  console.log(data);
  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Data");
  writeFileXLSX(
    wb,
    "재고관리_원부자재입고_" + dayjs().format("YYMMDD_HHmmss") + "_export.xlsx"
  );
}

// 엑셀 업로드 Modal
const excelImportModal = ref(false);
const setExcelImportModal = (value: boolean) => {
  excelImportModal.value = value;
  onFileEvent.value = null;
};
// 엑셀 업로드 용 함수
const onFileImportForm =
  "../../src/assets/xlsx/업로드양식_재고관리_원부자재입고.xlsx"; // 엑셀 양식주소
const onFileEvent = ref();
const onFileChangeEvent = (event: any) => {
  onFileEvent.value = event;
};
const onFileImport = (event: any) => {
  if (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const file_data = ref();
      const wb = XLSX.read(e.target?.result, { type: "array" });
      wb.SheetNames.forEach((sheetName) => {
        // wb.Sheets[sheetName].A1.w = "날짜"; // 들어온 데이터 key 값을 바꿀 수 있음
        // console.log(wb.Sheets[sheetName].A1);
        file_data.value = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]); // ,{header: 1} key 값까지 가져옴
      });
      // file_data.value.forEach((fd: any) => {
      //   if (isNaN(Date.parse(String(fd.출고일시))))
      //     fd.출고일시 = dayjs().format("YYYY-MM-DD HH:mm:ss");
      //   let dataFil = product.dataAll.value.filter(
      //     (c) => c.품목코드 === fd.품목코드
      //   )[0];
      //   if (dataFil != undefined) {
      //     fd.품명 = dataFil.품명;
      //     fd.거래처명 = dataFil.거래처명;
      //     fd.규격 = dataFil.규격;
      //     fd.단위 = dataFil.단위;
      //   }
      // });
      await dataManager.insertAllData(file_data.value);
      search();
      pageChangeFirst();
    };
    reader.readAsArrayBuffer(file);
  }
};

// ########################################### LOT별 품목 재고현황 가져오기 ###########################################
// 페이징기능
const currentPage_stockLot = ref(1); // 현재페이지
const rowsPerPage_stockLot = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_stockLot = () => {
  currentPage_stockLot.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_stock_stockLot = "/api/stock/stock/lot/half";
const stock_stockLot = useSendApi<StockStockLOT>(
  url_stock_stockLot,
  currentPage_stockLot,
  rowsPerPage_stockLot
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_stockLot = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "LOT코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "품번", style: "width: 50px; text-align: center;" },
  항목4: { name: "품명", style: "width: 50px; text-align: center;" },
  항목5: { name: "규격", style: "width: 50px; text-align: center;" },
  항목6: { name: "단위", style: "width: 50px; text-align: center;" },
  항목7: { name: "기초재공재고", style: "width: 50px; text-align: center;" },
  항목8: { name: "기초재고", style: "width: 50px; text-align: center;" },
  항목9: { name: "입고", style: "width: 50px; text-align: center;" },
  항목10: { name: "재공", style: "width: 50px; text-align: center;" },
  항목11: { name: "사용", style: "width: 50px; text-align: center;" },
  항목12: { name: "기말재공재고", style: "width: 50px; text-align: center;" },
  항목13: { name: "기말재고", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_stockLot = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_stockLot = ref("전체");
const searchInput_stockLot = ref("");
const sortKey_stockLot = ref("등록일");
const sortOrder_stockLot = ref("내림차순");
const sortOrderToggle_stockLot = () => {
  sortOrder_stockLot.value =
    sortOrder_stockLot.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_stockLot, sortOrder_stockLot], (newValue, oldValue) => {
  search_stockLot();
  pageChangeFirst_stockLot();
});
const search_stockLot = () => {
  // console.log(searchKey.value, searchInput.value);
  stock_stockLot.searchDatas(
    searchDate_stockLot.value,
    searchKey_stockLot.value,
    searchInput_stockLot.value,
    sortKey_stockLot.value,
    sortOrder_stockLot.value
  );

  console.log(searchKey_stockLot.value);
};

// 품목등록 모달 설정
const stockLotModal = ref(false);
const setStockLotModal = (value: boolean) => {
  stockLotModal.value = value;
};
</script>

##############################################################################################################

<template>
  <div v-if="user_level >= 2">
    <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
    <div class="grid grid-cols-12 gap-1 mt-1">
      <div
        class="flex flex-wrap items-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
      >
        <!-- <Button
          class="mr-2 shadow-md"
          as="a"
          variant="primary"
          @click="
            () => {
              setInsertModal(true);
            }
          "
        >
          <Lucide icon="FilePlus" class="w-4 h-4 mr-2" />
          등록
        </Button>
        <Button
          class="mr-2 shadow-md"
          as="a"
          variant="danger"
          @click="
            () => {
              setDeleteModal(true);
            }
          "
        >
          <Lucide icon="Trash2" class="w-4 h-4 mr-2" /> 삭제</Button
        > -->
        <div class="hidden mx-auto md:block text-slate-500"></div>
        <div class="mr-5">
          <a href="" class="flex items-center ml-auto text-primary">
            <Lucide icon="RefreshCcw" class="w-4 h-4 mr-3" /> 새로고침
          </a>
        </div>
        <div>
          <Button
            class="mr-2 shadow-md"
            as="a"
            size="sm"
            variant="outline-primary"
            @click="reset_date"
            title="기간 초기화"
            ><Lucide icon="CalendarX" class="w-5 h-5"
          /></Button>
        </div>
        <div class="text-center">
          <div>
            <Litepicker
              v-model="searchDate"
              :options="{
                autoApply: false,
                singleMode: false,
                numberOfColumns: 1,
                numberOfMonths: 1,
                showWeekNumbers: true,
                dropdowns: {
                  minYear: Number(min_year),
                  maxYear: Number(max_year),
                  months: true,
                  years: true,
                },
                lang: 'ko',
                format: 'YY/MM/DD',
                delimiter: ' - ',
                buttonText: litepikerButtonText,
              }"
              class="block w-40 mx-auto !box"
              placeholder="전체기간"
            />
          </div>
        </div>
        <div class="ml-2">
          <FormSelect v-model="searchKey" class="w-30 mt-3 !box sm:mt-0">
            <option>전체</option>
            <option>구분</option>
            <option>입고일시</option>
            <option>입고코드</option>
            <option>품목구분</option>
            <option>품번</option>
            <option>품명</option>
            <option>규격</option>
            <option>단위</option>
            <option>유효일자</option>
            <option>비고</option>
          </FormSelect>
        </div>
        <div class="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-2">
          <div class="relative w-56 text-slate-500">
            <FormInput
              type="text"
              class="w-56 pr-10 !box"
              v-model="searchInput"
              @keyup.enter="
                () => {
                  search();
                  pageChangeFirst();
                }
              "
              placeholder="검색어를 입력해주세요"
            />
            <button
              @click="
                () => {
                  search();
                  pageChangeFirst();
                }
              "
            >
              <Lucide
                icon="Search"
                class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"
              />
            </button>
          </div>
        </div>
        <div class="ml-2 mr-4">
          <Menu>
            <Menu.Button :as="Button" class="px-2 !box">
              <span class="flex items-center justify-center w-5 h-5">
                <Lucide icon="MoreVertical" class="w-4 h-4" />
              </span>
            </Menu.Button>
            <Menu.Items style="width: 170px">
              <Menu.Item @click="setPrintModal(true)">
                <Lucide icon="Printer" class="w-4 h-4 mr-2" />
                Print (PDF출력)
              </Menu.Item>
              <Menu.Item @click="setExcelExportModal(true)">
                <Lucide icon="FileDown" class="w-4 h-4 mr-2" />
                Excel 다운로드
              </Menu.Item>
              <Menu.Item @click="setExcelImportModal(true)">
                <Lucide icon="FileUp" class="w-4 h-4 mr-2" />
                Excel 업로드
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
      <!-- BEGIN: Pagination-->
      <div
        class="flex flex-wrap items-center col-span-12 mt-0 intro-y sm:flex-nowrap"
      >
        <div>
          <FormSelect v-model="sortKey" class="w-30 mt-3 !box sm:mt-0">
            <option>등록일</option>
            <option>구분</option>
            <option>입고일시</option>
            <option>입고코드</option>
            <option>품목구분</option>
            <option>품번</option>
            <option>품명</option>
            <option>입고수</option>
          </FormSelect>
        </div>
        <div class="ml-3">
          <Button
            class="shadow-md"
            as="a"
            variant="outline-primary"
            v-if="sortOrder == '오름차순'"
            @click="sortOrderToggle"
          >
            <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

            {{ sortOrder }}</Button
          >
          <Button
            class="shadow-md"
            as="a"
            variant="outline-danger"
            v-if="sortOrder == '내림차순'"
            @click="sortOrderToggle"
          >
            <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

            {{ sortOrder }}</Button
          >
        </div>
        <div class="ml-5">
          <FormSelect
            class="w-20 mt-3 !box sm:mt-0"
            v-model="rowsPerPage"
            @change="pageChangeFirst"
          >
            <option>10</option>
            <option>25</option>
            <option>50</option>
            <option>100</option>
            <option :value="dataManager.dataCount.value">전체</option>
          </FormSelect>
        </div>
        <div>
          <PaginationComponent
            class="pagination-component"
            v-model="currentPage"
            :numberOfPages="dataManager.numberOfPages.value"
            @click="resetCheckBox()"
          />
        </div>
        <div class="hidden mx-auto md:block text-slate-500"></div>
        <div>
          <span class="mr-3"
            >[ {{ dataManager.dataCount }}개 데이터 조회됨 ]
          </span>
          <span class="mr-4">
            [ {{ currentPage }} / {{ dataManager.numberOfPages }} 페이지 ]</span
          >
        </div>
      </div>
      <!-- END: Pagination-->
      <!-- BEGIN: Data List -->
      <!-- style="height: calc(100vh - 350px)" : 브라우저 화면 창크기에 맞게 변경됨 -->
      <div class="col-span-12 overflow-auto intro-y lg:overflow-visible">
        <div
          class="mr-3"
          style="overflow-y: scroll; overflow-x: hidden; height: 580px"
        >
          <Table class="border-spacing-y-[8px] border-separate -mt-2">
            <Table.Thead
              class="bg-slate-100"
              style="position: sticky; top: 0px; z-index: 2"
            >
              <Table.Tr>
                <!-- <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  id="checkbox"
                  :style="table_setting.체크박스.style"
                >
                  <Input
                    class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed"
                    id="checkbox_all"
                    type="checkbox"
                    :value="mainCheckBox"
                    @click="
                      () => {
                        checkAll(mainCheckBox);
                        mainCheckBox = !mainCheckBox;
                      }
                    "
                  />
                </Table.Th> -->
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.순번.style"
                >
                  {{ table_setting.순번.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목1.style"
                >
                  {{ table_setting.항목1.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목2.style"
                >
                  {{ table_setting.항목2.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목3.style"
                >
                  {{ table_setting.항목3.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목4.style"
                >
                  {{ table_setting.항목4.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목5.style"
                >
                  {{ table_setting.항목5.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목6.style"
                >
                  {{ table_setting.항목6.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목7.style"
                >
                  {{ table_setting.항목7.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목8.style"
                >
                  {{ table_setting.항목8.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목9.style"
                >
                  {{ table_setting.항목9.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목10.style"
                >
                  {{ table_setting.항목10.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목11.style"
                >
                  {{ table_setting.항목11.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목12.style"
                >
                  {{ table_setting.항목12.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목13.style"
                >
                  {{ table_setting.항목13.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.상세보기.style"
                >
                  {{ table_setting.상세보기.name }}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody style="position: relative; z-index: 1">
              <Table.Tr
                v-for="(todo, index) in dataManager.datas.value"
                :key="todo.품번"
                class="intro-x"
              >
                <!-- <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  id="checkbox"
                  :style="table_setting.체크박스.style"
                >
                  <input
                    class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed"
                    id="checkbox"
                    type="checkbox"
                    :value="todo.품번"
                    v-model="checkDebug"
                  />
                </Table.Td> -->
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.순번.style"
                >
                  <div>{{ index + 1 + (currentPage - 1) * rowsPerPage }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목1.style"
                >
                  <div>{{ todo[table_setting.항목1.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목2.style"
                >
                  <div>{{ todo[table_setting.항목2.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목3.style"
                >
                  <div>{{ todo[table_setting.항목3.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목4.style"
                >
                  <div>{{ todo[table_setting.항목4.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목5.style"
                >
                  <div>{{ todo[table_setting.항목5.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목6.style"
                >
                  <div>{{ todo[table_setting.항목6.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목7.style"
                >
                  <div>{{ todo[table_setting.항목7.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목8.style"
                >
                  <div>{{ todo[table_setting.항목8.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목9.style"
                >
                  <div>{{ todo[table_setting.항목9.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목10.style"
                >
                  <div>{{ todo[table_setting.항목10.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목11.style"
                >
                  <div>{{ todo[table_setting.항목11.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목12.style"
                >
                  <div>{{ todo[table_setting.항목12.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목13.style"
                >
                  <div>{{ todo[table_setting.항목13.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400"
                  :style="table_setting.상세보기.style"
                >
                  <div class="flex items-center justify-center text-cyan-700">
                    <a
                      class="flex items-center mr-3"
                      href="#"
                      @click="
                        () => {
                          editModalData = todo;
                          // setDetailModal(true);
                          searchDate_stockLot = searchDate;
                          searchKey_stockLot = '품번';
                          searchInput_stockLot = todo.품번 ?? '';
                          sortKey_stockLot = 'LOT코드';
                          sortOrder_stockLot = '오름차순';
                          setStockLotModal(true);
                          search_stockLot();
                        }
                      "
                    >
                      <Lucide icon="ListPlus" class="w-5 h-5 mr-1" />
                      상세
                    </a>
                  </div>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          <div
            class="text-center mt-20"
            v-if="dataManager.dataCount.value == 0"
          >
            저장된 데이터가 없습니다.
          </div>
        </div>
      </div>
      <!-- END: Data List -->
    </div>
  </div>
  <!-- BEGIN : 권한 경고 -->
  <div class="intro-y" v-if="user_level < 2">
    <div class="mt-20 items-center text-center">
      <div>
        <Lucide icon="AlertTriangle" class="w-20 h-20 mx-auto text-warning" />
      </div>
      <div class="mt-3 text-2xl">ACCESS DENIED</div>
    </div>
    <div class="mt-5 text-center">액세스 권한이 없습니다.</div>
    <div class="mt-2 text-center">
      IT 관리자에게 연락하여 액세스 권한을 요청하세요.
    </div>
  </div>
  <!-- END : 권한 없을 때 -->
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mt-5 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->

  <!-- BEGIN: Detail Modal Content -->
  <Dialog
    size="lg"
    :open="detailModal"
    @close="
      () => {
        setDetailModal(false);
      }
    "
  >
    <Dialog.Panel>
      <Detail :data="editModalData" />
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-primary"
          as="a"
          type="button"
          @click="
            () => {
              setDetailModal(false);
            }
          "
          class="w-24 mr-1"
        >
          닫기
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Detail Modal Content -->

  <!-- BEGIN: 엑셀 다운로드 Modal -->
  <Dialog :open="excelExportModal" @close="setExcelExportModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="FileDown" class="w-16 h-16 mx-auto mt-3 text-primary" />
        <div class="mt-5 text-3xl">Excel 다운로드</div>
      </div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-38 mr-3"
          @click="
            () => {
              exportFile(dataManager.datas.value);
              setExcelExportModal(false);
            }
          "
        >
          다운로드(현재 페이지)
        </Button>
        <Button
          variant="primary"
          type="button"
          class="w-38 mr-3"
          @click="
            () => {
              exportFile(dataManager.dataSearchAll.value);
              setExcelExportModal(false);
            }
          "
        >
          다운로드(전체)
        </Button>
        <Button
          variant="outline-secondary"
          type="button"
          @click="setExcelExportModal(false)"
          class="w-24 mr-1"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 엑셀 다운로드 Modal -->
  <!-- BEGIN: 엑셀 업로드 Modal -->
  <Dialog :open="excelImportModal" @close="setExcelImportModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="FileUp" class="w-16 h-16 mx-auto mt-3 text-primary" />
        <div class="mt-5 text-3xl">Excel 업로드</div>
      </div>
      <div class="text-center mb-5">
        <a :href="onFileImportForm" download>
          <Button variant="outline-primary" size="sm" type="button" as="a"
            >업로드 양식 다운로드</Button
          >
        </a>
      </div>
      <div class="text-center mb-5">
        <input
          class="form-control"
          id="formFile"
          type="file"
          accept="appliction/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          @change="onFileChangeEvent($event)"
        />
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-24 mr-3"
          @click="
            () => {
              onFileImport(onFileEvent);
              setExcelImportModal(false);
            }
          "
        >
          업로드
        </Button>
        <Button
          variant="outline-secondary"
          type="button"
          @click="setExcelImportModal(false)"
          class="w-24 mr-1"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 엑셀 업로드 Modal -->
  <!-- BEGIN: 프린트 출력 Modal -->
  <Dialog :open="printModal" @close="setPrintModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="Printer" class="w-16 h-16 mx-auto mt-3 text-primary" />
        <div class="mt-5 text-3xl">Print (PDF출력)</div>
        <div class="mt-5">
          PDF출력은 인쇄 대상을 <strong>PDF 저장</strong>으로 지정하세요.
        </div>
      </div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-38 mr-3"
          @click="
            () => {
              printPage(dataManager.datas.value);
              setPrintModal(false);
            }
          "
        >
          출력(현재 페이지)
        </Button>
        <Button
          variant="primary"
          type="button"
          class="w-38 mr-3"
          @click="
            () => {
              printPage(dataManager.dataSearchAll.value);
              setPrintModal(false);
            }
          "
        >
          출력(전체)
        </Button>
        <Button
          variant="outline-secondary"
          type="button"
          @click="setPrintModal(false)"
          class="w-24 mr-1"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 프린트 출력 Modal -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: StockLot Modal Content -->
  <Dialog size="xxl" :open="stockLotModal" @close="setStockLotModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--stockLot Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        품목(LOT별) 재고 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect
              v-model="searchKey_stockLot"
              class="w-30 mt-3 !box sm:mt-0"
            >
              <option>전체</option>
              <option>LOT코드</option>
              <option>품번</option>
              <option>품명</option>
              <option>규격</option>
              <option>단위</option>
            </FormSelect>
          </div>
          <div class="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-2">
            <div class="relative w-56 text-slate-500">
              <FormInput
                type="text"
                class="w-56 pr-10 !box"
                v-model="searchInput_stockLot"
                @keyup.enter="
                  () => {
                    search_stockLot();
                    pageChangeFirst_stockLot();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_stockLot();
                    pageChangeFirst_stockLot();
                  }
                "
              >
                <Lucide
                  icon="Search"
                  class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"
                />
              </button>
            </div>
          </div>
        </div>
        <!-- BEGIN: Pagination-->
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-0 intro-y sm:flex-nowrap"
        >
          <div>
            <FormSelect
              v-model="sortKey_stockLot"
              class="w-30 mt-3 !box sm:mt-0"
            >
              <option>LOT코드</option>
              <option>품번</option>
              <option>품명</option>
              <option>규격</option>
              <option>단위</option>
            </FormSelect>
          </div>
          <div class="ml-3">
            <Button
              class="shadow-md"
              as="a"
              variant="outline-primary"
              v-if="sortOrder_stockLot == '오름차순'"
              @click="sortOrderToggle_stockLot"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_stockLot }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_stockLot == '내림차순'"
              @click="sortOrderToggle_stockLot"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_stockLot }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_stockLot"
              @change="pageChangeFirst_stockLot"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="stock_stockLot.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_stockLot"
              :numberOfPages="stock_stockLot.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ stock_stockLot.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_stockLot }} /
              {{ stock_stockLot.numberOfPages }} 페이지 ]</span
            >
          </div>
        </div>
        <!-- END: Pagination-->
        <!-- BEGIN: Data List -->
        <!-- style="height: calc(100vh - 350px)" : 브라우저 화면 창크기에 맞게 변경됨 -->
        <div class="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <div
            class="mr-3"
            style="overflow-y: scroll; overflow-x: hidden; height: 580px"
          >
            <Table class="border-spacing-y-[6px] border-separate -mt-2">
              <Table.Thead
                class="bg-slate-100"
                style="position: sticky; top: 0px; z-index: 2"
              >
                <Table.Tr>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.순번.style"
                  >
                    {{ table_setting_stockLot.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목1.style"
                  >
                    {{ table_setting_stockLot.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목2.style"
                  >
                    {{ table_setting_stockLot.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목3.style"
                  >
                    {{ table_setting_stockLot.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목4.style"
                  >
                    {{ table_setting_stockLot.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목5.style"
                  >
                    {{ table_setting_stockLot.항목5.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목6.style"
                  >
                    {{ table_setting_stockLot.항목6.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목7.style"
                  >
                    {{ table_setting_stockLot.항목7.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목8.style"
                  >
                    {{ table_setting_stockLot.항목8.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목9.style"
                  >
                    {{ table_setting_stockLot.항목9.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목10.style"
                  >
                    {{ table_setting_stockLot.항목10.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목11.style"
                  >
                    {{ table_setting_stockLot.항목11.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목12.style"
                  >
                    {{ table_setting_stockLot.항목12.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_stockLot.항목13.style"
                  >
                    {{ table_setting_stockLot.항목13.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in stock_stockLot.datas.value"
                  :key="todo.LOT코드"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.순번.style"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_stockLot - 1) * rowsPerPage_stockLot
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목1.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목2.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목3.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목4.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목5.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목5.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목6.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목6.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목7.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목7.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목8.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목8.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목9.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목9.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목10.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목10.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목11.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목11.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목12.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목12.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_stockLot.항목13.style"
                  >
                    <div>{{ todo[table_setting_stockLot.항목13.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="stock_stockLot.dataCount.value == 0"
            >
              저장된 데이터가 없습니다.
            </div>
          </div>
        </div>
        <!-- END: Data List -->
      </div>
      <div style="text-align: left">
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="setStockLotModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: StockLot Modal Content -->
</template>
