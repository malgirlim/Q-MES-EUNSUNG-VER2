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
  MasterMold,
  MasterMoldItem,
  MasterMoldInspect,
  MasterProduct,
  MasterProcess,
  MasterUser,
} from "../../interfaces/menu/MasterInterface";

// 컴포넌트 로드
import MasterDetail from "../../components/Common/Detail/MasterBOMDetail.vue";
import DocumentPrint from "../../components/Common/Print/Template/TaskAdd(Std)/Main.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.MasterProcess; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  await dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
  await mold_item.loadDatas(); // 금형 생산품목 데이터 불러오기
  await mold_inspect.loadDatas(); // 금형 점검 데이터 불러오기
  await mold_item.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
  await mold_inspect.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값

  await mold_modal_user.loadDatas(); // 담당자 데이터 불러오기
  await mold_modal_item.loadDatas(); // 품목 데이터 불러오기
  await mold_modal_process.loadDatas(); // 공정 데이터 불러오기
});

// 페이징기능
const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst = () => {
  currentPage.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// dataManager 만들기
const url = "/api/mold/mold";
const dataManager = useSendApi<MasterMold>(url, currentPage, rowsPerPage);

// 금형 생산품목 데이터 설정
const url_mold_item = "/api/mold/item";
const mold_item = useSendApi<MasterMoldItem>(url_mold_item, ref(1), ref(10));

// 금형 점검 데이터 설정
const url_mold_inspect = "/api/mold/inspect";
const mold_inspect = useSendApi<MasterMoldInspect>(
  url_mold_inspect,
  ref(1),
  ref(10)
);

// 담당자 데이터 설정
const url_mold_modal_user = "/api/mold/modal/user";
const mold_modal_user = useSendApi<MasterUser>(
  url_mold_modal_user,
  ref(1),
  ref(100)
);

// 품목 데이터 설정
const url_mold_modal_item = "/api/mold/modal/item";
const mold_modal_item = useSendApi<MasterProduct>(
  url_mold_modal_item,
  ref(1),
  ref(100)
);

// 공정 데이터 설정
const url_mold_modal_process = "/api/mold/modal/process";
const mold_modal_process = useSendApi<MasterProcess>(
  url_mold_modal_process,
  ref(1),
  ref(100)
);

// 테이블항목 설정 및 가로크기 조정
const table_setting = {
  체크박스: { name: "체크박스", style: "width: 20px" },
  선택: { name: "선택", style: "width: 20px; text-align: center;" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "공정구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "금형명", style: "width: 50px; text-align: center;" },
  항목4: { name: "등급", style: "width: 50px; text-align: center;" },
  항목5: { name: "규격", style: "width: 50px; text-align: center;" },
  항목6: { name: "공정명", style: "width: 50px; text-align: center;" },
  항목7: { name: "제작사", style: "width: 50px; text-align: center;" },
  항목8: { name: "취득일자", style: "width: 50px; text-align: center;" },
  항목9: { name: "교체수명일", style: "width: 50px; text-align: center;" },
  항목10: { name: "보관장소", style: "width: 50px; text-align: center;" },
  항목11: { name: "사용여부", style: "width: 50px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 50px; text-align: center;" },
  편집: { name: "편집", style: "width: 50px; text-align: center;" },
};
const table_setting_item = {
  체크박스: { name: "체크박스", style: "width: 50px" },
  선택: { name: "선택", style: "width: 50px; text-align: center;" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "품번", style: "width: 50px; text-align: center;" },
  항목2: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "품명", style: "width: 50px; text-align: center;" },
  항목4: { name: "규격", style: "width: 50px; text-align: center;" },
  항목5: { name: "CAVITY", style: "width: 50px; text-align: center;" },
  항목6: { name: "동시여부", style: "width: 50px; text-align: center;" },
  삭제: { name: "삭제", style: "width: 5px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 100px; text-align: center;" },
  편집: { name: "편집", style: "width: 5px; text-align: center;" },
};
const table_setting_inspect = {
  체크박스: { name: "체크박스", style: "width: 50px" },
  선택: { name: "선택", style: "width: 50px; text-align: center;" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "구분", style: "width: 50px; text-align: center;" },
  항목2: { name: "내용", style: "width: 50px; text-align: center;" },
  항목3: { name: "검사방법", style: "width: 50px; text-align: center;" },
  항목4: { name: "기준", style: "width: 50px; text-align: center;" },
  항목5: { name: "단위", style: "width: 50px; text-align: center;" },
  항목6: { name: "최소", style: "width: 50px; text-align: center;" },
  항목7: { name: "최대", style: "width: 50px; text-align: center;" },
  항목8: { name: "담당자", style: "width: 50px; text-align: center;" },
  삭제: { name: "삭제", style: "width: 5px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 100px; text-align: center;" },
  편집: { name: "편집", style: "width: 5px; text-align: center;" },
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

// 라디오 선택하기
const radioSelect: any = ref();
// now2가 변경되면 실행
watch([radioSelect], (newValue, oldValue) => {
  // console.log(oldValue[0], "->", newValue[0]);
  mold_item.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
  mold_inspect.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
});

// ########################## 등록, 수정, 삭제, 상세 Modal ##########################
// ##### 등록 Modal #####
let insertModalData: MasterMold;
const insertModal = ref(false);
const setInsertModal = (value: boolean) => {
  if (user_level >= 3) {
    insertModal.value = value;
    insertModalData = {}; // 변수 초기화
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
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
  if (user_level >= 3) {
    editModal.value = value;
    search();
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let editModalData: MasterMold; // 수정할 변수
// 수정버튼 누르면 실행되는 함수
const editDataFunction = async () => {
  await dataManager.editData(editModalData); // await : 이 함수가 끝나야 다음으로 넘어간다
  await setEditModal(false);
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
  await dataManager.deleteData([radioSelect.value]); // await : 이 함수가 끝나야 다음으로 넘어간다
  await setDeleteModal(false);
  resetCheckBox();
  search();
};

// ##### 상세 Modal #####
const detailModal = ref(false);
const setDetailModal = (value: boolean) => {
  detailModal.value = value;
};

// ########################## LEVEL2 생산 품목 - 등록, 수정, 삭제 Modal ##########################
// ##### LEVEL2 생산 품목 등록 Modal #####
let insertModalData_Item: MasterMoldItem;
const insertModal_Item = ref(false);
const setInsertModalItem = (value: boolean) => {
  if (user_level >= 3) {
    if (radioSelect.value > 0) {
      insertModal_Item.value = value;
      insertModalData_Item = { 금형NO: radioSelect.value }; // 변수 초기화
    } else {
      toast.warning("금형을 선택해주세요.");
    }
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// 등록버튼 누르면 실행되는 함수
const insertDataFunctionItem = async () => {
  await mold_item.insertData(insertModalData_Item);
  await setInsertModalItem(false);
  await mold_item.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ##### LEVEL2 생산 품목 수정 Modal #####
const editModal_Item = ref(false);
const setEditModalItem = (value: boolean) => {
  if (user_level >= 3) {
    editModal_Item.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let editModalData_Item: MasterMoldItem; // 수정할 변수
const editDataFunctionItem = async () => {
  await mold_item.editData(editModalData_Item); // await : 이 함수가 끝나야 다음으로 넘어간다
  await setEditModalItem(false);
  await mold_item.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ##### LEVEL2 생산 품목 삭제 Modal #####
const deleteModal_Item = ref(false);
const setDeleteModalItem = (value: boolean) => {
  if (user_level >= 4) {
    deleteModal_Item.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const deleteButtonRef_Item = ref(null);
// 삭제버튼 누르면 실행되는 함수
const deleteDataFunctionItem = async () => {
  await mold_item.deleteData([editModalData_Item.NO]); // await : 이 함수가 끝나야 다음으로 넘어간다
  await setDeleteModalItem(false);
  await mold_item.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ########################## LEVEL2 점검 목록 - 등록, 수정, 삭제 Modal ##########################
// ##### LEVEL2 점검 목록 등록 Modal #####
let insertModalData_Inspect: MasterMoldInspect;
const insertModal_Inspect = ref(false);
const setInsertModalInspect = (value: boolean) => {
  if (user_level >= 3) {
    if (radioSelect.value > 0) {
      insertModal_Inspect.value = value;
      insertModalData_Inspect = { 금형NO: radioSelect.value }; // 변수 초기화
    } else {
      toast.warning("금형을 선택해주세요.");
    }
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// 등록버튼 누르면 실행되는 함수
const insertDataFunctionInspect = async () => {
  await mold_inspect.insertData(insertModalData_Inspect);
  await setInsertModalInspect(false);
  await mold_inspect.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ##### LEVEL2 생산 품목 수정 Modal #####
const editModal_Inspect = ref(false);
const setEditModalInspect = (value: boolean) => {
  if (user_level >= 3) {
    editModal_Inspect.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let editModalData_Inspect: MasterMoldInspect; // 수정할 변수
const editDataFunctionInspect = async () => {
  await mold_inspect.editData(editModalData_Inspect); // await : 이 함수가 끝나야 다음으로 넘어간다
  await setEditModalInspect(false);
  await mold_inspect.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ##### LEVEL2 생산 품목 삭제 Modal #####
const deleteModal_Inspect = ref(false);
const setDeleteModalInspect = (value: boolean) => {
  if (user_level >= 4) {
    deleteModal_Inspect.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const deleteButtonRef_Inspect = ref(null);
// 삭제버튼 누르면 실행되는 함수
const deleteDataFunctionInspect = async () => {
  await mold_inspect.deleteData([editModalData_Inspect.NO]); // await : 이 함수가 끝나야 다음으로 넘어간다
  await setDeleteModalInspect(false);
  await mold_inspect.searchDatas("", "금형NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
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
            <div>
              <Button
                class="shadow-md"
                as="a"
                variant="primary"
                @click="setInsertModal(true)"
                ><Lucide icon="FilePlus" class="w-4 h-4 mr-1" />
                금형등록</Button
              >
            </div>
            <div class="ml-2">
              <Button
                class="shadow-md"
                as="a"
                variant="danger"
                @click="setDeleteModal(true)"
                ><Lucide icon="Trash2" class="w-4 h-4 mr-1" /> 금형삭제</Button
              >
            </div>
            <div class="hidden mx-auto md:block text-slate-500"></div>
            <div class="mr-2">
              <a href="" class="flex items-center ml-auto text-primary">
                <Lucide icon="RefreshCcw" class="w-4 h-4 mr-3" /> 새로고침
              </a>
            </div>
            <!-- <div>
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
            </div> -->
            <div class="ml-2">
              <FormSelect v-model="searchKey" class="w-30 mt-3 !box sm:mt-0">
                <option>전체</option>
                <option>코드</option>
                <option>취득구분</option>
                <option>공정구분</option>
                <option>금형명</option>
                <option>등급</option>
                <option>규격</option>
                <option>공정명</option>
                <option>제작사</option>
                <option>가격</option>
                <option>취득일자</option>
                <option>교체수명일</option>
                <option>보관장소</option>
                <option>사용여부</option>
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
                <option>취득구분</option>
                <option>공정구분</option>
                <option>금형명</option>
                <option>등급</option>
                <option>규격</option>
                <option>공정명</option>
                <option>제작사</option>
                <option>가격</option>
                <option>취득일자</option>
                <option>교체수명일</option>
                <option>보관장소</option>
                <option>사용여부</option>
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
                      :style="table_setting.상세보기.style"
                    >
                      {{ table_setting.상세보기.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting.편집.style"
                    >
                      {{ table_setting.편집.name }}
                    </Table.Th>
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
                      <div>{{ todo[table_setting.항목1.name] }}</div>
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
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목9.style"
                    >
                      <div>{{ todo[table_setting.항목9.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목10.style"
                    >
                      <div>{{ todo[table_setting.항목10.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목11.style"
                    >
                      <div>{{ todo[table_setting.항목11.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.상세보기.style"
                    >
                      <div
                        class="flex items-center justify-center text-cyan-700"
                      >
                        <a
                          class="flex items-center mr-3"
                          href="#"
                          @click="
                            () => {
                              editModalData = todo;
                              setDetailModal(true);
                            }
                          "
                        >
                          <Lucide icon="ListPlus" class="w-5 h-5 mr-1" />
                          상세
                        </a>
                      </div>
                    </Table.Td>
                    <Table.Td
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
    </div>
    <!--END : ########################################### LEVEL1  ########################################### -->
    <hr class="text-slate-200 intro-y mt-2 mb-1" style="border: solid 1px" />
    <div class="grid grid-cols-2 intro-y">
      <div class="col-span-1">
        <!--BEGIN : ######################################### LEVEL2-생산품목  ########################################### -->
        <div class="item ml-3 border-r-2 mr-2" style="flex: 1 1 40%">
          <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
          <div class="grid grid-cols-12 gap-1 mt-1">
            <div
              class="flex flex-wrap items-center col-span-12 mt-1 mb-1 mr-5 intro-y sm:flex-nowrap"
            >
              <div class="flex items-center text-lg">
                <Lucide icon="Box" class="w-6 h-6 mr-1 mb-0.5" /><strong
                  >생산 품목 목록</strong
                >
              </div>
              <div class="hidden mx-auto md:block text-slate-500"></div>
              <span class="mr-3"
                >[ {{ mold_item.dataCount }}개 데이터 조회됨 ]
              </span>
              <Button
                class="mr-2 shadow-md"
                style="height: 30px"
                as="a"
                variant="primary"
                @click="setInsertModalItem(true)"
              >
                <Lucide icon="FilePlus" class="w-4 h-4 mr-2" />
                등록
              </Button>
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
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_item.항목1.style"
                      >
                        {{ table_setting_item.항목1.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_item.항목2.style"
                      >
                        {{ table_setting_item.항목2.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_item.항목3.style"
                      >
                        {{ table_setting_item.항목3.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_item.항목4.style"
                      >
                        {{ table_setting_item.항목4.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_item.항목5.style"
                      >
                        {{ table_setting_item.항목5.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_item.항목6.style"
                      >
                        {{ table_setting_item.항목6.name }}
                      </Table.Th>
                      <Table.Th
                        class="px-0 text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_item.편집.style"
                      >
                        {{ table_setting_item.편집.name }}
                      </Table.Th>
                      <Table.Th
                        class="px-0 text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_item.삭제.style"
                      >
                        {{ table_setting_item.삭제.name }}
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody style="position: relative; z-index: 1">
                    <Table.Tr
                      v-for="(todo, index) in mold_item.dataSearchAll.value"
                      :key="todo.NO"
                      class="intro-x"
                      htmlFor="radio"
                    >
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_item.항목1.style"
                      >
                        <div>{{ todo[table_setting_item.항목1.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_item.항목2.style"
                      >
                        <div>{{ todo[table_setting_item.항목2.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_item.항목3.style"
                      >
                        <div>{{ todo[table_setting_item.항목3.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_item.항목4.style"
                      >
                        <div>{{ todo[table_setting_item.항목4.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_item.항목5.style"
                      >
                        <div>{{ todo[table_setting_item.항목5.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_item.항목6.style"
                      >
                        <div>{{ todo[table_setting_item.항목6.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_item.편집.style"
                      >
                        <div
                          class="flex items-center justify-center text-danger"
                        >
                          <a
                            class="flex items-center mr-1"
                            href="#"
                            @click="
                              () => {
                                editModalData_Item = todo;
                                setEditModalItem(true);
                              }
                            "
                          >
                            <Lucide icon="Edit" class="w-4 h-4 mr-1" />
                            수정
                          </a>
                        </div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_item.삭제.style"
                      >
                        <div
                          class="flex items-center justify-center text-danger"
                        >
                          <a
                            class="flex items-center mr-1"
                            href="#"
                            @click="
                              () => {
                                editModalData_Item = todo;
                                setDeleteModalItem(true);
                              }
                            "
                          >
                            <Lucide icon="Trash2" class="w-4 h-4 mr-1" />
                            삭제
                          </a>
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
                <div
                  class="text-center mt-20"
                  v-if="mold_item.dataCount.value == 0"
                >
                  저장된 데이터가 없습니다.
                </div>
              </div>
            </div>
            <!-- END: Data List -->
          </div>
        </div>
      </div>
      <!--END : ########################################### LEVEL2-생산품목  ########################################### -->
      <div class="col-span-1">
        <!--BEGIN : ######################################### LEVEL2-점검  ########################################### -->
        <div class="grid grid-cols-8 gap-1 mt-1 mr-2">
          <div
            class="flex flex-wrap items-center col-span-12 mt-1 mb-1 mr-5 intro-y sm:flex-nowrap"
          >
            <div class="flex items-center text-lg">
              <Lucide icon="Clipboard" class="w-6 h-6 mr-1 mb-0.5" /><strong
                >점검 목록</strong
              >
            </div>
            <div class="hidden mx-auto md:block text-slate-500"></div>
            <span class="mr-3"
              >[ {{ mold_inspect.dataCount }}개 데이터 조회됨 ]
            </span>
            <Button
              class="mr-2 shadow-md"
              style="height: 30px"
              as="a"
              variant="primary"
              @click="setInsertModalInspect(true)"
            >
              <Lucide icon="FilePlus" class="w-4 h-4 mr-2" />
              등록
            </Button>
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
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.항목1.style"
                    >
                      {{ table_setting_inspect.항목1.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.항목2.style"
                    >
                      {{ table_setting_inspect.항목2.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.항목3.style"
                    >
                      {{ table_setting_inspect.항목3.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.항목4.style"
                    >
                      {{ table_setting_inspect.항목4.name }}
                    </Table.Th>
                    <Table.Th
                      class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.항목5.style"
                    >
                      {{ table_setting_inspect.항목5.name }}
                    </Table.Th>
                    <Table.Th
                      class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.항목6.style"
                    >
                      {{ table_setting_inspect.항목6.name }}
                    </Table.Th>
                    <Table.Th
                      class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.항목7.style"
                    >
                      {{ table_setting_inspect.항목7.name }}
                    </Table.Th>
                    <Table.Th
                      class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.항목8.style"
                    >
                      {{ table_setting_inspect.항목8.name }}
                    </Table.Th>
                    <Table.Th
                      class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.편집.style"
                    >
                      {{ table_setting_inspect.편집.name }}
                    </Table.Th>
                    <Table.Th
                      class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_inspect.삭제.style"
                    >
                      {{ table_setting_inspect.삭제.name }}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody style="position: relative; z-index: 1">
                  <Table.Tr
                    v-for="(todo, index) in mold_inspect.dataSearchAll.value"
                    :key="todo.NO"
                    class="intro-x"
                  >
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.항목1.style"
                    >
                      <div>{{ todo[table_setting_inspect.항목1.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.항목2.style"
                    >
                      <div>{{ todo[table_setting_inspect.항목2.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.항목3.style"
                    >
                      <div>{{ todo[table_setting_inspect.항목3.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.항목4.style"
                    >
                      <div>{{ todo[table_setting_inspect.항목4.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md px-1 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.항목5.style"
                    >
                      <div>{{ todo[table_setting_inspect.항목5.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md px-1 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.항목6.style"
                    >
                      <div>{{ todo[table_setting_inspect.항목6.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md px-1 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.항목7.style"
                    >
                      <div>{{ todo[table_setting_inspect.항목7.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md px-1 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.항목8.style"
                    >
                      <div>{{ todo[table_setting_inspect.항목8.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md px-1 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.편집.style"
                    >
                      <div class="flex items-center justify-center text-danger">
                        <a
                          class="flex items-center mr-1"
                          href="#"
                          @click="
                            () => {
                              editModalData_Inspect = todo;
                              setEditModalInspect(true);
                            }
                          "
                        >
                          <Lucide icon="Edit" class="w-4 h-4 mr-1" />
                          수정
                        </a>
                      </div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md px-1 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_inspect.삭제.style"
                    >
                      <div class="flex items-center justify-center text-danger">
                        <a
                          class="flex items-center mr-1"
                          href="#"
                          @click="
                            () => {
                              editModalData_Inspect = todo;
                              setDeleteModalInspect(true);
                            }
                          "
                        >
                          <Lucide icon="Trash2" class="w-4 h-4 mr-1" />
                          삭제
                        </a>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
              <div
                class="text-center mt-20"
                v-if="mold_inspect.dataCount.value == 0"
              >
                저장된 데이터가 없습니다.
              </div>
            </div>
          </div>
          <!-- END: Data List -->
        </div>
        <!--END : ################## LEVEL2-점검  ####################### -->
      </div>
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

  <!-- ########################################################################################################################
  ######################################################  금형  ###############################################################
  ######################################################################################################################### -->

  <!-- BEGIN: Insert Modal Content -->
  <Dialog size="md" :open="insertModal">
    <Dialog.Panel class="p-10 text-center">
      <!--추가 Modal 내용 시작-->
      <div class="mb-5" style="font-weight: bold">금형 등록</div>
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
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">코드</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="insertModalData.코드"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">취득구분</FormLabel>
                <FormSelect v-model="insertModalData.취득구분" class="">
                  <option>사급</option>
                  <option>제작</option>
                  <option>변형</option>
                </FormSelect>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-3">공정구분</FormLabel>
                <FormSelect v-model="insertModalData.공정구분" class="">
                  <option>사출</option>
                  <option>조립</option>
                  <option>사상</option>
                  <option>테스트</option>
                </FormSelect>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">금형명</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="insertModalData.금형명"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-5">등급</FormLabel>
                <FormInput
                  id="vertical-form-5"
                  type="text"
                  v-model="insertModalData.등급"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-6">규격</FormLabel>
                <FormInput
                  id="vertical-form-6"
                  type="text"
                  v-model="insertModalData.규격"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-7">사용여부</FormLabel>
                <FormSelect v-model="insertModalData.사용여부" class="">
                  <option>Y</option>
                  <option>N</option>
                </FormSelect>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="leading-relaxed">
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-8">공정</FormLabel>
                <select v-tom v-model="insertModalData.공정NO">
                  <option value="" selected>=== 추가 선택 ===</option>
                  <option
                    :value="p.NO"
                    v-for="p in mold_modal_process.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.코드 }} # 공정명:{{ p.공정명 }} # 설비:{{ p.설비 }}
                  </option>
                </select>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-9">제작사</FormLabel>
                <FormInput
                  id="vertical-form-9"
                  type="text"
                  v-model="insertModalData.제작사"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-10">가격</FormLabel>
                <FormInput
                  id="vertical-form-10"
                  type="number"
                  v-model="insertModalData.가격"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-11">취득일자</FormLabel>
                <FormInput
                  id="vertical-form-11"
                  type="date"
                  v-model="insertModalData.취득일자"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-12">교체수명일</FormLabel>
                <FormInput
                  id="vertical-form-12"
                  type="date"
                  v-model="insertModalData.교체수명일"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-13">보관장소</FormLabel>
                <FormInput
                  id="vertical-form-13"
                  type="text"
                  v-model="insertModalData.보관장소"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-14">사진</FormLabel>
                <FormInput
                  id="vertical-form-14"
                  type="file"
                  v-model="insertModalData.사진"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-15">비고</FormLabel>
                <FormInput
                  id="vertical-form-15"
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
      <div class="mb-5" style="font-weight: bold">금형 수정</div>
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
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">코드</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="editModalData.코드"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">취득구분</FormLabel>
                <FormSelect v-model="editModalData.취득구분" class="">
                  <option>사급</option>
                  <option>제작</option>
                  <option>변형</option>
                </FormSelect>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-3">공정구분</FormLabel>
                <FormSelect v-model="editModalData.공정구분" class="">
                  <option>사출</option>
                  <option>조립</option>
                  <option>사상</option>
                  <option>테스트</option>
                </FormSelect>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">금형명</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="editModalData.금형명"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-5">등급</FormLabel>
                <FormInput
                  id="vertical-form-5"
                  type="text"
                  v-model="editModalData.등급"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-6">규격</FormLabel>
                <FormInput
                  id="vertical-form-6"
                  type="text"
                  v-model="editModalData.규격"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-7">사용여부</FormLabel>
                <FormSelect v-model="editModalData.사용여부" class="">
                  <option>Y</option>
                  <option>N</option>
                </FormSelect>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="leading-relaxed">
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-8">공정</FormLabel>
                <select v-tom v-model="editModalData.공정NO">
                  <option
                    v-if="editModalData.공정NO"
                    :value="editModalData.공정NO"
                    selected
                  >
                    {{
                      mold_modal_process.dataAll.value.filter(
                        (c) => c.NO == editModalData.공정NO
                      )[0].코드
                    }}
                    # 공정명:{{
                      mold_modal_process.dataAll.value.filter(
                        (c) => c.NO == editModalData.공정NO
                      )[0].공정명
                    }}
                    # 설비:{{
                      mold_modal_process.dataAll.value.filter(
                        (c) => c.NO == editModalData.공정NO
                      )[0].설비
                    }}
                  </option>
                  <option v-if="!editModalData.공정NO" value="" selected>
                    === 추가 선택 ===
                  </option>
                  <option
                    :value="p.NO"
                    v-for="p in mold_modal_process.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.코드 }} # 공정명:{{ p.공정명 }} # 설비:{{ p.설비 }}
                  </option>
                </select>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-9">제작사</FormLabel>
                <FormInput
                  id="vertical-form-9"
                  type="text"
                  v-model="editModalData.제작사"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-10">가격</FormLabel>
                <FormInput
                  id="vertical-form-10"
                  type="number"
                  v-model="editModalData.가격"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-11">취득일자</FormLabel>
                <FormInput
                  id="vertical-form-11"
                  type="date"
                  v-model="editModalData.취득일자"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-12">교체수명일</FormLabel>
                <FormInput
                  id="vertical-form-12"
                  type="date"
                  v-model="editModalData.교체수명일"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-13">보관장소</FormLabel>
                <FormInput
                  id="vertical-form-13"
                  type="text"
                  v-model="editModalData.보관장소"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-14">사진</FormLabel>
                <FormInput
                  id="vertical-form-14"
                  type="file"
                  v-model="editModalData.사진"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-15">비고</FormLabel>
                <FormInput
                  id="vertical-form-15"
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
            }
          "
        >
          삭제
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Delete Confirmation Modal -->

  <!-- ########################################################################################################################
  ######################################################  생산품목  ###############################################################
  ######################################################################################################################### -->

  <!-- BEGIN: Insert Modal Content -->
  <Dialog size="md" :open="insertModal_Item">
    <Dialog.Panel class="p-10 text-center">
      <!--추가 Modal 내용 시작-->
      <div class="mb-5" style="font-weight: bold">생산품목 등록</div>
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
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">품목</FormLabel>
                <select v-tom v-model="insertModalData_Item.품목NO">
                  <option value="" selected>=== 필수 선택 ===</option>
                  <option
                    :value="p.NO"
                    v-for="p in mold_modal_item.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.품번 }} # 품목구분:{{ p.품목구분 }} # 품명:{{
                      p.품명
                    }}
                    # 규격:{{ p.규격 }}
                  </option>
                </select>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">CAVITY</FormLabel>
                <FormInput
                  id="vertical-form-2"
                  type="text"
                  v-model="insertModalData_Item.CAVITY"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">동시여부</FormLabel>
                <FormSelect v-model="insertModalData_Item.동시여부" class="">
                  <option>Y</option>
                  <option>N</option>
                </FormSelect>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="leading-relaxed">
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-15">비고</FormLabel>
                <FormInput
                  id="vertical-form-15"
                  type="text"
                  v-model="insertModalData_Item.비고"
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
                insertDataFunctionItem();
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setInsertModalItem(false);
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
  <Dialog
    size="md"
    :open="editModal_Item"
    @close="
      () => {
        setEditModalItem(false);
      }
    "
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">생산품목 수정</div>
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
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">품목</FormLabel>
                <select v-tom v-model="editModalData_Item.품목NO">
                  <option
                    v-if="editModalData_Item.품목NO"
                    :value="editModalData_Item.품목NO"
                    selected
                  >
                    {{
                      mold_modal_item.dataAll.value.filter(
                        (c) => c.NO == editModalData_Item.품목NO
                      )[0].품번
                    }}
                    # 품목구분:{{
                      mold_modal_item.dataAll.value.filter(
                        (c) => c.NO == editModalData_Item.품목NO
                      )[0].품목구분
                    }}
                    # 품명:{{
                      mold_modal_item.dataAll.value.filter(
                        (c) => c.NO == editModalData_Item.품목NO
                      )[0].품명
                    }}
                    # 규격:{{
                      mold_modal_item.dataAll.value.filter(
                        (c) => c.NO == editModalData_Item.품목NO
                      )[0].규격
                    }}
                  </option>
                  <option v-if="!editModalData_Item.품목NO" value="" selected>
                    === 필수 선택 ===
                  </option>
                  <option
                    :value="p.NO"
                    v-for="p in mold_modal_item.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.품번 }} # 품목구분:{{ p.품목구분 }} # 품명:{{
                      p.품명
                    }}
                    # 규격:{{ p.규격 }}
                  </option>
                </select>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">CAVITY</FormLabel>
                <FormInput
                  id="vertical-form-2"
                  type="text"
                  v-model="editModalData_Item.CAVITY"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">동시여부</FormLabel>
                <FormSelect v-model="editModalData_Item.동시여부" class="">
                  <option>Y</option>
                  <option>N</option>
                </FormSelect>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="leading-relaxed">
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-15">비고</FormLabel>
                <FormInput
                  id="vertical-form-15"
                  type="text"
                  v-model="editModalData_Item.비고"
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
                editDataFunctionItem();
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setEditModalItem(false);
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
    :open="deleteModal_Item"
    @close="
      () => {
        setDeleteModalItem(false);
      }
    "
    :initialFocus="deleteButtonRef_Item"
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
              setDeleteModaItem(false);
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
          ref="deleteButtonRef_Item"
          @click="
            () => {
              deleteDataFunctionItem();
            }
          "
        >
          삭제
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Delete Confirmation Modal -->

  <!-- ########################################################################################################################
  ######################################################  점검목록  ###############################################################
  ######################################################################################################################### -->

  <!-- BEGIN: Insert Modal Content -->
  <Dialog size="md" :open="insertModal_Inspect">
    <Dialog.Panel class="p-10 text-center">
      <!--추가 Modal 내용 시작-->
      <div class="mb-5" style="font-weight: bold">점검 등록</div>
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
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">구분</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="insertModalData_Inspect.구분"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">내용</FormLabel>
                <FormInput
                  id="vertical-form-2"
                  type="text"
                  v-model="insertModalData_Inspect.내용"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-3">검사방법</FormLabel>
                <FormSelect v-model="insertModalData_Inspect.검사방법" class="">
                  <option>육안검사</option>
                  <option>치수검사</option>
                </FormSelect>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">기준</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="insertModalData_Inspect.기준"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-5">단위</FormLabel>
                <FormInput
                  id="vertical-form-5"
                  type="text"
                  v-model="insertModalData_Inspect.단위"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-6">최소</FormLabel>
                <FormInput
                  id="vertical-form-6"
                  type="number"
                  v-model="insertModalData_Inspect.최소"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-7">최대</FormLabel>
                <FormInput
                  id="vertical-form-7"
                  type="number"
                  v-model="insertModalData_Inspect.최대"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-8">담당자</FormLabel>
                <select v-tom v-model="insertModalData_Inspect.담당자ID">
                  <option value="" selected>=== 필수 선택 ===</option>
                  <option
                    :value="p.아이디"
                    v-for="p in mold_modal_user.dataAll.value"
                    :key="p.아이디"
                  >
                    {{ p.이름 }} # 부서명:{{ p.부서명 }} # 직급:{{ p.직급 }}
                  </option>
                </select>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="leading-relaxed">
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-15">비고</FormLabel>
                <FormInput
                  id="vertical-form-15"
                  type="text"
                  v-model="insertModalData_Inspect.비고"
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
                insertDataFunctionInspect();
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setInsertModalInspect(false);
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
  <Dialog
    size="md"
    :open="editModal_Inspect"
    @close="
      () => {
        setEditModalInspect(false);
      }
    "
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">점검 수정</div>
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
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-1">구분</FormLabel>
                <FormInput
                  id="vertical-form-1"
                  type="text"
                  v-model="editModalData_Inspect.구분"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">내용</FormLabel>
                <FormInput
                  id="vertical-form-2"
                  type="text"
                  v-model="editModalData_Inspect.내용"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-3">검사방법</FormLabel>
                <FormSelect v-model="editModalData_Inspect.검사방법" class="">
                  <option>육안검사</option>
                  <option>치수검사</option>
                </FormSelect>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">기준</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="editModalData_Inspect.기준"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-5">단위</FormLabel>
                <FormInput
                  id="vertical-form-5"
                  type="text"
                  v-model="editModalData_Inspect.단위"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-6">최소</FormLabel>
                <FormInput
                  id="vertical-form-6"
                  type="number"
                  v-model="editModalData_Inspect.최소"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-7">최대</FormLabel>
                <FormInput
                  id="vertical-form-7"
                  type="number"
                  v-model="editModalData_Inspect.최대"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-8">담당자</FormLabel>
                <select v-tom v-model="editModalData_Inspect.담당자ID">
                  <option
                    v-if="editModalData_Inspect.담당자ID"
                    :value="editModalData_Inspect.담당자ID"
                    selected
                  >
                    {{
                      mold_modal_user.dataAll.value.filter(
                        (c) => c.아이디 == editModalData_Inspect.담당자ID
                      )[0].이름
                    }}
                    # 부서명:{{
                      mold_modal_user.dataAll.value.filter(
                        (c) => c.아이디 == editModalData_Inspect.담당자ID
                      )[0].부서명
                    }}
                    # 직급:{{
                      mold_modal_user.dataAll.value.filter(
                        (c) => c.아이디 == editModalData_Inspect.담당자ID
                      )[0].직급
                    }}
                  </option>
                  <option v-if="!editModalData_Inspect.품목NO" value="">
                    === 필수 선택 ===
                  </option>
                  <option
                    :value="p.아이디"
                    v-for="p in mold_modal_user.dataAll.value"
                    :key="p.아이디"
                  >
                    {{ p.이름 }} # 부서명:{{ p.부서명 }} # 직급:{{ p.직급 }}
                  </option>
                </select>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="leading-relaxed">
            <div
              style="
                text-align: left;
                overflow-y: scroll;
                overflow-x: hidden;
                height: 500px;
              "
            >
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-15">비고</FormLabel>
                <FormInput
                  id="vertical-form-15"
                  type="text"
                  v-model="editModalData_Inspect.비고"
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
                editDataFunctionInspect();
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setEditModalInspect(false);
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
    :open="deleteModal_Inspect"
    @close="
      () => {
        setDeleteModalInspect(false);
      }
    "
    :initialFocus="deleteButtonRef_Inspect"
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
              setDeleteModaInspect(false);
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
          ref="deleteButtonRef_Inspect"
          @click="
            () => {
              deleteDataFunctionInspect();
            }
          "
        >
          삭제
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Delete Confirmation Modal -->

  <!-- ########################################################################################################################
  ######################################################  상세  ###############################################################
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
</template>
