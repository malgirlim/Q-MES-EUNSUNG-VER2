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
import {
  MasterProduct,
  MasterProcess,
  MasterFacility,
  MasterUser,
} from "../../interfaces/menu/MasterInterface";
import {
  StockItemReceive,
  StockStockLOT,
} from "../../interfaces/menu/stockInterface";
import {
  ProductionTask,
  ProductionTaskProcess,
  ProductionTaskProcessItem,
} from "../../interfaces/menu/productionInterface";

// 컴포넌트 로드
import MasterDetail from "../../components/Common/Detail/MasterBOMDetail.vue";
import DocumentPrint from "../../components/Common/Print/Template/TaskAdd(Std)/Main.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.ProductionTaskAdd; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
  task_modal_item.loadDatas(); // 품목 데이터 불러오기
  task_modal_process.loadDatas(); // 공정 데이터 불러오기
  task_modal_facility.loadDatas(); // 설비 데이터 불러오기
  task_modal_user.loadDatas(); // 작업자 데이터 불러오기
  task_modal_itemReceive.loadDatas(); // 품목입고 데이터 불러오기
});

// 페이징기능
const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst = () => {
  currentPage.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// dataManager 만들기
const url = "/api/production/task";
const dataManager = useSendApi<ProductionTask>(url, currentPage, rowsPerPage);

// 테이블항목 설정 및 가로크기 조정
const table_setting = {
  체크박스: { name: "체크박스", style: "width: 20px" },
  선택: { name: "선택", style: "width: 20px; text-align: center;" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "코드", style: "width: 100px; text-align: center;" },
  항목2: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "품번", style: "width: 100px; text-align: center;" },
  항목4: { name: "품명", style: "width: 150px; text-align: center;" },
  항목5: { name: "규격", style: "width: 150px; text-align: center;" },
  항목6: { name: "수량", style: "width: 25px; text-align: center;" },
  항목7: { name: "시작일", style: "width: 100px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 50px; text-align: center;" },
  편집: { name: "편집", style: "width: 150px; text-align: center;" },
  진행율: { name: "진행율", style: "width: 50px; text-align: center;" },
};

// 품목 데이터 설정
const url_task_modal_item = "/api/production/task/modal/product";
const task_modal_item = useSendApi<MasterProduct>(
  url_task_modal_item,
  ref(1),
  ref(10)
);
// 공정 데이터 설정
const url_task_modal_process = "/api/production/task/modal/process";
const task_modal_process = useSendApi<MasterProcess>(
  url_task_modal_process,
  ref(1),
  ref(10)
);
// 설비 데이터 설정
const url_task_modal_facility = "/api/production/task/modal/facility";
const task_modal_facility = useSendApi<MasterFacility>(
  url_task_modal_facility,
  ref(1),
  ref(10)
);
// 작업자 데이터 설정
const url_task_modal_user = "/api/production/task/modal/user";
const task_modal_user = useSendApi<MasterUser>(
  url_task_modal_user,
  ref(1),
  ref(10)
);
// // 품목입고 데이터 설정
// const url_task_modal_itemReceive = "/api/production/task/modal/itemreceive";
// const task_modal_itemReceive = useSendApi<StockItemReceive>(
//   url_task_modal_itemReceive,
//   ref(1),
//   ref(10)
// );
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
  task_process.searchDatas("", "작업지시NO", radioSelect.value, "", ""); //날짜,조회기준,조회값,정렬기준,정렬값
});

