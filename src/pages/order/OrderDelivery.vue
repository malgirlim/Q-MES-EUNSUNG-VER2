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
import Progress from "../../base-components/Progress";
import { toast } from "vue3-toastify";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../composables/useSendApi";
import { StockStockFinLOT } from "../../interfaces/menu/stockInterface";
import {
  OrderAccept,
  OrderDelivery,
} from "../../interfaces/menu/orderInterface";
import { QualityShipment } from "../../interfaces/menu/qualityInterface";

// 컴포넌트 로드
import MasterDetail from "../../components/Common/Detail/MasterBOMDetail.vue";
import DocumentPrint from "../../components/Common/Print/Template/Order/Main.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.OrderDelivery; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  await dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
  await delivery.loadDatas(); // 납품 데이터 불러오기
  await delivery_finStock.loadDatas(); // 완제품재고 데이터 불러오기
});

// 페이징기능
const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst = () => {
  currentPage.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// dataManager 만들기 // 수주데이터
const url = "/api/order/delivery/accept";
const dataManager = useSendApi<OrderAccept>(url, currentPage, rowsPerPage);

// 테이블항목 설정 및 가로크기 조정
const table_setting = {
  체크박스: { name: "체크박스", style: "width: 20px" },
  선택: { name: "선택", style: "width: 20px; text-align: center;" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "수주일", style: "width: 50px; text-align: center;" },
  항목2: { name: "코드", style: "width: 50px; text-align: center;" },
  항목3: { name: "코드순번", style: "width: 50px; text-align: center;" },
  항목4: { name: "거래처명", style: "width: 50px; text-align: center;" },
  항목5: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목6: { name: "품명", style: "width: 50px; text-align: center;" },
  항목7: { name: "수량", style: "width: 50px; text-align: center;" },
  항목8: { name: "납기일", style: "width: 50px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 50px; text-align: center;" },
  편집: { name: "편집", style: "width: 50px; text-align: center;" },
  진행율: { name: "진행율", style: "width: 50px; text-align: center;" },
};

// ####################### 납품 데이터 가져오기 #######################
const url_delivery = "/api/order/delivery";
const delivery = useSendApi<OrderDelivery>(url_delivery, ref(1), ref(100));

// 테이블항목 설정 및 가로크기 조정
const table_setting_delivery = {
  체크박스: { name: "체크박스", style: "width: 50px" },
  선택: { name: "선택", style: "width: 50px; text-align: center;" },
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "LOT코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "품명", style: "width: 50px; text-align: center;" },
  항목4: { name: "규격", style: "width: 50px; text-align: center;" },
  항목5: { name: "단위", style: "width: 50px; text-align: center;" },
  항목6: { name: "수량", style: "width: 50px; text-align: center;" },
  항목7: { name: "일시", style: "width: 50px; text-align: center;" },
  항목8: { name: "검사결과", style: "width: 50px; text-align: center;" },
  출하검사: { name: "출하검사", style: "width: 110px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 100px; text-align: center;" },
  편집: { name: "편집", style: "width: 100px; text-align: center;" },
};

// 라디오 선택하기
const radioSelect: any = ref();
// now2가 변경되면 실행
watch([radioSelect], (newValue, oldValue) => {
  // console.log(oldValue[0], "->", newValue[0]);
  delivery.searchDatas("", "수주NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
});

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
let insertModalData: OrderDelivery;
const insertModal = ref(false);
const setInsertModal = (value: boolean) => {
  if (user_level >= 3) {
    if (radioSelect.value) {
      insertModal.value = value;
      insertModalData = {}; // 변수 초기화
      insertModalData.구분 = "납품등록";
      insertModalData.수주NO = radioSelect.value;
      insertModalData.일시 = moment().format("YYYY-MM-DD HH:mm:ss");
      insertModalData.검사결과 = "미검사";
    } else toast.warning("수주를 먼저 선택해주세요.");
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// 등록버튼 누르면 실행되는 함수
const insertDataFunction = async () => {
  await delivery.insertData(insertModalData);
  await setInsertModal(false);
  // await search();
  // await pageChangeFirst();
  await delivery.searchDatas("", "수주NO", radioSelect.value, "", "");
};

// ##### 수정 Modal #####
const editModal = ref(false);
const setEditModal = (value: boolean) => {
  if (user_level >= 3) {
    editModal.value = value;
    // search();
    delivery.searchDatas("", "수주NO", radioSelect.value, "", "");
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let editModalData: OrderDelivery; // 수정할 변수
// 수정버튼 누르면 실행되는 함수
const editDataFunction = async () => {
  // await dataManager.editData(editModalData); // await : 이 함수가 끝나야 다음으로 넘어간다
  await delivery.editData(editModalData); // await : 이 함수가 끝나야 다음으로 넘어간다
  // search();
  delivery.searchDatas("", "수주NO", radioSelect.value, "", "");
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
  // await dataManager.deleteData([radioSelect.value]); // await : 이 함수가 끝나야 다음으로 넘어간다
  await delivery.deleteData(checkDebug.value);
  resetCheckBox();
  // search();
  delivery.searchDatas("", "수주NO", radioSelect.value, "", "");
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

// ########################## 수주서 Modal ##########################
// printDocument Modal
const printDocumentModal = ref(false);
const setPrintDocumentModal = (value: boolean) => {
  printDocumentModal.value = value;
};

// ############################################ 완제품 재고 현황 가져오기 ############################################
// 품목등록 모달 설정
const finStockModal = ref(false);
const setFinStockModal = (value: boolean) => {
  finStockModal.value = value;
};

// 모달에서 선택한 품목을 finStocklist에 넣기
const importFinStock = (no: any) => {
  // 품목NO
  insertModalData.품목NO = delivery_finStock.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.품목NO;
  insertModalData.품목구분 = delivery_finStock.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.품목구분;
  insertModalData.품번 = delivery_finStock.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.품번;
  insertModalData.품명 = delivery_finStock.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.품명;
  insertModalData.규격 = delivery_finStock.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.규격;
  insertModalData.단위 = delivery_finStock.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.단위;
  insertModalData.LOT코드 = delivery_finStock.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.LOT코드;
  insertModalData.수량 = delivery_finStock.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.기말재고;
  setFinStockModal(false);
};

// 페이징기능
const currentPage_finStock = ref(1); // 현재페이지
const rowsPerPage_finStock = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_finStock = () => {
  currentPage_finStock.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_delivery_finStock = "/api/order/delivery/finstock";
const delivery_finStock = useSendApi<StockStockFinLOT>(
  url_delivery_finStock,
  currentPage_finStock,
  rowsPerPage_finStock
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_finStock = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "LOT코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "품번", style: "width: 50px; text-align: center;" },
  항목4: { name: "품명", style: "width: 50px; text-align: center;" },
  항목5: { name: "규격", style: "width: 50px; text-align: center;" },
  항목6: { name: "단위", style: "width: 50px; text-align: center;" },
  항목7: { name: "기초재고", style: "width: 50px; text-align: center;" },
  항목8: { name: "입고", style: "width: 50px; text-align: center;" },
  항목9: { name: "출하", style: "width: 50px; text-align: center;" },
  항목10: { name: "기말재고", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_finStock = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_finStock = ref("전체");
const searchInput_finStock = ref("");
const sortKey_finStock = ref("등록일");
const sortOrder_finStock = ref("내림차순");
const sortOrderToggle_finStock = () => {
  sortOrder_finStock.value =
    sortOrder_finStock.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_finStock, sortOrder_finStock], (newValue, oldValue) => {
  search_finStock();
  pageChangeFirst_finStock();
});
const search_finStock = () => {
  // console.log(searchKey.value, searchInput.value);
  delivery_finStock.searchDatas(
    searchDate_finStock.value,
    searchKey_finStock.value,
    searchInput_finStock.value,
    sortKey_finStock.value,
    sortOrder_finStock.value
  );
};

// ################################################## 출하검사요청 ##################################################
// 수입검사 데이터 설정
const url_order_shipment_request = "/api/order/delivery/shipment_request";
const order_shipment_request = useSendApi<QualityShipment>(
  url_order_shipment_request,
  ref(1),
  ref(10)
);
// ########################## 검사요청 모달 설정  ##########################
// 검사요청 모달 설정
let shipmentModalData: QualityShipment = {
  납품NO: 0,
  요청수량: "",
  결과: "미검사",
}; // 등록할 변수
const shipmentModal = ref(false);
const setShipmentModal = (value: boolean) => {
  if (user_level >= 3) {
    shipmentModal.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const shipmentButtonRef = ref(null);
// 요청버튼 누르면 실행되는 함수
const shipmentDataFunction = async () => {
  editModalData.검사결과 = "검사대기";
  await order_shipment_request.insertData(shipmentModalData); // await : 이 함수가 끝나야 다음으로 넘어간다
  await delivery.editData(editModalData);
  toast.success("출하검사를 요청하셨습니다.");
};
</script>
##############################################################################################################
##############################################################################################################
##############################################################################################################

<template>
  <div v-if="user_level >= 2">
    <!--BEGIN : ################## LEVEL1  ####################### -->

    <div
      class="container"
      style="display: flex; max-width: 100%; height: 465px"
    >
      <div class="item" style="flex: 1 1 40%">
        <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
        <div class="grid grid-cols-12 gap-1 mt-1">
          <div
            class="flex flex-wrap items-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
          >
            <!-- <div>
              <Button
                class="shadow-md"
                as="a"
                variant="primary"
                @click="setInsertModal(true)"
                ><Lucide icon="FilePlus" class="w-4 h-4 mr-1" />
                작업등록</Button
              >
            </div>
            <div class="ml-2">
              <Button
                class="shadow-md"
                as="a"
                variant="danger"
                @click="setDeleteModal(true)"
                ><Lucide icon="Trash2" class="w-4 h-4 mr-1" /> 삭제</Button
              >
            </div> -->
            <div class="hidden mx-auto md:block text-slate-500"></div>
            <div class="mr-2">
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
                <option>코드</option>
                <option>품목구분</option>
                <option>품번</option>
                <option>품명</option>
                <option>규격</option>
                <option>단위</option>
                <option>시작일</option>
                <option>비고</option>
              </FormSelect>
            </div>
            <div class="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-2 mr-5">
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
          </div>

          <!-- BEGIN: Pagination-->
          <div
            class="flex flex-wrap items-center col-span-12 mt-0 intro-y sm:flex-nowrap"
          >
            <div>
              <FormSelect v-model="sortKey" class="w-30 mt-3 !box sm:mt-0">
                <option>등록일</option>
                <option>코드</option>
                <option>품목구분</option>
                <option>품번</option>
                <option>품명</option>
                <option>규격</option>
                <option>수량</option>
                <option>시작일</option>
              </FormSelect>
            </div>
            <div class="ml-2">
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
            <div class="ml-2">
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
                @click="resetCheckBox"
              />
            </div>
            <div class="hidden mx-auto md:block text-slate-500"></div>
            <div>
              <span class="mr-3"
                >[ {{ dataManager.dataCount }}개 데이터 조회됨 ]
              </span>
              <span class="mr-5"
                >[ {{ currentPage }} / {{ dataManager.numberOfPages }} 페이지
                ]</span
              >
              <!-- END: Pagination-->
            </div>
          </div>
          <!-- BEGIN: Data List -->
          <!-- style="height: calc(100vh - 350px)" : 브라우저 화면 창크기에 맞게 변경됨 -->
          <div class="col-span-12 overflow-auto intro-y lg:overflow-visible">
            <div
              class="mr-3"
              style="overflow-y: scroll; overflow-x: hidden; height: 350px"
            >
              <Table class="border-spacing-y-[8px] border-separate -mt-2">
                <Table.Thead
                  class="bg-slate-100"
                  style="position: sticky; top: 0px; z-index: 2"
                >
                  <Table.Tr>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting.선택.style"
                    >
                      {{ table_setting.선택.name }}
                    </Table.Th>
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
                    <!-- <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting.진행율.style"
                    >
                      {{ table_setting.진행율.name }}
                    </Table.Th> -->
                    <!-- <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting.편집.style"
                    >
                      {{ table_setting.편집.name }}
                    </Table.Th> -->
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody style="position: relative; z-index: 1">
                  <Table.Tr
                    v-for="(todo, index) in dataManager.datas.value"
                    :key="todo.NO"
                    class="intro-x"
                    htmlFor="radio"
                  >
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      id="radio"
                      :style="table_setting.선택.style"
                    >
                      <input
                        class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                        id="radio"
                        type="radio"
                        :value="todo.NO"
                        v-model="radioSelect"
                      />
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.순번.style"
                    >
                      <div>
                        {{ index + 1 + (currentPage - 1) * rowsPerPage }}
                      </div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목1.style"
                    >
                      <div>
                        <label
                          class="text-blue-500"
                          style="cursor: pointer"
                          @click="setPrintDocumentModal(true)"
                          >{{ todo[table_setting.항목1.name] }}
                        </label>
                      </div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목2.style"
                    >
                      <div>{{ todo[table_setting.항목2.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목3.style"
                    >
                      <div>{{ todo[table_setting.항목3.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목4.style"
                    >
                      <div>{{ todo[table_setting.항목4.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목5.style"
                    >
                      <div>{{ todo[table_setting.항목5.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목6.style"
                    >
                      <div>{{ todo[table_setting.항목6.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목7.style"
                    >
                      <div>{{ todo[table_setting.항목7.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목8.style"
                    >
                      <div>{{ todo[table_setting.항목8.name] }}</div>
                    </Table.Td>
                    <!-- <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.진행율.style"
                    >
                      <div>{{ Number(todo.진행률).toLocaleString() }}%</div>
                      <div class="flex items-center justify-center">
                        <Progress class="h-1">
                          <Progress.Bar
                            class="bg-primary"
                            :style="'width:' + todo.진행률 + '%'"
                            role="progressbar"
                          ></Progress.Bar>
                        </Progress>
                      </div>
                    </Table.Td> -->
                    <!-- <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.편집.style"
                    >
                      <div class="flex items-center justify-center text-danger">
                        <a
                          class="flex items-center mr-3"
                          href="#"
                          @click="
                            () => {
                              setEditModal(true);
                              editModalData = todo;
                            }
                          "
                        >
                          <Lucide icon="Edit" class="w-4 h-4 mr-1" />
                          수정
                        </a>
                      </div>
                    </Table.Td> -->
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
    </div>
    <!--END : ########################################### LEVEL1  ########################################### -->
    <hr class="text-slate-200 intro-y mt-2 mb-1" style="border: solid 1px" />
    <div class="grid grid-cols-2 intro-y">
      <div class="col-span-2">
        <!--BEGIN : ######################################### LEVEL2  ########################################### -->
        <div class="item ml-3" style="flex: 1 1 40%">
          <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
          <div class="grid grid-cols-12 gap-1 mt-1">
            <div
              class="flex flex-wrap items-center col-span-12 mt-1 mb-1 mr-5 intro-y sm:flex-nowrap"
            >
              <div class="flex items-center text-lg">
                <Lucide icon="Send" class="w-5 h-5 mr-1 mb-0.5" /><strong
                  >납품 등록 (LEVEL2)</strong
                >
              </div>
              <div class="hidden mx-auto md:block text-slate-500"></div>
              <span class="mr-3"
                >[ {{ delivery.dataCount }}개 데이터 조회됨 ]
              </span>
              <Button
                class="mr-2 shadow-md"
                style="height: 30px"
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
                style="height: 30px"
                as="a"
                variant="danger"
                @click="
                  () => {
                    setDeleteModal(true);
                  }
                "
              >
                <Lucide icon="Trash2" class="w-4 h-4 mr-2" /> 삭제</Button
              >
            </div>

            <!-- BEGIN: Data List -->
            <!-- style="height: calc(100vh - 350px)" : 브라우저 화면 창크기에 맞게 변경됨 -->
            <div class="col-span-12 overflow-auto intro-y lg:overflow-visible">
              <div
                class="mr-3"
                style="overflow-y: scroll; overflow-x: hidden; height: 212px"
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
                        :style="table_setting_delivery.체크박스.style"
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
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.순번.style"
                      >
                        순번
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.항목1.style"
                      >
                        {{ table_setting_delivery.항목1.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.항목2.style"
                      >
                        {{ table_setting_delivery.항목2.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.항목3.style"
                      >
                        {{ table_setting_delivery.항목3.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.항목4.style"
                      >
                        {{ table_setting_delivery.항목4.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.항목5.style"
                      >
                        {{ table_setting_delivery.항목5.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.항목6.style"
                      >
                        {{ table_setting_delivery.항목6.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.항목7.style"
                      >
                        {{ table_setting_delivery.항목7.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.항목8.style"
                      >
                        {{ table_setting_delivery.항목8.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.출하검사.style"
                      >
                        {{ table_setting_delivery.출하검사.name }}
                      </Table.Th>
                      <!-- <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_delivery.편집.style"
                      >
                        {{ table_setting_delivery.편집.name }}
                      </Table.Th> -->
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody style="position: relative; z-index: 1">
                    <Table.Tr
                      v-for="(todo, index) in delivery.dataSearchAll.value"
                      :key="todo.NO"
                      class="intro-x"
                      htmlFor="radio"
                    >
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        id="checkbox"
                        :style="table_setting_delivery.체크박스.style"
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
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_delivery.순번.style"
                      >
                        <div>
                          {{ index + 1 + (currentPage - 1) * rowsPerPage }}
                        </div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_delivery.항목1.style"
                      >
                        <div>{{ todo[table_setting_delivery.항목1.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_delivery.항목2.style"
                      >
                        <div>{{ todo[table_setting_delivery.항목2.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_delivery.항목3.style"
                      >
                        <div>{{ todo[table_setting_delivery.항목3.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_delivery.항목4.style"
                      >
                        <div>{{ todo[table_setting_delivery.항목4.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_delivery.항목5.style"
                      >
                        <div>{{ todo[table_setting_delivery.항목5.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_delivery.항목6.style"
                      >
                        <div>{{ todo[table_setting_delivery.항목6.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_delivery.항목7.style"
                      >
                        <div>{{ todo[table_setting_delivery.항목7.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        :class="[
                          'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'text-black': todo.검사결과 == '미검사' },
                          { 'text-gray-500': todo.검사결과 == '검사대기' },
                          { 'text-danger': todo.검사결과 == '불합격' },
                          { 'text-success': todo.검사결과 == '합격' },
                        ]"
                        :style="table_setting_delivery.항목8.style"
                      >
                        <div class="flex items-center">
                          <div class="flex mx-auto">
                            <div>
                              <Lucide
                                class="w-5 h-5 mr-1"
                                :icon="
                                  todo.검사결과 == '미검사'
                                    ? 'MinusCircle'
                                    : todo.검사결과 == '검사대기'
                                    ? 'HelpCircle'
                                    : todo.검사결과 == '불합격'
                                    ? 'XCircle'
                                    : todo.검사결과 == '합격'
                                    ? 'CheckCircle'
                                    : 'AlertCircle'
                                "
                              />
                            </div>
                            <div>
                              {{ todo[table_setting_delivery.항목8.name] }}
                            </div>
                          </div>
                        </div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400"
                        :style="table_setting_delivery.출하검사.style"
                      >
                        <div
                          class="flex items-center justify-center text-success"
                        >
                          <Button
                            v-if="
                              todo.검사결과 == '미검사' ||
                              todo.검사결과 == '불합격'
                            "
                            variant="facebook"
                            class="flex items-center"
                            @click="
                              () => {
                                editModalData = todo;
                                shipmentModalData.납품NO = todo.NO;
                                shipmentModalData.요청수량 = todo.수량;
                                shipmentModalData.결과 = '미검사';
                                setShipmentModal(true);
                              }
                            "
                          >
                            <Lucide icon="CheckCircle" class="w-4 h-4 mr-1" />
                            검사요청
                          </Button>
                        </div>
                      </Table.Td>
                      <!-- <Table.Td
                        class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_delivery.편집.style"
                      >
                        <div
                          class="flex items-center justify-center text-danger"
                        >
                          <a
                            class="flex items-center mr-3"
                            href="#"
                            @click="
                              () => {
                                setEditModal(true);
                                editModalData = todo;
                              }
                            "
                          >
                            <Lucide icon="Edit" class="w-4 h-4 mr-1" />
                            수정
                          </a>
                        </div>
                      </Table.Td> -->
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
                <div
                  class="text-center mt-20"
                  v-if="delivery.dataCount.value == 0"
                >
                  저장된 데이터가 없습니다.
                </div>
              </div>
            </div>
            <!-- END: Data List -->
          </div>
        </div>
      </div>
      <!--END : ########################################### LEVEL2  ########################################### -->
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
  <div class="intro-y mt-3 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->

  <!-- #########################################################################################################################
######################################################  납품 모달  ######################################################
######################################################################################################################### -->

  <!-- BEGIN: Insert Modal Content -->
  <Dialog size="md" :open="insertModal" :key="insertModalData?.LOT코드">
    <Dialog.Panel class="p-10 text-center">
      <!--추가 Modal 내용 시작-->
      <div class="mb-5" style="font-weight: bold">등록</div>
      <Tab.Group>
        <Tab.List variant="boxed-tabs">
          <Tab>
            <Tab.Button class="w-full py-2" as="button"> 기본 내용 </Tab.Button>
          </Tab>
          <Tab>
            <Tab.Button class="w-full py-2" as="button"> 추가 내용 </Tab.Button>
          </Tab>
        </Tab.List>
        <Tab.Panels class="mt-5">
          <Tab.Panel class="leading-relaxed">
            <div style="text-align: left">
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">구분</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="insertModalData.구분"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">LOT코드</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="insertModalData.LOT코드"
                  placeholder="이곳을 클릭하여 재고를 선택해주세요."
                  @click="setFinStockModal(true)"
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">품목구분</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="insertModalData.품목구분"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">품번</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="insertModalData.품번"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">품명</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="insertModalData.품명"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">규격</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="insertModalData.규격"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">단위</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="insertModalData.단위"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">수량</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="number"
                  v-model="insertModalData.수량"
                  placeholder=""
                />
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="leading-relaxed">
            <div style="text-align: left">
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-11">비고</FormLabel>
                <FormInput
                  id="vertical-form-11"
                  type="text"
                  v-model="insertModalData.비고"
                  placeholder=""
                />
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <div style="text-align: left">
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="
              async () => {
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
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Insert Modal Content -->
  <!-- BEGIN: Edit Modal Content -->
  <Dialog size="md" :open="editModal">
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">작업지시 수정</div>
      <Tab.Group>
        <Tab.List variant="boxed-tabs">
          <Tab>
            <Tab.Button class="w-full py-2" as="button"> 기본 내용 </Tab.Button>
          </Tab>
          <Tab>
            <Tab.Button class="w-full py-2" as="button"> 추가 내용 </Tab.Button>
          </Tab>
        </Tab.List>
        <Tab.Panels class="mt-5">
          <Tab.Panel class="leading-relaxed">
            <div style="text-align: left">
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-11">비고</FormLabel>
                <FormInput
                  id="vertical-form-11"
                  type="text"
                  v-model="editModalData.비고"
                  placeholder=""
                />
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="leading-relaxed">
            <div style="text-align: left">
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-11">비고</FormLabel>
                <FormInput
                  id="vertical-form-11"
                  type="text"
                  v-model="editModalData.비고"
                  placeholder=""
                />
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <div style="text-align: left">
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="
              () => {
                editDataFunction();
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
    :open="deleteModal"
    @close="
      () => {
        setDeleteModal(false);
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
              setDeleteModal(false);
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
              setDeleteModal(false);
            }
          "
        >
          삭제
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Delete Confirmation Modal -->

  <!-- #########################################################################################################################
#########################################################################################################################
######################################################################################################################### -->

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
      <MasterDetail :data="editModalData" />
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
  <!-- BEGIN: 수주서 확인 Modal -->
  <Dialog
    size="xl"
    :open="printDocumentModal"
    @close="setPrintDocumentModal(false)"
  >
    <Dialog.Panel>
      <div
        class="overflow-hidden intro-y box mb-3"
        style="overflow-y: scroll; overflow-x: hidden; height: 850px"
      >
        <DocumentPrint />
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 수주서 확인 Modal -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: finStock Modal Content -->
  <Dialog size="xxl" :open="finStockModal" @close="setFinStockModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--finStock Modal 내용 시작-->
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
              v-model="searchKey_finStock"
              class="w-30 mt-3 !box sm:mt-0"
            >
              <option>전체</option>
              <option>거래처명</option>
              <option>사업자번호</option>
              <option>주소</option>
              <option>비고</option>
            </FormSelect>
          </div>
          <div class="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-2">
            <div class="relative w-56 text-slate-500">
              <FormInput
                type="text"
                class="w-56 pr-10 !box"
                v-model="searchInput_finStock"
                @keyup.enter="
                  () => {
                    search_finStock();
                    pageChangeFirst_finStock();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_finStock();
                    pageChangeFirst_finStock();
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
              v-model="sortKey_finStock"
              class="w-30 mt-3 !box sm:mt-0"
            >
              <option>등록일</option>
              <option>거래처명</option>
              <option>사업자번호</option>
              <option>주소</option>
            </FormSelect>
          </div>
          <div class="ml-3">
            <Button
              class="shadow-md"
              as="a"
              variant="outline-primary"
              v-if="sortOrder_finStock == '오름차순'"
              @click="sortOrderToggle_finStock"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_finStock }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_finStock == '내림차순'"
              @click="sortOrderToggle_finStock"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_finStock }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_finStock"
              @change="pageChangeFirst_finStock"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="delivery_finStock.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_finStock"
              :numberOfPages="delivery_finStock.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ delivery_finStock.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_finStock }} /
              {{ delivery_finStock.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_finStock.순번.style"
                  >
                    {{ table_setting_finStock.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목1.style"
                  >
                    {{ table_setting_finStock.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목2.style"
                  >
                    {{ table_setting_finStock.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목3.style"
                  >
                    {{ table_setting_finStock.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목4.style"
                  >
                    {{ table_setting_finStock.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목5.style"
                  >
                    {{ table_setting_finStock.항목5.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목6.style"
                  >
                    {{ table_setting_finStock.항목6.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목7.style"
                  >
                    {{ table_setting_finStock.항목7.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목8.style"
                  >
                    {{ table_setting_finStock.항목8.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목9.style"
                  >
                    {{ table_setting_finStock.항목9.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_finStock.항목10.style"
                  >
                    {{ table_setting_finStock.항목10.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in delivery_finStock.datas.value"
                  :key="todo.LOT코드"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.순번.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_finStock - 1) * rowsPerPage_finStock
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목1.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목2.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목3.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목4.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목5.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목5.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목6.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목6.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목7.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목7.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목8.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목8.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목9.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목9.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_finStock.항목10.style"
                    @click="importFinStock(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_finStock.항목10.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="delivery_finStock.dataCount.value == 0"
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
            @click="setFinStockModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: finStock Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: 출하검사요청 Modal -->
  <Dialog
    :open="shipmentModal"
    @close="
      () => {
        setShipmentModal(false);
      }
    "
    :initialFocus="shipmentButtonRef"
  >
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide
          icon="CheckCircle"
          class="w-16 h-16 mx-auto mt-3 text-success"
        />
        <div class="mt-5 text-3xl">출하검사요청</div>
        <div class="mt-2 text-slate-500">출하요청하시겠습니까?</div>

        <!-- <div style="text-align: left">
          <div class="mt-3">
            <FormLabel htmlFor="vertical-form-3">전달사항</FormLabel>
            <FormInput
              id="vertical-form-3"
              type="text"
              v-model="incomingModalData.전달사항"
              placeholder="여기에 특이사항을 입력해주세요"
            />
          </div>
        </div> -->
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          @click="
            () => {
              setShipmentModal(false);
            }
          "
          class="w-24 mr-1"
        >
          취소
        </Button>
        <Button
          variant="primary"
          type="button"
          class="w-24"
          ref="shipmentButtonRef"
          @click="
            () => {
              shipmentDataFunction();
              setShipmentModal(false);
            }
          "
        >
          요청
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 출하검사요청 Modal -->
</template>
