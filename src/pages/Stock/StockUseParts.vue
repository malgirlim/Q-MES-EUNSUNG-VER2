<script setup lang="ts">
import _, { isArguments } from "lodash";
import { ref, Ref, getCurrentInstance } from "vue";
import Button from "../../base-components/Button";
import { FormInput, FormSelect, FormCheck } from "../../base-components/Form";
import Lucide from "../../base-components/Lucide";
import { Dialog, Menu } from "../../base-components/Headless";
import Table from "../../base-components/Table";
import dayjs from "dayjs";
import Litepicker from "../../base-components/Litepicker";
import TomSelect from "tom-select";
import * as XLSX from "xlsx";
import { read, utils, writeFileXLSX } from "xlsx";
import printJS from "print-js";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../composables/useSendApi";
import { StockUse } from "../../interfaces/menu/stockInterface";
import { MasterProduct } from "../../interfaces/menu/MasterInterface";

// 페이징기능
import { onMounted, watch } from "vue";
import PaginationComponent from "../../components/Pagination/PaginationComponent.vue"; // 페이징설정

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.StockUseParts; //권한레벨

const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수

const pageChange = () => {
  // 한 페이지에 보여질 데이터 갯수 변경 시 1페이지로 이동
  currentPage.value = 1;
};

// api 보내기
const url = "";
const {
  datas,
  dataAll,
  dataCount,
  datasAreLoading,
  loadDatas,
  searchDatas,
  insertData,
  editData,
  deleteData,
  insertAllData,
  numberOfPages,
} = useSendApi<StockUse>(url, currentPage, rowsPerPage);

// api2 : 품목등록데이터 가져오기
const url_2 = "/api/master/product";
const product = useSendApi<MasterProduct>(url_2, currentPage, rowsPerPage);

const searchKey = ref("전체");
const searchInput = ref("");
onMounted(async () => {
  loadDatas();
  product.loadDatas();
}); // 페이지 로딩 시 데이터 불러오기

// 조회
const search = () => {
  // console.log(searchKey.value, searchInput.value);
  searchDatas(now2.value, searchKey.value, searchInput.value);
};

//등록 Modal
const insertModal = ref(false);
const setInsertModal = (value: boolean) => {
  insertModal.value = value;
  insertModalData = {}; // 변수 초기화
  insertModalData.출고일시 = dayjs().format("YYYY-MM-DD HH:mm:ss");
};
let insertModalData: StockUse; // 등록할 변수
// 등록 함수
const insertDataFunction = () => {
  if ((insertModalData.NO ? insertModalData.NO : 0) > 0) {
    let pf = product.dataAll.value.filter(
      (c) => c.NO === insertModalData.NO
    )[0];
    insertModalData.품목코드 = pf.품목코드;
    insertModalData.품명 = pf.품명;
    insertModalData.규격 = pf.규격;
    insertModalData.단위 = pf.단위;
    insertData(insertModalData);
    setInsertModal(false);
    search();
    pageChange();
  }
};
// TomSelect 에 필요한 함수
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

//수정 Modal
const editModal = ref(false);
const setEditModal = (value: boolean) => {
  editModal.value = value;
  search();
  let pfe = product.dataAll.value.filter(
    (c) => c.품목코드 === editModalData.품목코드
  )[0];
  editModalData.품명 = pfe?.품명;
  editModalData.규격 = pfe?.규격;
  editModalData.단위 = pfe?.단위;
};
let editModalData: StockUse; // 수정할 변수

//삭제 Modal
const deleteConfirmationModal = ref(false);
const setDeleteConfirmationModal = (value: boolean) => {
  deleteConfirmationModal.value = value;
};
const deleteButtonRef = ref(null);
const deleteDataFunction = async () => {
  await deleteData(checkDebug.value); // await : 이 함수가 끝나야 다음으로 넘어간다
  resetCheckBox();
  search();
};

// print.js 프린트 기능

