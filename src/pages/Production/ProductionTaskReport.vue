<script setup lang="ts">
import { ref, Ref, onMounted, watch, getCurrentInstance } from "vue";
import router from "../../router";
import Button from "../../base-components/Button";
import { FormInput, FormSelect, FormCheck } from "../../base-components/Form";
import Lucide from "../../base-components/Lucide";
import { Dialog, Menu } from "../../base-components/Headless";
import Table from "../../base-components/Table";
import moment from "moment";
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
  MasterProduct,
  MasterProcess,
  MasterFacility,
  MasterUser,
  MasterDefect,
  MasterNonWork,
} from "../../interfaces/menu/MasterInterface";
import {
  StockItemReceive,
  StockProcess,
} from "../../interfaces/menu/stockInterface";
import {
  ProductionResult,
  ProductionResultUseItem,
  ProductionResultDefect,
  ProductionResultNonWork,
} from "../../interfaces/menu/productionInterface";

// 컴포넌트 로드
import MasterDetail from "../../components/Common/Detail/MasterBOMDetail.vue";
import DocumentPrint from "../../components/Common/Print/Template/TaskAdd(Std)/Main.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.ProductionTaskReport; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  await dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
  await result_defect.loadDatas(); // 불량사유
  await result_nonwork.loadDatas(); // 비가동사유
  await result_useitem.loadDatas(); // 투입자재
  await result_useitem.searchDatas("", "생산실적NO", "0", "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
  await result_defect.searchDatas("", "생산실적NO", "0", "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
  await result_nonwork.searchDatas("", "생산실적NO", "0", "", ""); //날짜,조회기준,조회값,정렬기준,정렬값

  await task_modal_user.loadDatas(); // 작업자 데이터 불러오기
  await task_modal_facility.loadDatas(); // 설비 데이터 불러오기
  await task_modal_itemProcess.loadDatas(); // 품목재공 데이터 불러오기
  await task_modal_defect.loadDatas(); // 불량 데이터 불러오기
  await task_modal_nonwork.loadDatas(); // 비가동 데이터 불러오기
});