// ########################## 등록, 수정, 삭제, 상세 Modal ##########################
// ##### 등록 Modal #####
let insertModalData: ProductionTask;
const insertModal = ref(false);
const setInsertModal = (value: boolean) => {
  if (user_level >= 3) {
    // insertModal.value = value;
    // insertModalData = {}; // 변수 초기화
    router.push("task-add-insert");
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
let editModalData: ProductionTask; // 수정할 변수
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

// ############################################### 작업지시공정 가져오기 ############################################
// 작업지시공정 데이터
const url_task_process = "/api/production/task/process";
const task_process = useSendApi<ProductionTaskProcess>(
  url_task_process,
  ref(1),
  ref(100)
);

// 라디오 선택하기
const radioSelect_Process: any = ref();
// now2가 변경되면 실행
watch([radioSelect_Process], (newValue, oldValue) => {
  // console.log(oldValue[0], "->", newValue[0]);
  task_process_item.searchDatas(
    "",
    "작업지시공정NO",
    radioSelect_Process.value,
    "",
    ""
  ); //날짜,조회기준,조회값,정렬기준,정렬값
});

// 테이블항목 설정 및 가로크기 조정
const table_setting_process = {
  체크박스: { name: "체크박스", style: "width: 50px" },
  선택: { name: "선택", style: "width: 50px; text-align: center;" },
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "작업구분", style: "width: 50px; text-align: center;" },
  항목2: { name: "공정명", style: "width: 50px; text-align: center;" },
  항목3: { name: "설비명", style: "width: 50px; text-align: center;" },
  항목4: { name: "작업자", style: "width: 50px; text-align: center;" },
  항목5: { name: "품번", style: "width: 50px; text-align: center;" },
  항목6: { name: "품명", style: "width: 150px; text-align: center;" },
  항목7: { name: "진행상황", style: "width: 140px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 100px; text-align: center;" },
  편집: { name: "편집", style: "width: 100px; text-align: center;" },
};

// ########################## 모달 설정  ##########################
// ##### 등록 Modal #####
let insertModalData_Process: ProductionTaskProcess;
const insertModal_Process = ref(false);
const setInsertModal_Process = (value: boolean) => {
  if (user_level >= 3) {
    insertModal_Process.value = value;
    insertModalData_Process = { 작업지시NO: radioSelect.value }; // 변수 초기화
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// 등록버튼 누르면 실행되는 함수
const insertDataFunction_Process = async () => {
  await task_process.insertData(insertModalData_Process);
  await task_process.searchDatas("", "작업지시NO", radioSelect.value, "", "");
  await setInsertModal_Process(false);
};

// ##### 수정 Modal #####
const editModal_Process = ref(false);
const setEditModal_Process = (value: boolean) => {
  if (user_level >= 3) {
    editModal_Process.value = value;
    task_process.searchDatas("", "작업지시NO", radioSelect.value, "", "");
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let editModalData_Process: ProductionTaskProcess; // 수정할 변수
// 수정버튼 누르면 실행되는 함수
const editDataFunction_Process = async () => {
  await task_process.editData(editModalData_Process); // await : 이 함수가 끝나야 다음으로 넘어간다
  await task_process.searchDatas("", "작업지시NO", radioSelect.value, "", "");
};

// ##### 삭제 Modal #####
const deleteModal_Process = ref(false);
const setDeleteModal_Process = (value: boolean) => {
  if (user_level >= 4) {
    deleteModal_Process.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const deleteButtonRef_Process = ref(null);
// 삭제버튼 누르면 실행되는 함수
const deleteDataFunction_Process = async () => {
  await task_process.deleteData([radioSelect_Process.value]); // await : 이 함수가 끝나야 다음으로 넘어간다
  await task_process.searchDatas("", "작업지시NO", radioSelect.value, "", "");
};

// ############################################ 작업지시공정자재 가져오기 ############################################
// 작업지시공정자재 데이터
const url_task_process_item = "/api/production/task/process/item";
const task_process_item = useSendApi<ProductionTaskProcessItem>(
  url_task_process_item,
  ref(1),
  ref(100)
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_process_item = {
  체크박스: { name: "체크박스", style: "width: 50px" },
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "LOT코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "품명", style: "width: 100px; text-align: center;" },
  항목4: { name: "규격", style: "width: 100px; text-align: center;" },
  항목5: { name: "단위", style: "width: 50px; text-align: center;" },
  항목6: { name: "수량", style: "width: 50px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 100px; text-align: center;" },
  편집: { name: "편집", style: "width: 100px; text-align: center;" },
};

// ########################## 모달 설정  ##########################
// ##### 등록 Modal #####
let insertModalData_ProcessItem: ProductionTaskProcessItem;
const insertModal_ProcessItem = ref(false);
const setInsertModal_ProcessItem = (value: boolean) => {
  if (user_level >= 3) {
    if (radioSelect_Process.value > 0) {
      insertModal_ProcessItem.value = value;
      insertModalData_ProcessItem = {
        작업지시공정NO: radioSelect_Process.value,
      }; // 변수 초기화
    } else {
      toast.warning("공정을 선택해주세요.");
    }
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// 등록버튼 누르면 실행되는 함수
const insertDataFunction_ProcessItem = async () => {
  await task_process_item.insertData(insertModalData_ProcessItem);
  await task_process_item.searchDatas(
    "",
    "작업지시공정NO",
    radioSelect_Process.value,
    "",
    ""
  );
  await setInsertModal_ProcessItem(false);
};

// ##### 수정 Modal #####
const editModal_ProcessItem = ref(false);
const setEditModal_ProcessItem = (value: boolean) => {
  if (user_level >= 3) {
    editModal_ProcessItem.value = value;
    task_process_item.searchDatas(
      "",
      "작업지시공정NO",
      radioSelect_Process.value,
      "",
      ""
    );
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let editModalData_ProcessItem: ProductionTaskProcessItem; // 수정할 변수
// 수정버튼 누르면 실행되는 함수
const editDataFunction_ProcessItem = async () => {
  await task_process_item.editData(editModalData_ProcessItem); // await : 이 함수가 끝나야 다음으로 넘어간다
  await task_process_item.searchDatas(
    "",
    "작업지시공정NO",
    radioSelect_Process.value,
    "",
    ""
  );
};

// ##### 삭제 Modal #####
const deleteModal_ProcessItem = ref(false);
const setDeleteModal_ProcessItem = (value: boolean) => {
  if (user_level >= 4) {
    deleteModal_ProcessItem.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const deleteButtonRef_ProcessItem = ref(null);
// 삭제버튼 누르면 실행되는 함수
const deleteDataFunction_ProcessItem = async () => {
  await task_process_item.deleteData(checkDebug.value); // await : 이 함수가 끝나야 다음으로 넘어간다
  await resetCheckBox();
  await task_process_item.searchDatas(
    "",
    "작업지시공정NO",
    radioSelect_Process.value,
    "",
    ""
  );
};

// ############################################### 품목입고 가져오기 ###############################################
// 품목등록 모달 설정
const itemReceiveModal = ref(false);
const itemReceiveModalIndex = ref(0);
const setItemReceiveModal = (value: boolean, no: any) => {
  itemReceiveModal.value = value;
  itemReceiveModalIndex.value = no;
};

// 모달에서 선택한 품목을 itemReceivelist에 넣기
const importItemReceive = (no: any) => {
  // 품목NO
  insertModalData_ProcessItem.품목NO =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.품목NO;
  // LOT코드
  insertModalData_ProcessItem.LOT코드 =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.LOT코드;
  // 품번
  insertModalData_ProcessItem.품번 =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.품번;
  // 품목구분
  insertModalData_ProcessItem.품목구분 =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.품목구분;
  // 품명
  insertModalData_ProcessItem.품명 =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.품명;
  // 규격
  insertModalData_ProcessItem.규격 =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.규격;
  // 단위
  insertModalData_ProcessItem.단위 =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.단위;
  itemReceiveModalIndex.value = 0;
  setItemReceiveModal(false, 0);
};

// 페이징기능
const currentPage_itemReceive = ref(1); // 현재페이지
const rowsPerPage_itemReceive = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_itemReceive = () => {
  currentPage_itemReceive.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_task_modal_itemReceive = "/api/production/task/modal/stocklot";
const task_modal_itemReceive = useSendApi<StockStockLOT>(
  url_task_modal_itemReceive,
  currentPage_itemReceive,
  rowsPerPage_itemReceive
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_itemReceive = {
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
const searchDate_itemReceive = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_itemReceive = ref("전체");
const searchInput_itemReceive = ref("");
const sortKey_itemReceive = ref("등록일");
const sortOrder_itemReceive = ref("내림차순");
const sortOrderToggle_itemReceive = () => {
  sortOrder_itemReceive.value =
    sortOrder_itemReceive.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_itemReceive, sortOrder_itemReceive], (newValue, oldValue) => {
  search_itemReceive();
  pageChangeFirst_itemReceive();
});
const search_itemReceive = () => {
  // console.log(searchKey.value, searchInput.value);
  task_modal_itemReceive.searchDatas(
    searchDate_itemReceive.value,
    searchKey_itemReceive.value,
    searchInput_itemReceive.value,
    sortKey_itemReceive.value,
    sortOrder_itemReceive.value
  );
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
                      :style="table_setting.진행율.style"
                    >
                      {{ table_setting.진행율.name }}
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
                      <!-- <div>
                        <label
                          class="text-blue-500"
                          style="cursor: pointer"
                          @click="setPrintDocumentModal(true)"
                          >{{ todo[table_setting.항목1.name] }}
                        </label>
                      </div> -->
                      {{ todo[table_setting.항목1.name] }}
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
        <!--BEGIN : ######################################### LEVEL2  ########################################### -->
        <div class="item ml-3" style="flex: 1 1 40%">
          <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
          <div class="grid grid-cols-12 gap-1 mt-1">
            <div
              class="flex flex-wrap items-center col-span-12 mt-1 mb-1 mr-5 intro-y sm:flex-nowrap"
            >
              <div class="flex items-center text-lg">
                <Lucide icon="Cpu" class="w-5 h-5 mr-1 mb-0.5" /><strong
                  >공정 등록 (LEVEL2)</strong
                >
              </div>
              <div class="hidden mx-auto md:block text-slate-500"></div>
              <span class="mr-3"
                >[ {{ task_process.dataCount }}개 데이터 조회됨 ]
              </span>
              <!-- <Button
                class="mr-2 shadow-md"
                style="height: 30px"
                as="a"
                variant="primary"
                @click="
                  () => {
                    setInsertModal_Process(true);
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
                    setDeleteModal_Process(true);
                  }
                "
              >
                <Lucide icon="Trash2" class="w-4 h-4 mr-2" /> 삭제</Button
              > -->
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
                        :style="table_setting_process.선택.style"
                      >
                        {{ table_setting.선택.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_process.순번.style"
                      >
                        순번
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_process.항목1.style"
                      >
                        {{ table_setting_process.항목1.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_process.항목2.style"
                      >
                        {{ table_setting_process.항목2.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_process.항목3.style"
                      >
                        {{ table_setting_process.항목3.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_process.항목4.style"
                      >
                        {{ table_setting_process.항목4.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_process.항목5.style"
                      >
                        {{ table_setting_process.항목5.name }}
                      </Table.Th>
                      <Table.Th
                        class="text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_process.항목6.style"
                      >
                        {{ table_setting_process.항목6.name }}
                      </Table.Th>

                      <Table.Th
                        class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_process.항목7.style"
                      >
                        {{ table_setting_process.항목7.name }}
                      </Table.Th>
                      <Table.Th
                        class="px-1 text-center border-b-0 whitespace-nowrap font-bold"
                        :style="table_setting_process.편집.style"
                      >
                        {{ table_setting_process.편집.name }}
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody style="position: relative; z-index: 1">
                    <Table.Tr
                      v-for="(todo, index) in task_process.dataSearchAll.value"
                      :key="todo.NO"
                      class="intro-x"
                      htmlFor="radio"
                    >
                      <Table.Td
                        :class="[
                          'first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                        ]"
                        id="radio"
                        :style="table_setting_process.선택.style"
                      >
                        <input
                          class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10"
                          id="radio"
                          type="radio"
                          :value="todo.NO"
                          v-model="radioSelect_Process"
                        />
                      </Table.Td>
                      <Table.Td
                        :class="[
                          'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                        ]"
                        :style="table_setting_process.순번.style"
                      >
                        <div>
                          {{ index + 1 + (currentPage - 1) * rowsPerPage }}
                        </div>
                      </Table.Td>
                      <Table.Td
                        :class="[
                          'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                        ]"
                        :style="table_setting_process.항목1.style"
                      >
                        <div>{{ todo[table_setting_process.항목1.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        :class="[
                          'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                        ]"
                        :style="table_setting_process.항목2.style"
                      >
                        <div>{{ todo[table_setting_process.항목2.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        :class="[
                          'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                        ]"
                        :style="table_setting_process.항목3.style"
                      >
                        <div>{{ todo[table_setting_process.항목3.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        :class="[
                          'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                        ]"
                        :style="table_setting_process.항목4.style"
                      >
                        <div>{{ todo[table_setting_process.항목4.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        :class="[
                          'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                        ]"
                        :style="table_setting_process.항목5.style"
                      >
                        <div>{{ todo[table_setting_process.항목5.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        :class="[
                          'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                        ]"
                        :style="table_setting_process.항목6.style"
                      >
                        <div>{{ todo[table_setting_process.항목6.name] }}</div>
                      </Table.Td>
                      <Table.Td
                        :class="[
                          'px-1 first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                          { 'text-gray-500': todo.진행상황 == '작업보류' },
                          { 'text-danger': todo.진행상황 == '작업반려' },
                          { 'text-black': todo.진행상황 == '작업미확인' },
                          { 'text-orange-500': todo.진행상황 == '작업대기' },
                          { 'text-success': todo.진행상황 == '작업중' },
                          { 'text-blue-600': todo.진행상황 == '작업완료' },
                        ]"
                        :style="table_setting_process.항목7.style"
                      >
                        <div class="flex items-center">
                          <div>
                            <Lucide
                              class="w-4 h-4 mr-1"
                              :icon="
                                todo.진행상황 == '작업보류'
                                  ? 'MinusCircle'
                                  : todo.진행상황 == '작업반려'
                                  ? 'XCircle'
                                  : todo.진행상황 == '작업미확인'
                                  ? 'HelpCircle'
                                  : todo.진행상황 == '작업대기'
                                  ? 'PauseCircle'
                                  : todo.진행상황 == '작업중'
                                  ? 'PlayCircle'
                                  : todo.진행상황 == '작업완료'
                                  ? 'CheckCircle'
                                  : 'AlertCircle'
                              "
                            />
                          </div>
                          <div>
                            {{ todo[table_setting_process.항목7.name] }}
                          </div>
                        </div>
                      </Table.Td>

                      <Table.Td
                        :class="[
                          'px-1 first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                          { 'bg-warning': radioSelect_Process == todo.NO },
                        ]"
                        :style="table_setting_process.편집.style"
                      >
                        <div
                          class="flex items-center justify-center text-danger"
                        >
                          <a
                            class="flex items-center mr-3"
                            href="#"
                            @click="
                              () => {
                                setEditModal_Process(true);
                                editModalData_Process = todo;
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
                  v-if="task_process.dataCount.value == 0"
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
      <div class="col-span-1">
        <!--BEGIN : ######################################### LEVEL3  ########################################### -->
        <div class="grid grid-cols-12 gap-1 mt-1">
          <div
            class="flex flex-wrap items-center col-span-12 mt-1 mb-1 mr-5 intro-y sm:flex-nowrap"
          >
            <div class="flex items-center text-lg">
              <Lucide icon="PlusCircle" class="w-5 h-5 mr-1 mb-0.5" /><strong
                >투입자재 등록 (LEVEL3)</strong
              >
            </div>
            <div class="hidden mx-auto md:block text-slate-500"></div>
            <span class="mr-3"
              >[ {{ task_process_item.dataCount }}개 데이터 조회됨 ]
            </span>
            <Button
              class="mr-2 shadow-md"
              style="height: 30px"
              as="a"
              variant="primary"
              @click="
                () => {
                  setInsertModal_ProcessItem(true);
                }
              "
            >
              <Lucide icon="FilePlus" class="w-4 h-4 mr-2" />
              등록
            </Button>
            <!-- <Button
              class="mr-2 shadow-md"
              style="height: 30px"
              as="a"
              variant="danger"
              @click="
                () => {
                  setDeleteModal_ProcessItem(true);
                }
              "
            >
              <Lucide icon="Trash2" class="w-4 h-4 mr-2" /> 삭제</Button
            > -->
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
                    <!-- <Table.Th
                      class="border-b-0 whitespace-nowrap text-center"
                      id="checkbox"
                      :style="table_setting_process_item.체크박스.style"
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
                      :style="table_setting_process_item.순번.style"
                    >
                      순번
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_process_item.항목1.style"
                    >
                      {{ table_setting_process_item.항목1.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_process_item.항목2.style"
                    >
                      {{ table_setting_process_item.항목2.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_process_item.항목3.style"
                    >
                      {{ table_setting_process_item.항목3.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_process_item.항목4.style"
                    >
                      {{ table_setting_process_item.항목4.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_process_item.항목5.style"
                    >
                      {{ table_setting_process_item.항목5.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_process_item.항목6.style"
                    >
                      {{ table_setting_process_item.항목6.name }}
                    </Table.Th>
                    <!-- <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting_process_item.편집.style"
                    >
                      {{ table_setting_process_item.편집.name }}
                    </Table.Th> -->
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody style="position: relative; z-index: 1">
                  <Table.Tr
                    v-for="(todo, index) in task_process_item.dataSearchAll
                      .value"
                    :key="todo.NO"
                    class="intro-x"
                  >
                    <!-- <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      id="checkbox"
                      :style="table_setting_process_item.체크박스.style"
                    >
                      <input
                        class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed"
                        id="checkbox"
                        type="checkbox"
                        :value="todo.NO"
                        v-model="checkDebug"
                      />
                    </Table.Td> -->
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_process_item.순번.style"
                    >
                      <div>
                        {{ index + 1 + (currentPage - 1) * rowsPerPage }}
                      </div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_process_item.항목1.style"
                    >
                      <div>
                        {{ todo[table_setting_process_item.항목1.name] }}
                      </div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_process_item.항목2.style"
                    >
                      <div>
                        {{ todo[table_setting_process_item.항목2.name] }}
                      </div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_process_item.항목3.style"
                    >
                      <div>
                        {{ todo[table_setting_process_item.항목3.name] }}
                      </div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_process_item.항목4.style"
                    >
                      <div>
                        {{ todo[table_setting_process_item.항목4.name] }}
                      </div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_process_item.항목5.style"
                    >
                      <div>
                        {{ todo[table_setting_process_item.항목5.name] }}
                      </div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting_process_item.항목6.style"
                    >
                      <div>
                        {{ todo[table_setting_process_item.항목6.name] }}
                      </div>
                    </Table.Td>
                    <!-- <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400"
                      :style="table_setting_process_item.편집.style"
                    >
                      <div class="flex items-center justify-center text-danger">
                        <a
                          class="flex items-center mr-3"
                          href="#"
                          @click="
                            () => {
                              setEditModal_ProcessItem(true);
                              editModalData_ProcessItem = todo;
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
                v-if="task_process_item.dataCount.value == 0"
              >
                저장된 데이터가 없습니다.
              </div>
            </div>
          </div>
          <!-- END: Data List -->
        </div>
        <!--END : ################## LEVEL3  ####################### -->
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
  <Dialog size="md" :open="insertModal">
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
                <FormLabel htmlFor="vertical-form-4">코드</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="editModalData.코드"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">품목구분</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="editModalData.품목구분"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">품번</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="editModalData.품번"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">품명</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="editModalData.품명"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">규격</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="editModalData.규격"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">단위</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="editModalData.단위"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">수량</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="number"
                  v-model="editModalData.수량"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-6">시작일</FormLabel>
                <FormInput
                  id="vertical-form-6"
                  type="date"
                  v-model="editModalData.시작일"
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
######################################################  작업지시공정  ######################################################
######################################################################################################################### -->

  <!-- BEGIN: Insert Modal Content -->
  <Dialog size="md" :open="insertModal_Process">
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
                <FormLabel htmlFor="vertical-form-2">공정</FormLabel>
                <select v-tom v-model="insertModalData_Process.공정NO">
                  <option value="" selected>=== 추가 선택 ===</option>
                  <option
                    :value="p.NO"
                    v-for="p in task_modal_process.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.코드 }} # 구분:{{ p.구분 }} # 공정명:{{ p.공정명 }} #
                    내용:{{ p.내용 }} # 설비:{{ p.설비 }}
                  </option>
                </select>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">설비</FormLabel>
                <select v-tom v-model="insertModalData_Process.설비NO">
                  <option value="" selected>=== 추가 선택 ===</option>
                  <option
                    :value="p.NO"
                    v-for="p in task_modal_facility.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.라인 }} # 설비명:{{ p.설비명 }} # 규격:{{ p.규격 }}
                  </option>
                </select>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">작업자</FormLabel>
                <select v-tom v-model="insertModalData_Process.작업자ID">
                  <option value="" selected>=== 추가 선택 ===</option>
                  <option
                    :value="p.아이디"
                    v-for="p in task_modal_user.dataAll.value"
                    :key="p.아이디"
                  >
                    {{ p.아이디 }} # 이름:{{ p.이름 }} # 부서명:{{ p.부서명 }} #
                    직책:{{ p.직책 }} # 직급:{{ p.직급 }}
                  </option>
                </select>
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
                  v-model="insertModalData_Process.비고"
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
                insertDataFunction_Process();
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setInsertModal_Process(false);
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
  <Dialog size="md" :open="editModal_Process">
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">수정</div>
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
              <!-- <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">공정</FormLabel>
                <select v-tom v-model="editModalData_Process.공정NO">
                  <option
                    v-if="editModalData_Process.공정NO"
                    :value="editModalData_Process.공정NO"
                    selected
                  >
                    {{
                      task_modal_process.dataAll.value.filter(
                        (c) => c.NO == editModalData_Process.공정NO
                      )[0].코드
                    }}
                    # 구분:{{
                      task_modal_process.dataAll.value.filter(
                        (c) => c.NO == editModalData_Process.공정NO
                      )[0].구분
                    }}
                    # 공정명:{{
                      task_modal_process.dataAll.value.filter(
                        (c) => c.NO == editModalData_Process.공정NO
                      )[0].공정명
                    }}
                    # 내용:{{
                      task_modal_process.dataAll.value.filter(
                        (c) => c.NO == editModalData_Process.공정NO
                      )[0].내용
                    }}
                    # 설비:{{
                      task_modal_process.dataAll.value.filter(
                        (c) => c.NO == editModalData_Process.공정NO
                      )[0].설비
                    }}
                  </option>
                  <option
                    v-if="!editModalData_Process.공정NO"
                    value=""
                    selected
                  >
                    === 추가 선택 ===
                  </option>
                  <option
                    :value="p.NO"
                    v-for="p in task_modal_process.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.코드 }} # 구분:{{ p.구분 }} # 공정명:{{ p.공정명 }} #
                    내용:{{ p.내용 }} # 설비:{{ p.설비 }}
                  </option>
                </select>
              </div> -->
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">설비</FormLabel>
                <select v-tom v-model="editModalData_Process.설비NO">
                  <option
                    v-if="editModalData_Process.설비NO"
                    :value="editModalData_Process.설비NO"
                    selected
                  >
                    {{
                      task_modal_facility.dataAll.value.filter(
                        (c) => c.NO == editModalData_Process.설비NO
                      )[0].라인
                    }}
                    # 설비명:{{
                      task_modal_facility.dataAll.value.filter(
                        (c) => c.NO == editModalData_Process.설비NO
                      )[0].설비명
                    }}
                    # 규격:{{
                      task_modal_facility.dataAll.value.filter(
                        (c) => c.NO == editModalData_Process.설비NO
                      )[0].규격
                    }}
                  </option>
                  <option
                    v-if="!editModalData_Process.설비NO"
                    value=""
                    selected
                  >
                    === 선택 ===
                  </option>
                  <option
                    :value="p.NO"
                    v-for="p in task_modal_facility.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.라인 }} # 설비명:{{ p.설비명 }} # 규격:{{ p.규격 }}
                  </option>
                </select>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">작업자</FormLabel>
                <select v-tom v-model="editModalData_Process.작업자ID">
                  <option
                    v-if="editModalData_Process.작업자ID"
                    :value="editModalData_Process.작업자ID"
                    selected
                  >
                    {{
                      task_modal_user.dataAll.value.filter(
                        (c) => c.아이디 == editModalData_Process.작업자ID
                      )[0].아이디
                    }}
                    # 이름:{{
                      task_modal_user.dataAll.value.filter(
                        (c) => c.아이디 == editModalData_Process.작업자ID
                      )[0].이름
                    }}
                    # 부서명:{{
                      task_modal_user.dataAll.value.filter(
                        (c) => c.아이디 == editModalData_Process.작업자ID
                      )[0].부서명
                    }}
                    # 직책:{{
                      task_modal_user.dataAll.value.filter(
                        (c) => c.아이디 == editModalData_Process.작업자ID
                      )[0].직책
                    }}
                    # 직급:{{
                      task_modal_user.dataAll.value.filter(
                        (c) => c.아이디 == editModalData_Process.작업자ID
                      )[0].직급
                    }}
                  </option>
                  <option
                    v-if="!editModalData_Process.작업자ID"
                    value=""
                    selected
                  >
                    === 선택 ===
                  </option>
                  <option
                    :value="p.아이디"
                    v-for="p in task_modal_user.dataAll.value"
                    :key="p.아이디"
                  >
                    {{ p.아이디 }} # 이름:{{ p.이름 }} # 부서명:{{ p.부서명 }} #
                    직책:{{ p.직책 }} # 직급:{{ p.직급 }}
                  </option>
                </select>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-11">진행상황</FormLabel>
                <FormSelect
                  type="text"
                  :value="editModalData_Process.진행상황"
                  v-model="editModalData_Process.진행상황"
                >
                  <option>작업미확인</option>
                  <option>작업대기</option>
                  <option>작업중</option>
                  <option>작업완료</option>
                  <option>작업반려</option>
                  <option>작업보류</option>
                </FormSelect>
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
                  v-model="editModalData_Process.비고"
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
                editDataFunction_Process();
                setEditModal_Process(false);
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setEditModal_Process(false);
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
    :open="deleteModal_Process"
    @close="
      () => {
        setDeleteModal_Process(false);
      }
    "
    :initialFocus="deleteButtonRef_Process"
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
              setDeleteModal_Process(false);
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
              deleteDataFunction_Process();
              setDeleteModal_Process(false);
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
#######################################################  작업지시공정자재  #################################################
######################################################################################################################### -->

  <!-- BEGIN: Insert Modal Content -->
  <Dialog
    size="md"
    :open="insertModal_ProcessItem"
    :key="insertModalData_ProcessItem?.LOT코드"
  >
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
              <!-- <div class="mt-3">
                <FormLabel htmlFor="vertical-form-2">품목</FormLabel>
                <select v-tom v-model="insertModalData_ProcessItem.품목입고NO">
                  <option value="" selected>=== 선택 ===</option>
                  <option
                    :value="p.NO"
                    v-for="p in task_modal_itemReceive.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.입고코드 }} # 품목구분:{{ p.품목구분 }} # 품명:{{
                      p.품명
                    }}
                    # 규격:{{ p.규격 }} # 단위:{{ p.단위 }} # 입고수:{{
                      p.입고수
                    }}
                  </option>
                </select>
              </div> -->
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">LOT코드</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="insertModalData_ProcessItem.LOT코드"
                  @click="setItemReceiveModal(true, 0)"
                  placeholder=""
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">품목구분</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="insertModalData_ProcessItem.품목구분"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">품번</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="insertModalData_ProcessItem.품번"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">품명</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="insertModalData_ProcessItem.품명"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">규격</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="insertModalData_ProcessItem.규격"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">단위</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="text"
                  v-model="insertModalData_ProcessItem.단위"
                  placeholder=""
                  readonly
                />
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">수량</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="number"
                  v-model="insertModalData_ProcessItem.수량"
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
                  v-model="insertModalData_ProcessItem.비고"
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
                insertDataFunction_ProcessItem();
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setInsertModal_ProcessItem(false);
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
  <Dialog size="md" :open="editModal_ProcessItem">
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5" style="font-weight: bold">수정</div>
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
                <FormLabel htmlFor="vertical-form-2">품목</FormLabel>
                <select v-tom v-model="editModalData_ProcessItem.품목입고NO">
                  <option
                    v-if="editModalData_ProcessItem.품목입고NO"
                    :value="editModalData_ProcessItem.품목입고NO"
                    selected
                  >
                    {{
                      task_modal_itemReceive.dataAll.value.filter(
                        (c) => c.NO == editModalData_ProcessItem.품목입고NO
                      )[0].입고코드
                    }}
                    # 품목구분:{{
                      task_modal_itemReceive.dataAll.value.filter(
                        (c) => c.NO == editModalData_ProcessItem.품목입고NO
                      )[0].품목구분
                    }}
                    # 품명:{{
                      task_modal_itemReceive.dataAll.value.filter(
                        (c) => c.NO == editModalData_ProcessItem.품목입고NO
                      )[0].품명
                    }}
                    # 규격:{{
                      task_modal_itemReceive.dataAll.value.filter(
                        (c) => c.NO == editModalData_ProcessItem.품목입고NO
                      )[0].규격
                    }}
                    # 단위:{{
                      task_modal_itemReceive.dataAll.value.filter(
                        (c) => c.NO == editModalData_ProcessItem.품목입고NO
                      )[0].단위
                    }}
                    # 입고수:{{
                      task_modal_itemReceive.dataAll.value.filter(
                        (c) => c.NO == editModalData_ProcessItem.품목입고NO
                      )[0].입고수
                    }}
                  </option>
                  <option
                    v-if="!editModalData_ProcessItem.품목입고NO"
                    value=""
                    selected
                  >
                    === 추가 선택 ===
                  </option>
                  <option
                    :value="p.NO"
                    v-for="p in task_modal_itemReceive.dataAll.value"
                    :key="p.NO"
                  >
                    {{ p.입고코드 }} # 품목구분:{{ p.품목구분 }} # 품명:{{
                      p.품명
                    }}
                    # 규격:{{ p.규격 }} # 단위:{{ p.단위 }} # 입고수:{{
                      p.입고수
                    }}
                  </option>
                </select>
              </div>
              <div class="mt-3">
                <FormLabel htmlFor="vertical-form-4">수량</FormLabel>
                <FormInput
                  id="vertical-form-4"
                  type="number"
                  v-model="editModalData_ProcessItem.수량"
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
                  v-model="editModalData_ProcessItem.비고"
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
                editDataFunction_ProcessItem();
                setEditModal_ProcessItem(false);
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setEditModal_ProcessItem(false);
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
    :open="deleteModal_ProcessItem"
    @close="
      () => {
        setDeleteModal_ProcessItem(false);
      }
    "
    :initialFocus="deleteButtonRef_ProcessItem"
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
              setDeleteModal_ProcessItem(false);
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
              deleteDataFunction_ProcessItem();
              setDeleteModal_ProcessItem(false);
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

  <!-- BEGIN: ItemReceive Modal Content -->
  <Dialog
    size="xxl"
    :open="itemReceiveModal"
    @close="setItemReceiveModal(false, 0)"
  >
    <Dialog.Panel class="p-10 text-center">
      <!--ItemReceive Modal 내용 시작-->
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
              v-model="searchKey_itemReceive"
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
                v-model="searchInput_itemReceive"
                @keyup.enter="
                  () => {
                    search_itemReceive();
                    pageChangeFirst_itemReceive();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_itemReceive();
                    pageChangeFirst_itemReceive();
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
              v-model="sortKey_itemReceive"
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
              v-if="sortOrder_itemReceive == '오름차순'"
              @click="sortOrderToggle_itemReceive"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_itemReceive }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_itemReceive == '내림차순'"
              @click="sortOrderToggle_itemReceive"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_itemReceive }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_itemReceive"
              @change="pageChangeFirst_itemReceive"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_itemReceive.dataCount.value">
                전체
              </option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_itemReceive"
              :numberOfPages="task_modal_itemReceive.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_itemReceive.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_itemReceive }} /
              {{ task_modal_itemReceive.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_itemReceive.순번.style"
                  >
                    {{ table_setting_itemReceive.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목1.style"
                  >
                    {{ table_setting_itemReceive.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목2.style"
                  >
                    {{ table_setting_itemReceive.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목3.style"
                  >
                    {{ table_setting_itemReceive.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목4.style"
                  >
                    {{ table_setting_itemReceive.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목5.style"
                  >
                    {{ table_setting_itemReceive.항목5.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목6.style"
                  >
                    {{ table_setting_itemReceive.항목6.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목7.style"
                  >
                    {{ table_setting_itemReceive.항목7.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목8.style"
                  >
                    {{ table_setting_itemReceive.항목8.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목9.style"
                  >
                    {{ table_setting_itemReceive.항목9.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목10.style"
                  >
                    {{ table_setting_itemReceive.항목10.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목11.style"
                  >
                    {{ table_setting_itemReceive.항목11.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목12.style"
                  >
                    {{ table_setting_itemReceive.항목12.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_itemReceive.항목13.style"
                  >
                    {{ table_setting_itemReceive.항목13.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_itemReceive.datas.value"
                  :key="todo.LOT코드"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.순번.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_itemReceive - 1) * rowsPerPage_itemReceive
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목1.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목2.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목3.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목4.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목5.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목5.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목6.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목6.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목7.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목7.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목8.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목8.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목9.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목9.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목10.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목10.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목11.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목11.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목12.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목12.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemReceive.항목13.style"
                    @click="importItemReceive(todo.LOT코드)"
                  >
                    <div>{{ todo[table_setting_itemReceive.항목13.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_itemReceive.dataCount.value == 0"
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
            @click="setItemReceiveModal(false, 0)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: ItemReceive Modal Content -->
</template>