const printPage = (data: any) => {
  printJS({
    printable: data,
    properties: [
      "출고일시",
      "품목코드",
      "거래처명",
      "품명",
      "규격",
      "단위",
      "출고수",
      "비고",
    ],
    type: "json",
    documentTitle: "재고 관리 > 원자재 사용 등록",
    repeatTableHeader: true,
    style: "*{font-size:12px;}",
  });
};

// Print.js  Modal
const printModal = ref(false);
const setPrintModal = (value: boolean) => {
  printModal.value = value;
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
    "재고관리_원자재사용등록" + dayjs().format("YYMMDD_HHmmss") + "_export.xlsx"
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
  "../../src/assets/xlsx/업로드양식_재고관리_원자재사용등록.xlsx"; // 엑셀 양식주소
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
      file_data.value.forEach((fd: any) => {
        if (isNaN(Date.parse(String(fd.출고일시))))
          fd.출고일시 = dayjs().format("YYYY-MM-DD HH:mm:ss");
        let dataFil = product.dataAll.value.filter(
          (c) => c.품목코드 === fd.품목코드
        )[0];
        if (dataFil != undefined) {
          fd.품명 = dataFil.품명;
          fd.거래처명 = dataFil.거래처명;
          fd.규격 = dataFil.규격;
          fd.단위 = dataFil.단위;
        }
      });
      await insertAllData(file_data.value);
      search();
      pageChange();
    };
    reader.readAsArrayBuffer(file);
  }
};
// ########################## 엑셀 다운로드 및 업로드 끝 ##########################

// 날짜 구하기
const now = dayjs().format("YYYY-MM-DD");
const nowPlus = dayjs().add(7, "days").format("YYYY-MM-DD");
const max_year = dayjs().format("YYYY");
const min_year = dayjs().add(-3, "years").format("YYYY");
const now2 = ref("전체기간");
// now2가 변경되면 실행
watch([now2], (newValue, oldValue) => {
  search();
  pageChange();
});

// 날짜 리셋
const reset_date = () => {
  now2.value = "전체기간";
  const litepicker_init = document.querySelector("#litepicker") as any;
  litepicker_init.value = "전체기간";
};

// 체크박스 선택으로 데이터 가져오기
const checkDebug: any = ref([]); // 체크박스 선택 데이터 저장변수