// 페이징기능
const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst = () => {
  currentPage.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// dataManager 만들기
const url = "/api/production/result";
const dataManager = useSendApi<ProductionResult>(url, currentPage, rowsPerPage);

// 투입자재 데이터 설정
const url_result_useitem = "/api/production/result/useitem";
const result_useitem = useSendApi<ProductionResultUseItem>(
  url_result_useitem,
  ref(1),
  ref(10)
);
// 불량사유 데이터 설정
const url_result_defect = "/api/production/result/defect";
const result_defect = useSendApi<ProductionResultDefect>(
  url_result_defect,
  ref(1),
  ref(10)
);
// 비가동사유 데이터 설정
const url_result_nonwork = "/api/production/result/nonwork";
const result_nonwork = useSendApi<ProductionResultNonWork>(
  url_result_nonwork,
  ref(1),
  ref(10)
);

// 테이블항목 설정 및 가로크기 조정
const table_setting = {
  체크박스: { name: "체크박스", style: "width: 20px" },
  선택: { name: "선택", style: "width: 20px; text-align: center;" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "작업코드", style: "width: 100px; text-align: center;" },
  항목2: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "품번", style: "width: 50px; text-align: center;" },
  항목4: { name: "품명", style: "width: 150px; text-align: center;" },
  항목5: { name: "규격", style: "width: 50px; text-align: center;" },
  항목6: { name: "단위", style: "width: 50px; text-align: center;" },
  항목7: { name: "지시수량", style: "width: 50px; text-align: center;" },
  항목8: { name: "공정", style: "width: 50px; text-align: center;" },
  항목9: { name: "설비명", style: "width: 50px; text-align: center;" },
  항목10: { name: "작업자", style: "width: 50px; text-align: center;" },
  항목11: { name: "시작일시", style: "width: 50px; text-align: center;" },
  항목12: { name: "종료일시", style: "width: 50px; text-align: center;" },
  항목13: { name: "생산수", style: "width: 50px; text-align: center;" },
  항목14: { name: "불량수", style: "width: 50px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 50px; text-align: center;" },
  편집: { name: "편집", style: "width: 50px; text-align: center;" },
};
const table_setting_defect = {
  체크박스: { name: "체크박스", style: "width: 50px" },
  선택: { name: "선택", style: "width: 50px; text-align: center;" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "불량코드", style: "width: 150px; text-align: center;" },
  항목2: { name: "구분", style: "width: 150px; text-align: center;" },
  항목3: { name: "불량명", style: "width: 100px; text-align: center;" },
  항목4: { name: "수량", style: "width: 100px; text-align: center;" },
  항목5: { name: "항목5", style: "width: 50px; text-align: center;" },
  항목6: { name: "항목6", style: "width: 50px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
  삭제: { name: "삭제", style: "width: 5px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 100px; text-align: center;" },
  편집: { name: "편집", style: "width: 5px; text-align: center;" },
};
const table_setting_nonwork = {
  체크박스: { name: "체크박스", style: "width: 50px" },
  선택: { name: "선택", style: "width: 50px; text-align: center;" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "비가동코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "비가동명", style: "width: 50px; text-align: center;" },
  항목4: { name: "내용", style: "width: 50px; text-align: center;" },
  항목5: { name: "시작일시", style: "width: 50px; text-align: center;" },
  항목6: { name: "종료일시", style: "width: 50px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
  삭제: { name: "삭제", style: "width: 5px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 100px; text-align: center;" },
  편집: { name: "편집", style: "width: 5px; text-align: center;" },
};
const table_setting_useitem = {
  체크박스: { name: "체크박스", style: "width: 50px" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "LOT코드", style: "width: 100px; text-align: center;" },
  항목2: { name: "품목구분", style: "width: 100px; text-align: center;" },
  항목3: { name: "품명", style: "width: 150px; text-align: center;" },
  항목4: { name: "규격", style: "width: 100px; text-align: center;" },
  항목5: { name: "단위", style: "width: 50px; text-align: center;" },
  항목6: { name: "수량", style: "width: 100px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
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
const max_year = moment().format("YYYY");
const min_year = moment().add(-3, "years").format("YYYY");
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
  result_useitem.searchDatas("", "생산실적NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
  result_defect.searchDatas("", "생산실적NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
  result_nonwork.searchDatas("", "생산실적NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
});

// ########################## 등록, 수정, 삭제, 상세 Modal ##########################
// ##### 등록 Modal #####
let insertModalData: ProductionResult;
const insertModal = ref(false);
const setInsertModal = (value: boolean) => {
  if (user_level >= 3) {
    // insertModal.value = value;
    // insertModalData = {}; // 변수 초기화
    router.push("task-current");
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// 등록버튼 누르면 실행되는 함수
const insertDataFunction = async () => {
  // await dataManager.insertData(insertModalData);
  // await setInsertModal(false);
  // await search();
  // await pageChangeFirst();
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
let editModalData: ProductionResult; // 수정할 변수
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
  await dataManager.deleteData([radioSelect.value]); // await : 이 함수가 끝나야 다음으로 넘어간다
  resetCheckBox();
  search();
};

// ##### 상세 Modal #####
const detailModal = ref(false);
const setDetailModal = (value: boolean) => {
  detailModal.value = value;
};

// ################### LEVEL2 등록 Modal ###################

// ##### LEVEL2 불량 등록 Modal #####
let insertModalData_Defect: ProductionResultDefect;
const insertModal_Defect = ref(false);
const setInsertModalDefect = (value: boolean) => {
  if (user_level >= 3) {
    if (radioSelect.value > 0) {
      insertModal_Defect.value = value;
      insertModalData_Defect = { 생산실적NO: radioSelect.value }; // 변수 초기화
    } else {
      toast.warning("생산실적을 선택해주세요.");
    }
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const insertDataFunction_Defect = async () => {
  await result_defect.insertData(insertModalData_Defect);
  await setInsertModalDefect(false);
  await search();
  await result_defect.searchDatas("", "생산실적NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ##### LEVEL2 비가동 등록 Modal #####
let insertModalData_Nonwork: ProductionResultNonWork;
const insertModal_Nonwork = ref(false);
const setInsertModalNonwork = (value: boolean) => {
  if (user_level >= 3) {
    if (radioSelect.value > 0) {
      insertModal_Nonwork.value = value;
      insertModalData_Nonwork = { 생산실적NO: radioSelect.value }; // 변수 초기화
    } else {
      toast.warning("생산실적을 선택해주세요.");
    }
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const insertDataFunction_Nonwork = async () => {
  await result_nonwork.insertData(insertModalData_Nonwork);
  await setInsertModalNonwork(false);
  await result_nonwork.searchDatas("", "생산실적NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ##### LEVEL2 투입자재 등록 Modal #####
let insertModalData_Useitem: ProductionResultUseItem;
const insertModal_Useitem = ref(false);
const setInsertModalUseitem = (value: boolean) => {
  if (user_level >= 3) {
    if (radioSelect.value > 0) {
      insertModal_Useitem.value = value;
      insertModalData_Useitem = { 생산실적NO: radioSelect.value }; // 변수 초기화
    } else {
      toast.warning("생산실적을 선택해주세요.");
    }
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const insertDataFunction_Useitem = async () => {
  await result_useitem.insertData(insertModalData_Useitem);
  await setInsertModalUseitem(false);
  await result_useitem.searchDatas("", "생산실적NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ################### LEVEL2 수정 Modal ###################

// ##### Level2 불량 수정 Modal #####
const level2_defect_editModal = ref(false);
const setLevel2DefectEditModal = (value: boolean) => {
  if (user_level >= 4) {
    level2_defect_editModal.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let editModalData_Defect: ProductionResultDefect; // 수정할 변수
const editDataFunction_Defect = async () => {
  await result_defect.editData(editModalData_Defect); // await : 이 함수가 끝나야 다음으로 넘어간다
  await setLevel2DefectEditModal(false);
  await search();
  await result_defect.searchDatas("", "생산실적NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ##### Level2 비가동 수정 Modal #####
const level2_nonwork_editModal = ref(false);
const setLevel2NonworkEditModal = (value: boolean) => {
  if (user_level >= 4) {
    level2_nonwork_editModal.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let editModalData_Nonwork: ProductionResultNonWork; // 수정할 변수
const editDataFunction_Nonwork = async () => {
  await result_nonwork.editData(editModalData_Nonwork); // await : 이 함수가 끝나야 다음으로 넘어간다
  await setLevel2NonworkEditModal(false);
  await result_nonwork.searchDatas("", "생산실적NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
};

// ##### Level2 투입자재 수정 Modal #####
// const level2_useitem_editModal = ref(false);
// const setLevel2UseitemEditModal = (value: boolean) => {
//   if (user_level >= 4) {
//     level2_useitem_editModal.value = value;
//   } else {
//     toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
//   }
// };
// let editModalData_Useitem: ProductionResultUseItem; // 수정할 변수
// const editDataFunction_Useitem = async () => {
//   await result_useitem.editData(editModalData_Useitem); // await : 이 함수가 끝나야 다음으로 넘어간다
//   await setLevel2UseitemEditModal(false);
//   await result_useitem.searchDatas("", "생산실적NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
// };

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
    "재고관리_원자재사용등록" +
      moment().format("YYMMDD_HHmmss") +
      "_export.xlsx"
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
      //     fd.출고일시 = moment().format("YYYY-MM-DD HH:mm:ss");
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

// ############################################### 설비 가져오기 ###############################################
// 페이징기능
const currentPage_facility = ref(1); // 현재페이지
const rowsPerPage_facility = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_facility = () => {
  currentPage_facility.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_task_modal_facility = "/api/production/task/modal/facility";
const task_modal_facility = useSendApi<MasterFacility>(
  url_task_modal_facility,
  currentPage_facility,
  rowsPerPage_facility
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_facility = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "라인", style: "width: 50px; text-align: center;" },
  항목2: { name: "설비명", style: "width: 50px; text-align: center;" },
  항목3: { name: "규격", style: "width: 50px; text-align: center;" },
  항목4: { name: "항목4", style: "width: 50px; text-align: center;" },
  항목5: { name: "항목5", style: "width: 50px; text-align: center;" },
  항목6: { name: "항목6", style: "width: 50px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_facility = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_facility = ref("전체");
const searchInput_facility = ref("");
const sortKey_facility = ref("등록일");
const sortOrder_facility = ref("내림차순");
const sortOrderToggle_facility = () => {
  sortOrder_facility.value =
    sortOrder_facility.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_facility, sortOrder_facility], (newValue, oldValue) => {
  search_facility();
  pageChangeFirst_facility();
});
const search_facility = () => {
  // console.log(searchKey.value, searchInput.value);
  task_modal_facility.searchDatas(
    searchDate_facility.value,
    searchKey_facility.value,
    searchInput_facility.value,
    sortKey_facility.value,
    sortOrder_facility.value
  );
};
// ########################## 모달 설정 ##########################
// 설비등록 모달 설정
const facilityModal = ref(false);
const setFacilityModal = (value: boolean) => {
  facilityModal.value = value;
};

// 모달에서 선택한 품목을 facilitylist에 넣기
const importFacility = (no: any) => {
  editModalData.설비NO = no;
  editModalData.설비명 = task_modal_facility.dataAll.value.filter(
    (c) => c.NO == no
  )[0]?.설비명;
  setFacilityModal(false);
};

// ############################################### 작업자 가져오기 ###############################################

// 페이징기능
const currentPage_user = ref(1); // 현재페이지
const rowsPerPage_user = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_user = () => {
  currentPage_user.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_task_modal_user = "/api/production/task/modal/user";
const task_modal_user = useSendApi<MasterUser>(
  url_task_modal_user,
  currentPage_user,
  rowsPerPage_user
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_user = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "아이디", style: "width: 50px; text-align: center;" },
  항목2: { name: "이름", style: "width: 200px; text-align: center;" },
  항목3: { name: "부서명", style: "width: 50px; text-align: center;" },
  항목4: { name: "직책", style: "width: 50px; text-align: center;" },
  항목5: { name: "직급", style: "width: 50px; text-align: center;" },
  항목6: { name: "항목6", style: "width: 50px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_user = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_user = ref("전체");
const searchInput_user = ref("");
const sortKey_user = ref("등록일");
const sortOrder_user = ref("내림차순");
const sortOrderToggle_user = () => {
  sortOrder_user.value =
    sortOrder_user.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_user, sortOrder_user], (newValue, oldValue) => {
  search_user();
  pageChangeFirst_user();
});
const search_user = () => {
  // console.log(searchKey.value, searchInput.value);
  task_modal_user.searchDatas(
    searchDate_user.value,
    searchKey_user.value,
    searchInput_user.value,
    sortKey_user.value,
    sortOrder_user.value
  );
};
// ########################## 모달 설정 ##########################
// 작업자등록 모달 설정
const userModal = ref(false);
const setUserModal = (value: boolean) => {
  userModal.value = value;
};

// 모달에서 선택한 품목을 userlist에 넣기
const importUser = (no: any) => {
  editModalData.작업자ID = no;
  editModalData.작업자 = task_modal_user.dataAll.value.filter(
    (c) => c.아이디 == no
  )[0]?.이름;
  setUserModal(false);
};

// ############################################### 품목재공현황 가져오기 ###############################################
// 페이징기능
const currentPage_itemProcess = ref(1); // 현재페이지
const rowsPerPage_itemProcess = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_itemProcess = () => {
  currentPage_itemProcess.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_task_modal_itemProcess =
  "/api/production/task/modal/itemprocessstock";
const task_modal_itemProcess = useSendApi<StockProcess>(
  url_task_modal_itemProcess,
  currentPage_itemProcess,
  rowsPerPage_itemProcess
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_itemProcess = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "작업코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "공정", style: "width: 50px; text-align: center;" },
  항목3: { name: "LOT코드", style: "width: 50px; text-align: center;" },
  항목4: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목5: { name: "품명", style: "width: 50px; text-align: center;" },
  항목6: { name: "규격", style: "width: 50px; text-align: center;" },
  항목7: { name: "단위", style: "width: 50px; text-align: center;" },
  항목8: { name: "불출수", style: "width: 50px; text-align: center;" },
  항목9: { name: "사용수", style: "width: 50px; text-align: center;" },
  항목10: { name: "재공수", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_itemProcess = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_itemProcess = ref("전체");
const searchInput_itemProcess = ref("");
const sortKey_itemProcess = ref("등록일");
const sortOrder_itemProcess = ref("내림차순");
const sortOrderToggle_itemProcess = () => {
  sortOrder_itemProcess.value =
    sortOrder_itemProcess.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_itemProcess, sortOrder_itemProcess], (newValue, oldValue) => {
  search_itemProcess();
  pageChangeFirst_itemProcess();
});
const search_itemProcess = () => {
  // console.log(searchKey.value, searchInput.value);
  task_modal_itemProcess.searchDatas(
    searchDate_itemProcess.value,
    searchKey_itemProcess.value,
    searchInput_itemProcess.value,
    sortKey_itemProcess.value,
    sortOrder_itemProcess.value
  );
};

// ########################## 모달 설정 ##########################
const itemProcessModal = ref(false);
const setItemProcessModal = (value: boolean) => {
  itemProcessModal.value = value;
};

// 모달에서 선택한 품목을 itemProcesslist에 넣기
const importItemProcess = (작업지시공정no: any, lot코드: any) => {
  insertModalData_Useitem.품목NO = task_modal_itemProcess.dataAll.value.filter(
    (c) => c.작업지시공정NO == 작업지시공정no && c.LOT코드 == lot코드
  )[0].품목NO;
  insertModalData_Useitem.LOT코드 = task_modal_itemProcess.dataAll.value.filter(
    (c) => c.작업지시공정NO == 작업지시공정no && c.LOT코드 == lot코드
  )[0].LOT코드;
  insertModalData_Useitem.품목구분 =
    task_modal_itemProcess.dataAll.value.filter(
      (c) => c.작업지시공정NO == 작업지시공정no && c.LOT코드 == lot코드
    )[0].품목구분;
  insertModalData_Useitem.품번 = task_modal_itemProcess.dataAll.value.filter(
    (c) => c.작업지시공정NO == 작업지시공정no && c.LOT코드 == lot코드
  )[0].품번;
  insertModalData_Useitem.품명 = task_modal_itemProcess.dataAll.value.filter(
    (c) => c.작업지시공정NO == 작업지시공정no && c.LOT코드 == lot코드
  )[0].품명;
  insertModalData_Useitem.규격 = task_modal_itemProcess.dataAll.value.filter(
    (c) => c.작업지시공정NO == 작업지시공정no && c.LOT코드 == lot코드
  )[0].규격;
  insertModalData_Useitem.단위 = task_modal_itemProcess.dataAll.value.filter(
    (c) => c.작업지시공정NO == 작업지시공정no && c.LOT코드 == lot코드
  )[0].단위;
  insertModalData_Useitem.수량 = task_modal_itemProcess.dataAll.value.filter(
    (c) => c.작업지시공정NO == 작업지시공정no && c.LOT코드 == lot코드
  )[0].재공수;
  setItemProcessModal(false);
};

// ############################################### 불량 가져오기 ###############################################
// 페이징기능
const currentPage_defect = ref(1); // 현재페이지
const rowsPerPage_defect = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_defect = () => {
  currentPage_defect.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_task_modal_defect = "/api/production/task/modal/defect";
const task_modal_defect = useSendApi<MasterDefect>(
  url_task_modal_defect,
  currentPage_defect,
  rowsPerPage_defect
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_modal_defect = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "불량명", style: "width: 50px; text-align: center;" },
  항목4: { name: "내용", style: "width: 50px; text-align: center;" },
  항목5: { name: "항목5", style: "width: 50px; text-align: center;" },
  항목6: { name: "항목6", style: "width: 50px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_defect = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_defect = ref("전체");
const searchInput_defect = ref("");
const sortKey_defect = ref("등록일");
const sortOrder_defect = ref("내림차순");
const sortOrderToggle_defect = () => {
  sortOrder_defect.value =
    sortOrder_defect.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_defect, sortOrder_defect], (newValue, oldValue) => {
  search_defect();
  pageChangeFirst_defect();
});
const search_defect = () => {
  // console.log(searchKey.value, searchInput.value);
  task_modal_defect.searchDatas(
    searchDate_defect.value,
    searchKey_defect.value,
    searchInput_defect.value,
    sortKey_defect.value,
    sortOrder_defect.value
  );
};

// ########################## 모달 설정 ##########################
const defectModal = ref(false);
const setDefectModal = (value: boolean) => {
  defectModal.value = value;
};

// 모달에서 선택한 품목을 itemProcesslist에 넣기
const importDefect = (no: any) => {
  insertModalData_Defect.불량NO = no;
  insertModalData_Defect.불량코드 = task_modal_defect.dataAll.value.filter(
    (c) => c.NO == no
  )[0].코드;
  insertModalData_Defect.구분 = task_modal_defect.dataAll.value.filter(
    (c) => c.NO == no
  )[0].구분;
  insertModalData_Defect.불량명 = task_modal_defect.dataAll.value.filter(
    (c) => c.NO == no
  )[0].불량명;

  console.log(insertModalData_Defect);
  setDefectModal(false);
};

// ############################################### 비가동 가져오기 ###############################################
// 페이징기능
const currentPage_nonwork = ref(1); // 현재페이지
const rowsPerPage_nonwork = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_nonwork = () => {
  currentPage_nonwork.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_task_modal_nonwork = "/api/production/task/modal/nonwork";
const task_modal_nonwork = useSendApi<MasterNonWork>(
  url_task_modal_nonwork,
  currentPage_nonwork,
  rowsPerPage_nonwork
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_modal_nonwork = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "구분", style: "width: 200px; text-align: center;" },
  항목3: { name: "비가동명", style: "width: 50px; text-align: center;" },
  항목4: { name: "내용", style: "width: 50px; text-align: center;" },
  항목5: { name: "항목5", style: "width: 50px; text-align: center;" },
  항목6: { name: "항목6", style: "width: 50px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_nonwork = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_nonwork = ref("전체");
const searchInput_nonwork = ref("");
const sortKey_nonwork = ref("등록일");
const sortOrder_nonwork = ref("내림차순");
const sortOrderToggle_nonwork = () => {
  sortOrder_nonwork.value =
    sortOrder_nonwork.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_nonwork, sortOrder_nonwork], (newValue, oldValue) => {
  search_nonwork();
  pageChangeFirst_nonwork();
});
const search_nonwork = () => {
  // console.log(searchKey.value, searchInput.value);
  task_modal_nonwork.searchDatas(
    searchDate_nonwork.value,
    searchKey_nonwork.value,
    searchInput_nonwork.value,
    sortKey_nonwork.value,
    sortOrder_nonwork.value
  );
};

// ########################## 모달 설정 ##########################
const nonworkModal = ref(false);
const setNonworkModal = (value: boolean) => {
  nonworkModal.value = value;
};

// 모달에서 선택한 품목을 itemProcesslist에 넣기
const importNonwork = (no: any) => {
  insertModalData_Nonwork.비가동NO = no;
  insertModalData_Nonwork.비가동코드 = task_modal_nonwork.dataAll.value.filter(
    (c) => c.NO == no
  )[0].코드;
  insertModalData_Nonwork.구분 = task_modal_nonwork.dataAll.value.filter(
    (c) => c.NO == no
  )[0].구분;
  insertModalData_Nonwork.비가동명 = task_modal_nonwork.dataAll.value.filter(
    (c) => c.NO == no
  )[0].비가동명;
  insertModalData_Nonwork.내용 = task_modal_nonwork.dataAll.value.filter(
    (c) => c.NO == no
  )[0].내용;
  setNonworkModal(false);
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
      style="display: flex; max-width: 100%; height: 365px"
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
            </div>
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
                <option>품목코드</option>
                <option>거래처명</option>
                <option>품명</option>
                <option>규격</option>
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
                <option>거래처명</option>
                <option>사업자번호</option>
                <option>주소</option>
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
              style="overflow-y: scroll; overflow-x: hidden; height: 250px"
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
                      :style="table_setting.항목14.style"
                    >
                      {{ table_setting.항목14.name }}
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
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목12.style"
                    >
                      <div>{{ todo[table_setting.항목12.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목13.style"
                    >
                      <div>{{ todo[table_setting.항목13.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect == todo.NO },
                      ]"
                      :style="table_setting.항목14.style"
                    >
                      <div>{{ todo[table_setting.항목14.name] }}</div>
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
    <div class="grid grid-cols-11 intro-y">
      <div class="col-span-3">
        <!--BEGIN : ######################################### LEVEL2-불량  ########################################### -->
        <div class="item ml-3 border-r-2 mr-2" style="flex: 1 1 40%">
          <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
          <div class="grid grid-cols-12 gap-1 mt-1">
            <div
              class="flex flex-wrap items-center col-span-12 mt-1 mb-1 mr-5 intro-y sm:flex-nowrap"
            >
              <div class="flex items-center text-lg">
                <Lucide icon="Frown" class="w-5 h-5 mr-1 mb-0.5" /><strong
                  >불량 사유 목록</strong
                >
              </div>
              <div class="hidden mx-auto md:block text-slate-500"></div>
              <span class="mr-3"
                >[ {{ result_defect.dataCount }}개 데이터 조회됨 ]
              </span>
              <Button
                class="mr-2 shadow-md"
                style="height: 30px"
                as="a"
                variant="primary"
                @click="setInsertModalDefect(true)"
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
                style="overflow-y: scroll; overflow-x: hidden; height: 312px"
              >
                <Table class="border-spacing-y-[8px] border-separate -mt-2">
                  <Table.Thead
                    class="bg-slate-100"
                    style="position: sticky; top: 0px; z-index: 2"
                  >
                    <Table.Tr>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_defect.항목1.style"
                      >
                        {{ table_setting_defect.항목1.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_defect.항목2.style"
                      >
                        {{ table_setting_defect.항목2.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_defect.항목3.style"
                      >
                        {{ table_setting_defect.항목3.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_defect.항목4.style"
                      >
                        {{ table_setting_defect.항목4.name }}
                      </Table.Th>
                      <Table.Th
                        class="px-0 text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_defect.편집.style"
                      >
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody style="position: relative; z-index: 1">
                    <Table.Tr
                      v-for="(todo, index) in result_defect.dataSearchAll.value"
                      :key="todo.NO"
                      class="intro-x"
                      htmlFor="radio"
                    >
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_defect.항목1.style"
                      >
                        <div>{{ todo[table_setting_defect.항목1.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_defect.항목2.style"
                      >
                        <div>{{ todo[table_setting_defect.항목2.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_defect.항목3.style"
                      >
                        <div>{{ todo[table_setting_defect.항목3.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_defect.항목4.style"
                      >
                        <div>{{ todo[table_setting_defect.항목4.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                        :style="table_setting_defect.편집.style"
                      >
                        <div>
                          <Lucide
                            icon="Edit"
                            class="w-4 h-4 mr-2 mb-0.5 text-danger cursor-pointer"
                            @click="
                              () => {
                                editModalData_Defect = todo;
                                setLevel2DefectEditModal(true);
                              }
                            "
                          />
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
                <div
                  class="text-center mt-20"
                  v-if="result_defect.dataCount.value == 0"
                >
                  저장된 데이터가 없습니다.
                </div>
              </div>
            </div>
            <!-- END: Data List -->
          </div>
        </div>
      </div>
      <!--END : ########################################### LEVEL2-불량  ########################################### -->
      <div class="col-span-4">
        <!--BEGIN : ######################################### LEVEL2-비가동  ########################################### -->
        <div class="grid grid-cols-8 gap-1 mt-1 border-r-2 mr-2">
          <div
            class="flex flex-wrap items-center col-span-12 mt-1 mb-1 mr-5 intro-y sm:flex-nowrap"
          >
            <div class="flex items-center text-lg">
              <Lucide icon="PauseCircle" class="w-5 h-5 mr-1 mb-0.5" /><strong
                >비가동 사유 목록</strong
              >
            </div>
            <div class="hidden mx-auto md:block text-slate-500"></div>
            <span class="mr-3"
              >[ {{ result_nonwork.dataCount }}개 데이터 조회됨 ]
            </span>
            <Button
              class="mr-2 shadow-md"
              style="height: 30px"
              as="a"
              variant="primary"
              @click="setInsertModalNonwork(true)"
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
              style="overflow-y: scroll; overflow-x: hidden; height: 312px"
            >
              <Table class="border-spacing-y-[8px] border-separate -mt-2">
                <Table.Thead
                  class="bg-slate-100"
                  style="position: sticky; top: 0px; z-index: 2"
                >
                  <Table.Tr>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_nonwork.항목1.style"
                    >
                      {{ table_setting_nonwork.항목1.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_nonwork.항목2.style"
                    >
                      {{ table_setting_nonwork.항목2.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_nonwork.항목3.style"
                    >
                      {{ table_setting_nonwork.항목3.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_nonwork.항목4.style"
                    >
                      {{ table_setting_nonwork.항목4.name }}
                    </Table.Th>
                    <Table.Th
                      class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_nonwork.항목5.style"
                    >
                      {{ table_setting_nonwork.항목5.name }}
                    </Table.Th>
                    <Table.Th
                      class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_nonwork.항목6.style"
                    >
                      {{ table_setting_nonwork.항목6.name }}
                    </Table.Th>
                    <Table.Th
                      class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_nonwork.편집.style"
                    >
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody style="position: relative; z-index: 1">
                  <Table.Tr
                    v-for="(todo, index) in result_nonwork.dataSearchAll.value"
                    :key="todo.NO"
                    class="intro-x"
                  >
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_nonwork.항목1.style"
                    >
                      <div>{{ todo[table_setting_nonwork.항목1.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_nonwork.항목2.style"
                    >
                      <div>{{ todo[table_setting_nonwork.항목2.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_nonwork.항목3.style"
                    >
                      <div>{{ todo[table_setting_nonwork.항목3.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_nonwork.항목4.style"
                    >
                      <div>{{ todo[table_setting_nonwork.항목4.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md px-1 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_nonwork.항목5.style"
                    >
                      <div>{{ todo[table_setting_nonwork.항목5.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md px-1 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_nonwork.항목6.style"
                    >
                      <div>{{ todo[table_setting_nonwork.항목6.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md px-1 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_nonwork.편집.style"
                    >
                      <div>
                        <Lucide
                          icon="Edit"
                          class="w-4 h-4 mr-2 mb-0.5 text-danger cursor-pointer"
                          @click="
                            () => {
                              editModalData_Nonwork = todo;
                              setLevel2NonworkEditModal(true);
                            }
                          "
                        />
                      </div>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
              <div
                class="text-center mt-20"
                v-if="result_nonwork.dataCount.value == 0"
              >
                저장된 데이터가 없습니다.
              </div>
            </div>
          </div>
          <!-- END: Data List -->
        </div>
        <!--END : ################## LEVEL2-비가동  ####################### -->
      </div>
      <div class="col-span-4">
        <!--BEGIN : ######################################### LEVEL2-투입자재  ########################################### -->
        <div class="grid grid-cols-12 gap-1 mt-1">
          <div
            class="flex flex-wrap items-center col-span-12 mt-1 mb-1 mr-5 intro-y sm:flex-nowrap"
          >
            <div class="flex items-center text-lg">
              <Lucide icon="PlusCircle" class="w-5 h-5 mr-1 mb-0.5" /><strong
                >투입 자재 목록</strong
              >
            </div>
            <div class="hidden mx-auto md:block text-slate-500"></div>
            <span class="mr-3"
              >[ {{ result_useitem.dataCount }}개 데이터 조회됨 ]
            </span>
            <Button
              class="mr-2 shadow-md"
              style="height: 30px"
              as="a"
              variant="primary"
              @click="setInsertModalUseitem(true)"
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
              style="overflow-y: scroll; overflow-x: hidden; height: 312px"
            >
              <Table class="border-spacing-y-[8px] border-separate -mt-2">
                <Table.Thead
                  class="bg-slate-100"
                  style="position: sticky; top: 0px; z-index: 2"
                >
                  <Table.Tr>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_useitem.항목1.style"
                    >
                      {{ table_setting_useitem.항목1.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_useitem.항목2.style"
                    >
                      {{ table_setting_useitem.항목2.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_useitem.항목3.style"
                    >
                      {{ table_setting_useitem.항목3.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_useitem.항목4.style"
                    >
                      {{ table_setting_useitem.항목4.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_useitem.항목5.style"
                    >
                      {{ table_setting_useitem.항목5.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_useitem.항목6.style"
                    >
                      {{ table_setting_useitem.항목6.name }}
                    </Table.Th>

                    <!-- <Table.Th
                      class="px-0 text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_useitem.편집.style"
                    >
                    </Table.Th> -->
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody style="position: relative; z-index: 1">
                  <Table.Tr
                    v-for="(todo, index) in result_useitem.dataSearchAll.value"
                    :key="todo.NO"
                    class="intro-x"
                  >
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_useitem.항목1.style"
                    >
                      <div>{{ todo[table_setting_useitem.항목1.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_useitem.항목2.style"
                    >
                      <div>{{ todo[table_setting_useitem.항목2.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_useitem.항목3.style"
                    >
                      <div>{{ todo[table_setting_useitem.항목3.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_useitem.항목4.style"
                    >
                      <div>{{ todo[table_setting_useitem.항목4.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_useitem.항목5.style"
                    >
                      <div>{{ todo[table_setting_useitem.항목5.name] }}</div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_useitem.항목6.style"
                    >
                      <div>{{ todo[table_setting_useitem.항목6.name] }}</div>
                    </Table.Td>
                    <!-- <Table.Td
                      :class="[
                        'px-0 first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'bg-warning': radioSelect_Process == todo.NO },
                      ]"
                      :style="table_setting_useitem.편집.style"
                    >
                      <div>
                        <Lucide
                          icon="Edit"
                          class="w-4 h-4 mr-2 mb-0.5 text-danger cursor-pointer"
                          @click="setLevel2UseitemEditModal(true)"
                        />
                      </div>
                    </Table.Td> -->
                  </Table.Tr>
                </Table.Tbody>
              </Table>
              <div
                class="text-center mt-20"
                v-if="result_useitem.dataCount.value == 0"
              >
                저장된 데이터가 없습니다.
              </div>
            </div>
          </div>
          <!-- END: Data List -->
        </div>
        <!--END : ################## LEVEL2-투입자재  ####################### -->
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

  <!-- #########################################################################################################################
######################################################  작업지시  ######################################################
######################################################################################################################### -->

  <!-- BEGIN: Insert Modal Content -->
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
      <div class="mb-5" style="font-weight: bold">생산실적 수정</div>
      <div style="text-align: left">
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">작업코드</FormLabel>
          <FormInput
            type="text"
            v-model="editModalData.작업코드"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">설비명</FormLabel>
          <FormInput
            type="text"
            :value="editModalData.설비명"
            v-model="editModalData.설비명"
            @click="setFacilityModal(true)"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">작업자</FormLabel>
          <FormInput
            type="text"
            :value="editModalData.작업자"
            v-model="editModalData.작업자"
            @click="setUserModal(true)"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-6">시작일시</FormLabel>
          <FormInput
            type="datetime-local"
            step="10"
            v-model="editModalData.시작일시"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-6">종료일시</FormLabel>
          <FormInput
            type="datetime-local"
            step="10"
            v-model="editModalData.종료일시"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-6">생산수</FormLabel>
          <FormInput
            id="vertical-form-6"
            type="text"
            v-model="editModalData.생산수"
            placeholder=""
          />
        </div>
      </div>

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

  <!-- LEVEL2 모달 시작 -->
  <!-- BEGIN: LEVEL2 Insert Modal Content -->
  <Dialog
    size="md"
    :open="insertModal_Defect"
    :key="insertModalData_Defect?.불량코드"
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">불량 사유 등록</div>

      <div style="text-align: left">
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">불량코드</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Defect.불량코드"
            @click="setDefectModal(true)"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">구분</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Defect.구분"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">불량명</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Defect.불량명"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">수량</FormLabel>
          <FormInput
            type="number"
            v-model="insertModalData_Defect.수량"
            placeholder=""
          />
        </div>

        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="insertDataFunction_Defect"
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setInsertModalDefect(false);
              }
            "
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Dialog
    size="md"
    :open="insertModal_Nonwork"
    :key="insertModalData_Nonwork?.비가동코드"
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">비가동 사유 등록</div>

      <div style="text-align: left">
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4"> 비가동코드</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Nonwork.비가동코드"
            @click="setNonworkModal(true)"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">구분</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Nonwork.구분"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">비가동명</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Nonwork.비가동명"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">내용</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Nonwork.내용"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">시작일시</FormLabel>
          <FormInput
            type="datetime-local"
            step="10"
            v-model="insertModalData_Nonwork.시작일시"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">종료일시</FormLabel>
          <FormInput
            type="datetime-local"
            step="10"
            v-model="insertModalData_Nonwork.종료일시"
            placeholder=""
          />
        </div>
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="insertDataFunction_Nonwork"
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setInsertModalNonwork(false);
              }
            "
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Dialog
    size="md"
    :open="insertModal_Useitem"
    :key="insertModalData_Useitem?.LOT코드"
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">투입 자재 등록</div>

      <div style="text-align: left">
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">LOT코드</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Useitem.LOT코드"
            @click="setItemProcessModal(true)"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">품목구분</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Useitem.품목구분"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">품명</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Useitem.품명"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">규격</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Useitem.규격"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">단위</FormLabel>
          <FormInput
            type="text"
            v-model="insertModalData_Useitem.단위"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">수량</FormLabel>
          <FormInput
            type="number"
            v-model="insertModalData_Useitem.수량"
            placeholder=""
          />
        </div>

        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="insertDataFunction_Useitem"
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setInsertModalUseitem(false);
              }
            "
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>

  <!-- END: LEVEL2 Insert Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: LEVEL2 Edit Modal -->
  <Dialog
    size="md"
    :open="level2_defect_editModal"
    @close="setLevel2DefectEditModal(false)"
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">불량 사유 편집</div>

      <div style="text-align: left">
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">불량코드</FormLabel>
          <FormInput
            type="text"
            v-model="editModalData_Defect.불량코드"
            placeholder=""
            readonly
          />
        </div>

        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">수량</FormLabel>
          <FormInput
            type="number"
            v-model="editModalData_Defect.수량"
            placeholder=""
          />
        </div>
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="editDataFunction_Defect"
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setLevel2DefectEditModal(false);
              }
            "
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Dialog
    size="md"
    :open="level2_nonwork_editModal"
    @close="setLevel2NonworkEditModal(false)"
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">비가동 사유 편집</div>

      <div style="text-align: left">
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">비가동코드</FormLabel>
          <FormInput
            type="text"
            v-model="editModalData_Nonwork.비가동코드"
            placeholder=""
            readonly
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">시작일시</FormLabel>
          <FormInput
            type="datetime-local"
            step="10"
            v-model="editModalData_Nonwork.시작일시"
            placeholder=""
          />
        </div>

        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">종료일시</FormLabel>
          <FormInput
            type="datetime-local"
            step="10"
            v-model="editModalData_Nonwork.종료일시"
            placeholder=""
          />
        </div>
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="editDataFunction_Nonwork"
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setLevel2NonworkEditModal(false);
              }
            "
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>

  <!-- <Dialog
    size="md"
    :open="level2_useitem_editModal"
    @close="setLevel2UseitemEditModal(false)"
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">투입 자재 편집</div>

      <div style="text-align: left">
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">코드</FormLabel>
          <FormInput type="text" placeholder="" readonly />
        </div>

        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">수량</FormLabel>
          <FormInput type="number" placeholder="" />
        </div>
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="async () => {}"
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setLevel2UseitemEditModal(false);
              }
            "
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog> -->
  <!-- END: LEVEL2 Edit Modal -->

  <!-- LEVEL2 모달 종료 -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

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

  <!-- BEGIN: Facility Modal Content -->
  <Dialog size="xxl" :open="facilityModal" @close="setFacilityModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--Facility Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        설비 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect
              v-model="searchKey_facility"
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
                v-model="searchInput_facility"
                @keyup.enter="
                  () => {
                    search_facility();
                    pageChangeFirst_facility();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_facility();
                    pageChangeFirst_facility();
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
              v-model="sortKey_facility"
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
              v-if="sortOrder_facility == '오름차순'"
              @click="sortOrderToggle_facility"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_facility }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_facility == '내림차순'"
              @click="sortOrderToggle_facility"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_facility }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_facility"
              @change="pageChangeFirst_facility"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_facility.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_facility"
              :numberOfPages="task_modal_facility.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_facility.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_facility }} /
              {{ task_modal_facility.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_facility.순번.style"
                  >
                    {{ table_setting_facility.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_facility.항목1.style"
                  >
                    {{ table_setting_facility.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_facility.항목2.style"
                  >
                    {{ table_setting_facility.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_facility.항목3.style"
                  >
                    {{ table_setting_facility.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_facility.항목4.style"
                  >
                    {{ table_setting_facility.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_facility.항목5.style"
                  >
                    {{ table_setting_facility.항목5.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_facility.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_facility.순번.style"
                    @click="importFacility(todo.NO)"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_facility - 1) * rowsPerPage_facility
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_facility.항목1.style"
                    @click="importFacility(todo.NO)"
                  >
                    <div>{{ todo[table_setting_facility.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_facility.항목2.style"
                    @click="importFacility(todo.NO)"
                  >
                    <div>{{ todo[table_setting_facility.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_facility.항목3.style"
                    @click="importFacility(todo.NO)"
                  >
                    <div>{{ todo[table_setting_facility.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_facility.항목4.style"
                    @click="importFacility(todo.NO)"
                  >
                    <div>{{ todo[table_setting_facility.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_facility.항목5.style"
                    @click="importFacility(todo.NO)"
                  >
                    <div>{{ todo[table_setting_facility.항목5.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_facility.dataCount.value == 0"
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
            @click="setFacilityModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Facility Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: User Modal Content -->
  <Dialog size="xxl" :open="userModal" @close="setUserModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--User Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        작업자 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect v-model="searchKey_user" class="w-30 mt-3 !box sm:mt-0">
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
                v-model="searchInput_user"
                @keyup.enter="
                  () => {
                    search_user();
                    pageChangeFirst_user();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_user();
                    pageChangeFirst_user();
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
            <FormSelect v-model="sortKey_user" class="w-30 mt-3 !box sm:mt-0">
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
              v-if="sortOrder_user == '오름차순'"
              @click="sortOrderToggle_user"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_user }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_user == '내림차순'"
              @click="sortOrderToggle_user"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_user }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_user"
              @change="pageChangeFirst_user"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_user.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_user"
              :numberOfPages="task_modal_user.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_user.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_user }} /
              {{ task_modal_user.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_user.순번.style"
                  >
                    {{ table_setting_user.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_user.항목1.style"
                  >
                    {{ table_setting_user.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_user.항목2.style"
                  >
                    {{ table_setting_user.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_user.항목3.style"
                  >
                    {{ table_setting_user.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_user.항목4.style"
                  >
                    {{ table_setting_user.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_user.항목5.style"
                  >
                    {{ table_setting_user.항목5.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_user.datas.value"
                  :key="todo.아이디"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_user.순번.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>
                      {{
                        index + 1 + (currentPage_user - 1) * rowsPerPage_user
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_user.항목1.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>{{ todo[table_setting_user.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_user.항목2.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>{{ todo[table_setting_user.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_user.항목3.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>{{ todo[table_setting_user.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_user.항목4.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>{{ todo[table_setting_user.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_user.항목5.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>{{ todo[table_setting_user.항목5.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_user.dataCount.value == 0"
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
            @click="setUserModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: User Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: ItemProcess Modal Content -->
  <Dialog
    size="xxl"
    :open="itemProcessModal"
    @close="setItemProcessModal(false)"
  >
    <Dialog.Panel class="p-10 text-center">
      <!--ItemProcess Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        품목재공 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect
              v-model="searchKey_itemProcess"
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
                v-model="searchInput_itemProcess"
                @keyup.enter="
                  () => {
                    search_itemProcess();
                    pageChangeFirst_itemProcess();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_itemProcess();
                    pageChangeFirst_itemProcess();
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
              v-model="sortKey_itemProcess"
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
              v-if="sortOrder_itemProcess == '오름차순'"
              @click="sortOrderToggle_itemProcess"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_itemProcess }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_itemProcess == '내림차순'"
              @click="sortOrderToggle_itemProcess"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_itemProcess }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_itemProcess"
              @change="pageChangeFirst_itemProcess"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_itemProcess.dataCount.value">
                전체
              </option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_itemProcess"
              :numberOfPages="task_modal_itemProcess.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_itemProcess.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_itemProcess }} /
              {{ task_modal_itemProcess.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_itemProcess.순번.style"
                  >
                    {{ table_setting_itemProcess.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목1.style"
                  >
                    {{ table_setting_itemProcess.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목2.style"
                  >
                    {{ table_setting_itemProcess.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목3.style"
                  >
                    {{ table_setting_itemProcess.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목4.style"
                  >
                    {{ table_setting_itemProcess.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목5.style"
                  >
                    {{ table_setting_itemProcess.항목5.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목6.style"
                  >
                    {{ table_setting_itemProcess.항목6.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목7.style"
                  >
                    {{ table_setting_itemProcess.항목7.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목8.style"
                  >
                    {{ table_setting_itemProcess.항목8.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목9.style"
                  >
                    {{ table_setting_itemProcess.항목9.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemProcess.항목10.style"
                  >
                    {{ table_setting_itemProcess.항목10.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_itemProcess.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.순번.style"
                    @click="importItemProcess(todo.NO)"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_itemProcess - 1) * rowsPerPage_itemProcess
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목1.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목2.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목3.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목4.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목5.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목5.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목6.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목6.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목7.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목7.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목8.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목8.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목9.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목9.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목10.style"
                    @click="
                      importItemProcess(todo.작업지시공정NO, todo.LOT코드)
                    "
                  >
                    <div>{{ todo[table_setting_itemProcess.항목10.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_itemProcess.dataCount.value == 0"
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
            @click="setItemProcessModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: ItemProcess Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: Defect Modal Content -->
  <Dialog size="xxl" :open="defectModal" @close="setDefectModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--ItemProcess Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        불량 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect
              v-model="searchKey_defect"
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
                v-model="searchInput_defect"
                @keyup.enter="
                  () => {
                    search_defect();
                    pageChangeFirst_defect();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_defect();
                    pageChangeFirst_defect();
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
            <FormSelect v-model="sortKey_defect" class="w-30 mt-3 !box sm:mt-0">
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
              v-if="sortOrder_defect == '오름차순'"
              @click="sortOrderToggle_defect"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_defect }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_defect == '내림차순'"
              @click="sortOrderToggle_defect"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_defect }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_defect"
              @change="pageChangeFirst_defect"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_defect.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_defect"
              :numberOfPages="task_modal_defect.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_defect.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_defect }} /
              {{ task_modal_defect.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_modal_defect.순번.style"
                  >
                    {{ table_setting_modal_defect.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_defect.항목1.style"
                  >
                    {{ table_setting_modal_defect.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_defect.항목2.style"
                  >
                    {{ table_setting_modal_defect.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_defect.항목3.style"
                  >
                    {{ table_setting_modal_defect.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_defect.항목4.style"
                  >
                    {{ table_setting_modal_defect.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_defect.항목5.style"
                  >
                    {{ table_setting_modal_defect.항목5.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_defect.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_defect.순번.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_defect - 1) * rowsPerPage_defect
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_defect.항목1.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_modal_defect.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_defect.항목2.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_modal_defect.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_defect.항목3.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_modal_defect.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_defect.항목4.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_modal_defect.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_defect.항목5.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_modal_defect.항목5.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_defect.dataCount.value == 0"
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
            @click="setDefectModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Defect Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: NonWork Modal Content -->
  <Dialog size="xxl" :open="nonworkModal" @close="setNonworkModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--ItemProcess Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        비가동 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect
              v-model="searchKey_nonwork"
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
                v-model="searchInput_nonwork"
                @keyup.enter="
                  () => {
                    search_nonwork();
                    pageChangeFirst_nonwork();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_nonwork();
                    pageChangeFirst_nonwork();
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
              v-model="sortKey_nonwork"
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
              v-if="sortOrder_nonwork == '오름차순'"
              @click="sortOrderToggle_nonwork"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_nonwork }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_nonwork == '내림차순'"
              @click="sortOrderToggle_nonwork"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_nonwork }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_nonwork"
              @change="pageChangeFirst_nonwork"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_nonwork.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_nonwork"
              :numberOfPages="task_modal_nonwork.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_nonwork.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_nonwork }} /
              {{ task_modal_nonwork.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_modal_nonwork.순번.style"
                  >
                    {{ table_setting_modal_nonwork.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_nonwork.항목1.style"
                  >
                    {{ table_setting_modal_nonwork.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_nonwork.항목2.style"
                  >
                    {{ table_setting_modal_nonwork.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_nonwork.항목3.style"
                  >
                    {{ table_setting_modal_nonwork.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_nonwork.항목4.style"
                  >
                    {{ table_setting_modal_nonwork.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_nonwork.항목5.style"
                  >
                    {{ table_setting_modal_nonwork.항목5.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_nonwork.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_nonwork.순번.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_nonwork - 1) * rowsPerPage_nonwork
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_nonwork.항목1.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>
                      {{ todo[table_setting_modal_nonwork.항목1.name] }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_nonwork.항목2.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>
                      {{ todo[table_setting_modal_nonwork.항목2.name] }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_nonwork.항목3.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>
                      {{ todo[table_setting_modal_nonwork.항목3.name] }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_nonwork.항목4.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>
                      {{ todo[table_setting_modal_nonwork.항목4.name] }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_nonwork.항목5.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>
                      {{ todo[table_setting_modal_nonwork.항목5.name] }}
                    </div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_nonwork.dataCount.value == 0"
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
            @click="setNonworkModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: NonWork Modal Content -->
</template>