const mainCheckBox = ref(true); // 메인 체크박스 상태
const checkAll = (value: boolean) => {
  // 메인 체크박스가 눌릴 때 모두 체크
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

const resetCheckBox = () => {
  // 페이징 넘기면 체크박스 데이터 초기화
  const mBox = document.querySelector<HTMLElement>(
    "input[id=checkbox_all]"
  ) as HTMLInputElement | null; // 오류 안뜨게 하려고 넣어둔것
  if (!mBox) return; // 오류 안뜨게 하려고 넣어둔것
  mBox.checked = false; // 메인체크박스 체크해제
  mainCheckBox.value = true; // 메인체크박스 데이터 초기화
  checkDebug.value = [];
};
// 테이블 열 크기 조정
const table_width = [
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
];
</script>

<template>
  <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
  <div class="grid grid-cols-12 gap-1 mt-1">
    <div
      class="flex flex-wrap items-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
    >
      <Button
        class="mr-2 shadow-md"
        as="a"
        variant="primary"
        @click="
          (event) => {
            event.preventDefault();
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
          (event) => {
            event.preventDefault();
            setDeleteConfirmationModal(true);
          }
        "
      >
        <Lucide icon="Trash2" class="w-4 h-4 mr-2" /> 삭제</Button
      >
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
            v-model="now2"
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
              buttonText: {
                reset: '새로고침',
                apply: '적용',
                cancel: '취소',
              },
            }"
            class="block w-40 mx-auto !box"
            placeholder="전체기간"
          />
        </div>
      </div>
      <div class="ml-2">
        <FormSelect modelValue="전체" class="w-30 mt-3 !box sm:mt-0">
          <option>전체</option>
          <option>품목코드</option>
          <option>거래처명</option>
          <option>품명</option>
          <option>규격</option>
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
                pageChange();
              }
            "
            placeholder="검색어를 입력해주세요"
          />
          <button
            @click="
              {
                search();
                pageChange();
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
      <div class="ml-2">
        <!-- BEGIN: Pagination Pages-->
        <FormSelect
          class="w-20 mt-3 !box sm:mt-0"
          v-model="rowsPerPage"
          @change="pageChange"
        >
          <option>10</option>
          <option>25</option>
          <option>35</option>
          <option>50</option>
        </FormSelect>
        <!-- END: Pagination Pages-->
      </div>
      <div class="ml-2">
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
        <PaginationComponent
          class="pagination-component"
          v-model="currentPage"
          :numberOfPages="numberOfPages"
          @click="resetCheckBox()"
        />
      </div>
      <div class="hidden mx-auto md:block text-slate-500"></div>
      <div>
        <span class="mr-3">[ {{ dataCount }}개 데이터 조회됨 ] </span>
        <span class="mr-5"
          >[ {{ currentPage }} / {{ numberOfPages }} 페이지 ]</span
        >
        <!-- END: Pagination-->
      </div>
    </div>
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
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                id="checkbox"
                :style="table_width[0]"
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
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[1]"
              >
                순번
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[2]"
              >
                항목1
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[3]"
              >
                항목2
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[4]"
              >
                항목3
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[5]"
              >
                항목4
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[6]"
              >
                항목5
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[7]"
              >
                항목6
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[8]"
              >
                항목7
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[9]"
              >
                항목8
              </Table.Th>
              <Table.Th
                class="text-center border-b-0 whitespace-nowrap"
                :style="table_width[10]"
              >
                항목9
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody style="position: relative; z-index: 1">
            <!-- <Table.Tr
          <Table.Tr
            v-for="(faker, fakerKey) in _.take(fakerData, 10)"
            :key="fakerKey"
            class="intro-x"
          > -->
            <Table.Tr
              v-for="(todo, index) in datas"
              :key="todo.NO"
              class="intro-x"
            >
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md w-5 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                id="checkbox"
                :style="table_width[0]"
              >
                <input
                  class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed"
                  id="checkbox"
                  type="checkbox"
                  :value="todo.NO"
                  v-model="checkDebug"
                />
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md w-5 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_width[1]"
              >
                <div>{{ index + 1 + (currentPage - 1) * rowsPerPage }}</div>
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_width[2]"
              >
                <div>예시데이터1</div>
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_width[3]"
              >
                <div>예시데이터2</div>
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_width[4]"
              >
                <div>예시데이터3</div>
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md w-50 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_width[5]"
              >
                <div>예시데이터4</div>
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md w-5 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_width[6]"
              >
                <div>예시데이터5</div>
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_width[7]"
              >
                <div>예시데이터6</div>
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_width[8]"
              >
                <div>예시데이터7</div>
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_width[9]"
              >
                <div>예시데이터8</div>
              </Table.Td>
              <Table.Td
                class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400"
                :style="table_width[10]"
              >
                <div class="flex items-center justify-center text-danger">
                  <a
                    class="flex items-center mr-3"
                    href="#"
                    @click="
                      () => {
                        editModalData = todo;
                        setEditModal(true);
                      }
                    "
                  >
                    <Lucide icon="Edit" class="w-4 h-4 mr-1" />
                    수정
                  </a>
                </div>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <div class="text-center mt-20" v-if="dataCount == 0">
          저장된 데이터가 없습니다.
        </div>
      </div>
    </div>
    <!-- END: Data List -->
  </div>
  <!-- BEGIN: Insert Modal Content -->
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mt-5 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->
  <Dialog
    size="md"
    :open="insertModal"
    @close="
      () => {
        setInsertModal(false);
      }
    "
  >
    <Dialog.Panel class="p-10 text-center">
      <!--추가 Modal 내용 시작-->
      <div class="mb-5" style="font-weight: bold">등록</div>
      <div style="text-align: left">
        <div>
          <FormLabel htmlFor="vertical-form-1">등록일시</FormLabel>
          <FormInput
            id="vertical-form-1"
            type="date"
            v-model="insertModalData.출고일시"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-2">등록코드</FormLabel>
          <select v-tom v-model="insertModalData.NO">
            <option value="" selected>=== 필수선택 ===</option>
            <option
              :value="p.NO"
              v-for="p in product.dataAll.value"
              :key="p.NO"
            >
              {{ p.품목코드 }} # 품명:{{ p.품명 }} # 규격:{{ p.규격 }} # 단위:{{
                p.단위
              }}
            </option>
          </select>
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-2">등록수</FormLabel>
          <FormInput
            id="vertical-form-2"
            type="text"
            v-model="insertModalData.출고수"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-2">비고</FormLabel>
          <FormInput
            id="vertical-form-2"
            type="text"
            v-model="insertModalData.비고"
            placeholder=""
          />
        </div>
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="
              () => {
                insertDataFunction();
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setInsertModal(false);
              }
            "
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝--></Dialog.Panel
    >
  </Dialog>
  <!-- END: Insert Modal Content -->
  <!-- BEGIN: Edit Modal Content -->
  <Dialog
    size="md"
    :open="editModal"
    @close="
      () => {
        setEditModal(false);
      }
    "
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">수정</div>
      <div style="text-align: left">
        <div>
          <FormLabel htmlFor="vertical-form-1">출고일시</FormLabel>
          <FormInput
            id="vertical-form-1"
            type="date"
            v-model="editModalData.출고일시"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-1">품목코드</FormLabel>
          <FormInput
            id="vertical-form-1"
            type="text"
            v-model="editModalData.품목코드"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-1">거래처명</FormLabel>
          <FormInput
            id="vertical-form-1"
            type="text"
            v-model="editModalData.거래처명"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-1">품명</FormLabel>
          <FormInput
            id="vertical-form-1"
            type="text"
            v-model="editModalData.품명"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-1">규격</FormLabel>
          <FormInput
            id="vertical-form-1"
            type="text"
            v-model="editModalData.규격"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-2">단위</FormLabel>
          <FormInput
            id="vertical-form-2"
            type="text"
            v-model="editModalData.단위"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-2">출고수</FormLabel>
          <FormInput
            id="vertical-form-2"
            type="text"
            v-model="editModalData.출고수"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-2">비고</FormLabel>
          <FormInput
            id="vertical-form-2"
            type="text"
            v-model="editModalData.비고"
            placeholder=""
          />
        </div>
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="
              () => {
                editData(editModalData);
                setEditModal(false);
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setEditModal(false);
              }
            "
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Edit Modal Content -->
  <!-- BEGIN: Delete Confirmation Modal -->
  <Dialog
    :open="deleteConfirmationModal"
    @close="
      () => {
        setDeleteConfirmationModal(false);
      }
    "
    :initialFocus="deleteButtonRef"
  >
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl">삭제</div>
        <div class="mt-2 text-slate-500">정말 삭제하시겠습니까?</div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          @click="
            () => {
              setDeleteConfirmationModal(false);
            }
          "
          class="w-24 mr-1"
        >
          취소
        </Button>
        <Button
          variant="danger"
          type="button"
          class="w-24"
          ref="deleteButtonRef"
          @click="
            () => {
              deleteDataFunction();
              setDeleteConfirmationModal(false);
            }
          "
        >
          삭제
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Delete Confirmation Modal -->
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
              exportFile(datas);
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
              exportFile(dataAll);
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
              printPage(datas);
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
              printPage(dataAll);
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
</template>
