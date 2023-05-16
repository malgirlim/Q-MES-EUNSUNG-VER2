<script setup lang="ts">
import { ref, Ref, onMounted, watch } from "vue";
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
  MasterUser,
  MasterFacility,
  MasterDefect,
  MasterNonWork,
} from "../../interfaces/menu/MasterInterface";
import {
  ProductionTaskProcess,
  ProductionTaskProcessItem,
  ProductionTaskCurrent,
  ProductionResult,
  ProductionResultUseItem,
  ProductionResultDefect,
  ProductionResultNonWork,
} from "../../interfaces/menu/productionInterface";
import {
  StockItemProcess,
  StockProcess,
} from "../../interfaces/menu/stockInterface";

// 컴포넌트 로드
import DocumentPrint from "../../components/Common/Print/Template/TaskAdd(Std)/Main.vue";

const user_level = 4; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
  task_process_item.loadDatas(); // 작업지시공정자재 데이터 불러오기
  task_modal_user.loadDatas(); // 작업자 데이터 불러오기
  task_modal_facility.loadDatas(); // 설비 데이터 불러오기
  task_modal_itemProcess.loadDatas(); // 품목재공 데이터 불러오기
  task_modal_defect.loadDatas(); // 불량 데이터 불러오기
  task_modal_nonwork.loadDatas(); // 비가동 데이터 불러오기
});

// 페이징기능
const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst = () => {
  currentPage.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// dataManager 만들기
const url = "/api/production/task/current";
const dataManager = useSendApi<ProductionTaskCurrent>(
  url,
  currentPage,
  rowsPerPage
);

// 테이블항목 설정 및 가로크기 조정
const table_setting = {
  체크박스: { name: "체크박스", style: "width: 20px" },
  선택: { name: "선택", style: "width: 20px; text-align: center;" },
  순번: { name: "순번", style: "width: 20px; text-align: center;" },
  항목1: { name: "작업코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "시작일", style: "width: 100px; text-align: center;" },
  항목3: { name: "작업자", style: "width: 50px; text-align: center;" },
  항목4: { name: "공정명", style: "width: 50px; text-align: center;" },
  항목5: { name: "설비명", style: "width: 50px; text-align: center;" },
  항목6: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목7: { name: "품명", style: "width: 100px; text-align: center;" },
  항목8: { name: "규격", style: "width: 100px; text-align: center;" },
  항목9: { name: "단위", style: "width: 50px; text-align: center;" },
  항목10: { name: "지시수량", style: "width: 50px; text-align: center;" },
  항목11: { name: "생산양품수량", style: "width: 50px; text-align: center;" },
  항목12: { name: "진행상황", style: "width: 110px; text-align: center;" },
  투입자재: { name: "투입자재", style: "width: 50px; text-align: center;" },
  진행: { name: "진행등록", style: "width: 120px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 50px; text-align: center;" },
  편집: { name: "편집", style: "width: 150px; text-align: center;" },
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

// ########################## 등록, 수정, 삭제, 상세 Modal ##########################
// ##### 등록 Modal #####
let insertModalData: ProductionTaskCurrent;
const insertModal = ref(false);
const setInsertModal = (value: boolean) => {
  // insertModal.value = value;
  // insertModalData = {}; // 변수 초기화
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
  editModal.value = value;
  search();
};
let editModalData: ProductionTaskCurrent; // 수정할 변수
// 수정버튼 누르면 실행되는 함수
const editDataFunction = async () => {
  await dataManager.editData(editModalData); // await : 이 함수가 끝나야 다음으로 넘어간다
  search();
};

// ##### 삭제 Modal #####
const deleteModal = ref(false);
const setDeleteModal = (value: boolean) => {
  deleteModal.value = value;
};
const deleteButtonRef = ref(null);
// 삭제버튼 누르면 실행되는 함수
const deleteDataFunction = async () => {
  await dataManager.deleteData(checkDebug.value); // await : 이 함수가 끝나야 다음으로 넘어간다
  resetCheckBox();
  search();
};

// ##### 투입자재 Modal #####
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

// ############################################ 작업지시공정자재 가져오기 ############################################
// 작업지시공정자재 데이터
const url_task_process_item = "/api/production/task/current/processitem";
const task_process_item = useSendApi<ProductionTaskProcessItem>(
  url_task_process_item,
  ref(1),
  ref(100)
);

// ############################################### 작업상태 변경하기 ###############################################
// ########################## 작업반려 Modal ##########################
const TaskReturnModal = ref(false);
const setTaskReturnModal = (value: boolean) => {
  if (user_level >= 3) {
    TaskReturnModal.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// ########################## 작업수락 Modal ##########################
const TaskAcceptModal = ref(false);
const setTaskAcceptModal = (value: boolean) => {
  if (user_level >= 3) {
    TaskAcceptModal.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// ########################## 작업시작 Modal ##########################
const TaskStartModal = ref(false);
const setTaskStartModal = (value: boolean) => {
  if (user_level >= 3) {
    TaskStartModal.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// ########################## 실적입력 Modal ##########################
const resultModal = ref(false);
const setResultModal = (value: boolean) => {
  if (user_level >= 3) {
    resultModal.value = value;
    productionResult.value.지시공정NO = editModalData.NO;
    productionResult.value.작업코드 = editModalData.작업코드;
    productionResult.value.품목구분 = editModalData.품목구분;
    productionResult.value.품번 = editModalData.품번;
    productionResult.value.품명 = editModalData.품명;
    productionResult.value.규격 = editModalData.규격;
    productionResult.value.단위 = editModalData.단위;
    productionResult.value.지시수량 = editModalData.지시수량;
    productionResult.value.공정 = editModalData.공정명;
    productionResult.value.설비NO = editModalData.설비NO;
    productionResult.value.설비명 = editModalData.설비명;
    productionResult.value.작업자ID = editModalData.작업자ID;
    productionResult.value.작업자 = editModalData.작업자;
    productionResult.value.시작일시 = moment(
      `${editModalData.시작일} 09:00:01`,
      "YYYY-MM-DD HH:mm:ss"
    ).format("YYYY-MM-DD HH:mm:ss");
    productionResult.value.종료일시 = moment().format("YYYY-MM-DD HH:mm:ss");
    productionResult.value.생산수 = 0;
    productionResult.value.불량수 = 0;
    useitemlist.value = [];
    for (var processitem of task_process_item.dataAll.value.filter(
      (item) => item.작업지시공정NO == editModalData.NO
    )) {
      let maxNO = useitemlist.value
        .filter((item) => item.NO)
        .reduce((prev, curr) => (prev > curr.NO! ? prev : curr.NO!), 0);
      useitemlist.value.push({
        ...useItemInit,
        NO: maxNO + 2,
        품목재공NO: task_modal_itemProcess.dataAll.value.filter(
          (c) => c.지시공정자재NO == processitem.NO
        )[0].NO,
        재고코드: task_modal_itemProcess.dataAll.value.filter(
          (c) => c.지시공정자재NO == processitem.NO
        )[0].입고코드,
        품목구분: task_modal_itemProcess.dataAll.value.filter(
          (c) => c.지시공정자재NO == processitem.NO
        )[0].품목구분,
        품명: task_modal_itemProcess.dataAll.value.filter(
          (c) => c.지시공정자재NO == processitem.NO
        )[0].품명,
        규격: task_modal_itemProcess.dataAll.value.filter(
          (c) => c.지시공정자재NO == processitem.NO
        )[0].규격,
        단위: task_modal_itemProcess.dataAll.value.filter(
          (c) => c.지시공정자재NO == processitem.NO
        )[0].단위,
        수량: task_modal_itemProcess.dataAll.value.filter(
          (c) => c.지시공정자재NO == processitem.NO
        )[0].재공수량,
      });
    }
    defectlist.value = [];
    nonworklist.value = [];
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
// 실적입력 확인 모달
const resultCheckModal = ref(false);
const setResultCheckModal = (value: boolean) => {
  resultCheckModal.value = value;
};
// 생산실적 등록할 곳
const url_result = "/api/production/task/current/result";
const task_current_result = useSendApi<ProductionResult>(
  url_result,
  ref(1),
  ref(10)
);
const url_resultuseitem = "/api/production/task/current/resultuseitem";
const task_current_resultuseitem = useSendApi<ProductionResultUseItem>(
  url_resultuseitem,
  ref(1),
  ref(10)
);
const url_resultdefect = "/api/production/task/current/resultdefect";
const task_current_resultdefect = useSendApi<ProductionResultDefect>(
  url_resultdefect,
  ref(1),
  ref(10)
);
const url_resultnonwork = "/api/production/task/current/resultnonwork";
const task_current_resultnonwork = useSendApi<ProductionResultNonWork>(
  url_resultnonwork,
  ref(1),
  ref(10)
);
// 생산실적 등록
const resultInsert = async () => {
  // console.log(productionResult.value);
  // console.log(useitemlist.value);
  // console.log(defectlist.value);
  // console.log(nonworklist.value);
  try {
    await task_current_result.insertData(productionResult.value);
    await task_current_resultuseitem.insertAllData(useitemlist.value);
    await task_current_resultdefect.insertAllData(defectlist.value);
    await task_current_resultnonwork.insertAllData(nonworklist.value);

    // 만약 데이터가 잘 들어갔으면 생산수량이 지시수량을 넘어가면 작업완료로 변경
    if (
      Number(editModalData.지시수량) <=
      Number(editModalData.생산양품수량) +
        (Number(productionResult.value.생산수) -
          Number(productionResult.value.불량수))
    ) {
      editModalData.진행상황 = "작업완료";
      dataManager.editData(editModalData);
    }

    setResultCheckModal(false);
    setResultModal(false);

    dataManager.loadDatas();
  } catch (err: any) {
    console.log("실적입력 실패");
  }
};
// ############################################## 생산실적 저장하기 ##############################################
// 품목 리스트를 저장할 곳
const productionResult: ProductionResult = ref({
  NO: 1,
  지시공정NO: undefined,
  작업코드: undefined,
  품목구분: undefined,
  품번: undefined,
  품명: undefined,
  규격: undefined,
  단위: undefined,
  지시수량: undefined,
  공정: undefined,
  설비NO: undefined,
  설비명: undefined,
  작업자ID: undefined,
  작업자: undefined,
  시작일시: undefined,
  종료일시: undefined,
  생산수: 0,
  불량수: 0,
  특이사항: undefined,
  비고: undefined,
  등록자: undefined,
  등록일시: undefined,
});

// ############################################## 생산실적 소요자재 저장하기 ##############################################
const useItemInit: ProductionResultUseItem = {
  NO: undefined,
  생산실적NO: undefined,
  품목재공NO: undefined,
  재고코드: undefined,
  품목구분: undefined,
  품명: undefined,
  규격: undefined,
  단위: undefined,
  수량: undefined,
  비고: undefined,
  등록자: undefined,
  등록일시: undefined,
};

// 품목 리스트를 저장할 곳
let useitemlist = ref<ProductionResultUseItem[]>([]);

// 품목 리스트 행 추가
const addRows_useitem = () => {
  // NO에서 가장 큰 숫자를 찾기
  let maxNO = useitemlist.value
    .filter((item) => item.NO)
    .reduce((prev, curr) => (prev > curr.NO! ? prev : curr.NO!), 0);
  useitemlist.value.push({ ...useItemInit, NO: maxNO + 2 });
};

// 품목 리스트 행 삭제
const removeRows_useitem = (index: number) => {
  useitemlist.value.splice(index, 1);
};

// ############################################## 생산실적 불량 저장하기 ##############################################
const defectInit: ProductionResultDefect = {
  NO: undefined,
  생산실적NO: undefined,
  불량NO: undefined,
  불량코드: undefined,
  구분: undefined,
  불량명: undefined,
  수량: undefined,
  비고: undefined,
  등록자: undefined,
  등록일시: undefined,
};

// 불량 리스트를 저장할 곳
let defectlist = ref<ProductionResultDefect[]>([]);

// 불량 리스트 행 추가
const addRows_defect = () => {
  // NO에서 가장 큰 숫자를 찾기
  let maxNO = defectlist.value
    .filter((item) => item.NO)
    .reduce((prev, curr) => (prev > curr.NO! ? prev : curr.NO!), 0);
  defectlist.value.push({ ...defectInit, NO: maxNO + 2 });
};

// 불량 리스트 행 삭제
const removeRows_defect = (index: number) => {
  defectlist.value.splice(index, 1);

  // 불량수 변경
  productionResult.value.불량수 = defectlist.value
    .filter((item) => item.수량)
    .reduce((acc, cur) => Number(acc) + Number(cur.수량) || 0, 0);
};

// 불량 리스트의 수량값 변경 시 실적입력 불량수 변경
const defect_change = () => {
  // 불량수 변경
  productionResult.value.불량수 = String(
    defectlist.value
      .filter((item) => item.수량)
      .reduce((acc, cur) => Number(acc) + Number(cur.수량) || 0, 0)
  );
};

// ############################################## 생산실적 비가동 저장하기 ##############################################
const nonworkInit: ProductionResultNonWork = {
  NO: undefined,
  생산실적NO: undefined,
  비가동NO: undefined,
  비가동코드: undefined,
  구분: undefined,
  비가동명: undefined,
  내용: undefined,
  시작일시: undefined,
  종료일시: undefined,
  비고: undefined,
  등록자: undefined,
  등록일시: undefined,
};

// 품목 리스트를 저장할 곳
let nonworklist = ref<ProductionResultDefect[]>([]);

// 품목 리스트 행 추가
const addRows_nonwork = () => {
  // NO에서 가장 큰 숫자를 찾기
  let maxNO = nonworklist.value
    .filter((item) => item.NO)
    .reduce((prev, curr) => (prev > curr.NO! ? prev : curr.NO!), 0);
  nonworklist.value.push({
    ...nonworkInit,
    NO: maxNO + 2,
    시작일시: moment().format("YYYY-MM-DD HH:mm:ss"),
    종료일시: moment().format("YYYY-MM-DD HH:mm:ss"),
  });
};

// 품목 리스트 행 삭제
const removeRows_nonwork = (index: number) => {
  nonworklist.value.splice(index, 1);
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
  productionResult.value.설비NO = no;
  productionResult.value.설비명 = task_modal_facility.dataAll.value.filter(
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
  productionResult.value.작업자ID = no;
  productionResult.value.작업자 = task_modal_user.dataAll.value.filter(
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
  항목3: { name: "입고코드", style: "width: 50px; text-align: center;" },
  항목4: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목5: { name: "품명", style: "width: 50px; text-align: center;" },
  항목6: { name: "규격", style: "width: 50px; text-align: center;" },
  항목7: { name: "단위", style: "width: 50px; text-align: center;" },
  항목8: { name: "재공수량", style: "width: 50px; text-align: center;" },
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
const itemProcessModalIndex = ref(0);
const setItemProcessModal = (value: boolean, no: any) => {
  itemProcessModal.value = value;
  itemProcessModalIndex.value = no;
};

// 모달에서 선택한 품목을 itemProcesslist에 넣기
const importItemProcess = (no: any) => {
  useitemlist.value.filter(
    (c) => c.NO == itemProcessModalIndex.value
  )[0].품목재공NO = no;
  useitemlist.value.filter(
    (c) => c.NO == itemProcessModalIndex.value
  )[0].재고코드 = task_modal_itemProcess.dataAll.value.filter(
    (c) => c.NO == no
  )[0].입고코드;
  useitemlist.value.filter(
    (c) => c.NO == itemProcessModalIndex.value
  )[0].품목구분 = task_modal_itemProcess.dataAll.value.filter(
    (c) => c.NO == no
  )[0].품목구분;
  useitemlist.value.filter((c) => c.NO == itemProcessModalIndex.value)[0].품명 =
    task_modal_itemProcess.dataAll.value.filter((c) => c.NO == no)[0].품명;
  useitemlist.value.filter((c) => c.NO == itemProcessModalIndex.value)[0].규격 =
    task_modal_itemProcess.dataAll.value.filter((c) => c.NO == no)[0].규격;
  useitemlist.value.filter((c) => c.NO == itemProcessModalIndex.value)[0].단위 =
    task_modal_itemProcess.dataAll.value.filter((c) => c.NO == no)[0].단위;
  itemProcessModalIndex.value = 0;
  setItemProcessModal(false, 0);
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
const table_setting_defect = {
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
const defectModalIndex = ref(0);
const setDefectModal = (value: boolean, no: any) => {
  defectModal.value = value;
  defectModalIndex.value = no;
};

// 모달에서 선택한 품목을 itemProcesslist에 넣기
const importDefect = (no: any) => {
  defectlist.value.filter((c) => c.NO == defectModalIndex.value)[0].불량NO = no;
  defectlist.value.filter((c) => c.NO == defectModalIndex.value)[0].불량코드 =
    task_modal_defect.dataAll.value.filter((c) => c.NO == no)[0].코드;
  defectlist.value.filter((c) => c.NO == defectModalIndex.value)[0].구분 =
    task_modal_defect.dataAll.value.filter((c) => c.NO == no)[0].구분;
  defectlist.value.filter((c) => c.NO == defectModalIndex.value)[0].불량명 =
    task_modal_defect.dataAll.value.filter((c) => c.NO == no)[0].불량명;
  defectModalIndex.value = 0;
  setDefectModal(false, 0);
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
const table_setting_nonwork = {
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
const nonworkModalIndex = ref(0);
const setNonworkModal = (value: boolean, no: any) => {
  nonworkModal.value = value;
  nonworkModalIndex.value = no;
};

// 모달에서 선택한 품목을 itemProcesslist에 넣기
const importNonwork = (no: any) => {
  nonworklist.value.filter((c) => c.NO == nonworkModalIndex.value)[0].비가동NO =
    no;
  nonworklist.value.filter(
    (c) => c.NO == nonworkModalIndex.value
  )[0].비가동코드 = task_modal_nonwork.dataAll.value.filter(
    (c) => c.NO == no
  )[0].코드;
  nonworklist.value.filter((c) => c.NO == nonworkModalIndex.value)[0].구분 =
    task_modal_nonwork.dataAll.value.filter((c) => c.NO == no)[0].구분;
  nonworklist.value.filter((c) => c.NO == nonworkModalIndex.value)[0].비가동명 =
    task_modal_nonwork.dataAll.value.filter((c) => c.NO == no)[0].비가동명;
  nonworklist.value.filter((c) => c.NO == nonworkModalIndex.value)[0].내용 =
    task_modal_nonwork.dataAll.value.filter((c) => c.NO == no)[0].내용;
  nonworkModalIndex.value = 0;
  setNonworkModal(false, 0);
};
</script>

##############################################################################################################
##############################################################################################################
##############################################################################################################

<template>
  <div v-if="user_level >= 2">
    <!--BEGIN : ################## LEVEL1  ####################### -->

    <div class="container" style="display: flex; max-width: 100%">
      <div class="item" style="flex: 1 1 40%">
        <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
        <div class="grid grid-cols-12 gap-1 mt-1">
          <div
            class="flex flex-wrap items-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
          >
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
                <option>작업코드</option>
                <option>구분</option>
                <option>품번</option>
                <option>품명</option>
                <option>규격</option>
                <option>단위</option>
                <option>시작일</option>
                <option>공정명</option>
                <option>설비명</option>
                <option>작업자</option>
                <option>진행상황</option>
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
                <option>작업코드</option>
                <option>구분</option>
                <option>품명</option>
                <option>규격</option>
                <option>수량</option>
                <option>공정명</option>
                <option>설비명</option>
                <option>작업자</option>
                <option>시작일</option>
                <option>진행상황</option>
                <option>비고</option>
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
              style="overflow-y: scroll; overflow-x: hidden; height: 580px"
            >
              <Table class="border-spacing-y-[8px] border-separate -mt-2">
                <Table.Thead
                  class="bg-slate-100"
                  style="position: sticky; top: 0px; z-index: 2"
                >
                  <Table.Tr>
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
                      :style="table_setting.투입자재.style"
                    >
                      {{ table_setting.투입자재.name }}
                    </Table.Th>
                    <Table.Th
                      class="text-center border-b-0 whitespace-nowrap font-bold"
                      :style="table_setting.진행.style"
                    >
                      {{ table_setting.진행.name }}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody style="position: relative; z-index: 1">
                  <Table.Tr
                    v-for="(todo, index) in dataManager.datas.value"
                    :key="todo.NO"
                    class="intro-x"
                  >
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                      :style="table_setting.순번.style"
                    >
                      <div>
                        {{ index + 1 + (currentPage - 1) * rowsPerPage }}
                      </div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
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
                      :class="[
                        'first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]',
                        { 'text-gray-500': todo.진행상황 == '작업보류' },
                        { 'text-danger': todo.진행상황 == '작업반려' },
                        { 'text-black': todo.진행상황 == '작업미확인' },
                        { 'text-orange-500': todo.진행상황 == '작업대기' },
                        { 'text-success': todo.진행상황 == '작업중' },
                        { 'text-blue-600': todo.진행상황 == '작업완료' },
                      ]"
                      :style="table_setting.항목12.style"
                    >
                      <div class="flex items-center">
                        <div>
                          <Lucide
                            class="w-5 h-5 mr-1"
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
                          {{ todo[table_setting.항목12.name] }}
                        </div>
                      </div>
                    </Table.Td>
                    <Table.Td
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400"
                      :style="table_setting.투입자재.style"
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
                      class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400"
                      :style="table_setting.진행.style"
                    >
                      <div
                        class="flex items-center justify-center text-danger"
                        v-if="
                          todo.진행상황 == '작업보류' ||
                          todo.진행상황 == '작업완료' ||
                          todo.진행상황 == '작업반려'
                        "
                      ></div>
                      <div
                        class="flex items-center justify-center text-danger"
                        v-if="todo.진행상황 == '작업미확인'"
                      >
                        <Button
                          class="flex items-center mr-2 h-8"
                          variant="primary"
                          @click="
                            () => {
                              editModalData = todo;
                              setTaskAcceptModal(true);
                            }
                          "
                        >
                          <Lucide icon="PlayCircle" class="w-4 h-4 mr-1" />
                          수락
                        </Button>
                        <Button
                          class="flex items-center h-8"
                          variant="danger"
                          @click="
                            () => {
                              editModalData = todo;
                              setTaskReturnModal(true);
                            }
                          "
                        >
                          <Lucide icon="XCircle" class="w-4 h-4 mr-1" />
                          반려
                        </Button>
                      </div>
                      <div
                        class="flex items-center justify-center text-white"
                        v-if="todo.진행상황 == '작업대기'"
                      >
                        <Button
                          class="flex items-center text-white h-8"
                          variant="success"
                          @click="
                            () => {
                              editModalData = todo;
                              setTaskStartModal(true);
                            }
                          "
                        >
                          <Lucide icon="PlayCircle" class="w-4 h-4 mr-1" />
                          작업시작
                        </Button>
                      </div>
                      <div
                        class="flex items-center justify-center text-white"
                        v-if="todo.진행상황 == '작업중'"
                      >
                        <Button
                          class="flex items-center text-white h-8"
                          variant="facebook"
                          @click="
                            () => {
                              editModalData = todo;
                              setResultModal(true);
                            }
                          "
                        >
                          <Lucide icon="Pencil" class="w-4 h-4 mr-1" />
                          실적입력
                        </Button>
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

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: 투입자재 상세정보 Modal Content -->
  <Dialog
    size="xl"
    :open="detailModal"
    @close="
      () => {
        setDetailModal(false);
      }
    "
  >
    <Dialog.Panel>
      <div class="text-center text-xl p-5">
        <strong>투입자재 상세정보</strong>
      </div>
      <div style="overflow-y: scroll; overflow-x: hidden; height: 500px">
        <Table class="mb-5">
          <Table.Thead>
            <Table.Tr class="text-center">
              <Table.Th> 순번 </Table.Th>
              <Table.Th> LOT코드 </Table.Th>
              <Table.Th> 품목코드 </Table.Th>
              <Table.Th> 품목구분 </Table.Th>
              <Table.Th> 품명 </Table.Th>
              <Table.Th> 단위 </Table.Th>
              <Table.Th> 수량 </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr
              class="text-center"
              v-for="(todo, index) in task_process_item.dataAll.value.filter(
                (item) => item.작업지시공정NO == editModalData.NO
              )"
              :key="todo.NO"
            >
              <Table.Td> {{ index + 1 }} </Table.Td>
              <Table.Td> {{ todo.LOT코드 }} </Table.Td>
              <Table.Td> {{ todo.품번 }} </Table.Td>
              <Table.Td> {{ todo.품목구분 }} </Table.Td>
              <Table.Td> {{ todo.품명 }} </Table.Td>
              <Table.Td> {{ todo.단위 }} </Table.Td>
              <Table.Td> {{ todo.수량 }} </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <div
          class="text-center mt-20"
          v-if="
            task_process_item.dataAll.value.filter(
              (item) => item.작업지시공정NO == editModalData.NO
            ).length == 0
          "
        >
          투입자재 데이터가 없습니다.
        </div>
      </div>
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
  <!-- END: 투입자재 상세정보 Modal Content -->

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

  <!-- #########################################################################################################################
  #########################################################################################################################
  #########################################################################################################################
   -->

  <!-- BEGIN: 작업반려 Modal -->
  <Dialog
    :open="TaskReturnModal"
    @close="
      () => {
        setTaskReturnModal(false);
      }
    "
    :initialFocus="deleteButtonRef"
  >
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl">반려</div>
        <div class="mt-2 text-slate-500">작업을 반려하시겠습니까?</div>
        <div style="text-align: left">
          <div class="mt-3">
            <FormLabel htmlFor="vertical-form-3">반려사유</FormLabel>
            <FormInput
              id="vertical-form-3"
              type="text"
              v-model="editModalData.비고"
              placeholder="여기에 반려사유을 입력해주세요"
            />
          </div>
        </div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          @click="
            () => {
              setTaskReturnModal(false);
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
              editModalData.진행상황 = '작업반려';
              dataManager.editData(editModalData);
              setTaskReturnModal(false);
            }
          "
        >
          반려
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업반려 Modal -->

  <!-- BEGIN: 작업수락 Modal -->
  <Dialog
    :open="TaskAcceptModal"
    @close="
      () => {
        setTaskAcceptModal(false);
      }
    "
    :initialFocus="deleteButtonRef"
  >
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="HelpCircle" class="w-16 h-16 mx-auto mt-3 text-primary" />
        <div class="mt-5 text-3xl">수락</div>
        <div class="mt-2 text-slate-500">작업을 수락하시겠습니까?</div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          @click="
            () => {
              setTaskAcceptModal(false);
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
          ref="deleteButtonRef"
          @click="
            () => {
              editModalData.진행상황 = '작업대기';
              dataManager.editData(editModalData);
              setTaskAcceptModal(false);
            }
          "
        >
          수락
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업수락 Modal -->

  <!-- BEGIN: 작업시작 Modal -->
  <Dialog
    :open="TaskStartModal"
    @close="
      () => {
        setTaskStartModal(false);
      }
    "
    :initialFocus="deleteButtonRef"
  >
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="PlayCircle" class="w-16 h-16 mx-auto mt-3 text-success" />
        <div class="mt-5 text-3xl">시작</div>
        <div class="mt-2 text-slate-500">작업을 시작하시겠습니까?</div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          @click="
            () => {
              setTaskStartModal(false);
            }
          "
          class="w-24 mr-1"
        >
          취소
        </Button>
        <Button
          variant="success"
          type="button"
          class="w-24 text-white"
          ref="deleteButtonRef"
          @click="
            () => {
              editModalData.진행상황 = '작업중';
              dataManager.editData(editModalData);
              setTaskStartModal(false);
            }
          "
        >
          시작
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업시작 Modal -->

  <!-- #########################################################################################################################
  #########################################################################################################################
  #########################################################################################################################
   -->

  <!-- BEGIN: 실적입력 Modal Content -->
  <Dialog size="xl" :open="resultModal">
    <Dialog.Panel>
      <div class="text-center text-xl p-5">
        <strong>공정별 작업실적 입력</strong>
      </div>
      <div class="text-center text-lg">
        <strong>작업 공정 정보</strong>
      </div>
      <div class="intro-y p-5 mr-4">
        <Table.Tbody>
          <Table.Th
            class="bg-gray-300"
            style="
              border-left-width: 1px;
              border-right-width: 1px;
              width: 120px;
            "
            ><strong>작업코드</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 120px"
            ><strong>공정</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 120px"
            ><strong>품목구분</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 200px"
            ><strong>품명</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 200px"
            ><strong>규격</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 120px"
            ><strong>지시수량</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 100px"
            ><strong>단위</strong>
          </Table.Th>
        </Table.Tbody>
        <Table.Tbody>
          <Table.Tr class="text-center">
            <Table.Td
              class="px-1 py-1"
              style="border-left-width: 1px; border-right-width: 1px"
              >{{ productionResult.작업코드 }}
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px"
              >{{ productionResult.공정 }}
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px"
              >{{ productionResult.품목구분 }}
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px"
              >{{ productionResult.품명 }}
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px"
              >{{ productionResult.규격 }}
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px"
              >{{ productionResult.지시수량 }}
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px"
              >{{ productionResult.단위 }}
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </div>

      <div class="text-center text-lg">
        <strong>실적 입력</strong>
      </div>
      <div class="intro-y p-5 mr-4">
        <Table.Tbody>
          <Table.Th
            class="bg-gray-300"
            style="
              border-left-width: 1px;
              border-right-width: 1px;
              width: 150px;
            "
            ><strong>작업자</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 150px"
            ><strong>설비</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 150px"
            ><strong>생산수</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 150px"
            ><strong>양품수</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 150px"
            ><strong>시작일시</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 150px"
            ><strong>종료일시</strong>
          </Table.Th>
        </Table.Tbody>
        <Table.Tbody>
          <Table.Tr class="text-center">
            <Table.Td
              class="px-1 py-1"
              style="border-left-width: 1px; border-right-width: 1px"
            >
              <FormInput
                class="text-center"
                type="text"
                formInputSize="sm"
                :value="productionResult.작업자"
                v-model="productionResult.작업자"
                @click="setUserModal(true)"
              >
              </FormInput>
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px">
              <FormInput
                class="text-center"
                type="text"
                formInputSize="sm"
                :value="productionResult.설비명"
                v-model="productionResult.설비명"
                @click="setFacilityModal(true)"
              >
              </FormInput>
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px"
              ><FormInput
                class="text-center"
                type="number"
                formInputSize="sm"
                :value="productionResult.생산수"
                v-model="productionResult.생산수"
              ></FormInput>
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px"
              ><FormInput
                class="text-center"
                type="text"
                formInputSize="sm"
                :value="
                  Number(productionResult.생산수) -
                  Number(productionResult.불량수)
                "
                readonly
              ></FormInput>
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px">
              <FormInput
                type="datetime-local"
                formInputSize="sm"
                :value="productionResult.시작일시"
                v-model="productionResult.시작일시"
              ></FormInput>
            </Table.Td>
            <Table.Td class="px-1 py-1" style="border-right-width: 1px">
              <FormInput
                type="datetime-local"
                formInputSize="sm"
                :value="productionResult.종료일시"
                v-model="productionResult.종료일시"
              ></FormInput>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
        <Table.Tbody>
          <Table.Th
            class="bg-gray-300"
            style="border-left-width: 1px; border-right-width: 1px"
            colspan="7"
            ><strong>특이사항</strong>
          </Table.Th>
        </Table.Tbody>
        <Table.Tbody>
          <Table.Tr class="text-center">
            <Table.Td
              colspan="7"
              class="px-1 py-1"
              style="border-left-width: 1px; border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                :value="productionResult.특이사항"
                v-model="productionResult.특이사항"
              ></FormInput>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </div>

      <div class="px-5">
        <hr class="mb-5 text-slate-200 intro-y" style="border: dashed 2px" />
      </div>

      <Tab.Group class="px-5">
        <Tab.List variant="boxed-tabs">
          <Tab>
            <Tab.Button class="w-full py-1 text-lg" as="button">
              <strong>소요 자재</strong>
            </Tab.Button>
          </Tab>
          <Tab>
            <Tab.Button class="w-full py-1 text-lg" as="button">
              <strong>불량 사유</strong>
            </Tab.Button>
          </Tab>
          <Tab>
            <Tab.Button class="w-full py-1 text-lg" as="button">
              <strong>비가동 사유</strong>
            </Tab.Button>
          </Tab>
        </Tab.List>
        <Tab.Panels class="mt-5">
          <Tab.Panel class="leading-relaxed">
            <div
              class="overflow-hidden"
              style="overflow-y: scroll; overflow-x: hidden; height: 200px"
            >
              <div class="p-0">
                <Table.Tbody style="position: sticky; top: 0px; z-index: 2">
                  <Table.Th
                    class="bg-gray-300"
                    style="
                      border-left-width: 1px;
                      border-right-width: 1px;
                      width: 50px;
                    "
                    ><Lucide
                      icon="PlusCircle"
                      class="w-5 h-5"
                      @click="addRows_useitem"
                    />
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 150px"
                    ><strong>재고코드</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 150px"
                    ><strong>품목구분</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 250px"
                    ><strong>품명</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 250px"
                    ><strong>규격</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 100px"
                    ><strong>단위</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 100px"
                    ><strong>수량</strong>
                  </Table.Th>
                </Table.Tbody>
                <Table.Tbody>
                  <Table.Tr
                    class="text-center"
                    v-for="(useitem, index) in useitemlist"
                    :key="useitem.NO"
                  >
                    <Table.Td
                      class="px-1 py-1"
                      style="border-left-width: 1px; border-right-width: 1px"
                    >
                      <Lucide
                        icon="MinusCircle"
                        class="ml-4 w-5 h-5"
                        @click="removeRows_useitem(index)"
                      />
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="useitem.재고코드"
                        v-model="useitem.재고코드"
                        @click="setItemProcessModal(true, useitem.NO)"
                      ></FormInput>
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="useitem.품목구분"
                        v-model="useitem.품목구분"
                        readonly
                      ></FormInput>
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="useitem.품명"
                        v-model="useitem.품명"
                        readonly
                      ></FormInput>
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="useitem.규격"
                        v-model="useitem.규격"
                        readonly
                      ></FormInput>
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="useitem.단위"
                        v-model="useitem.단위"
                        readonly
                      ></FormInput>
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="number"
                        formInputSize="sm"
                        v-model="useitem.수량"
                      ></FormInput>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="">
            <div
              class="overflow-hidden"
              style="overflow-y: scroll; overflow-x: hidden; height: 200px"
            >
              <div class="p-0">
                <Table.Tbody style="position: sticky; top: 0px; z-index: 2">
                  <Table.Th
                    class="bg-gray-300"
                    style="
                      border-left-width: 1px;
                      border-right-width: 1px;
                      width: 50px;
                    "
                    ><Lucide
                      icon="PlusCircle"
                      class="w-5 h-5"
                      @click="addRows_defect"
                    />
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 150px"
                    ><strong>불량코드</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 150px"
                    ><strong>구분</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 250px"
                    ><strong>불량명</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 250px"
                    ><strong>수량</strong>
                  </Table.Th>
                </Table.Tbody>
                <Table.Tbody>
                  <Table.Tr
                    class="text-center"
                    v-for="(defect, index) in defectlist"
                    :key="defect.NO"
                  >
                    <Table.Td
                      class="px-1 py-1"
                      style="border-left-width: 1px; border-right-width: 1px"
                    >
                      <Lucide
                        icon="MinusCircle"
                        class="ml-4 w-5 h-5"
                        @click="removeRows_defect(index)"
                      />
                    </Table.Td>

                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="defect.불량코드"
                        v-model="defect.불량코드"
                        @click="setDefectModal(true, defect.NO)"
                      ></FormInput>
                    </Table.Td>

                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="defect.구분"
                        v-model="defect.구분"
                        readonly
                      ></FormInput>
                    </Table.Td>

                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="defect.불량명"
                        v-model="defect.불량명"
                        readonly
                      ></FormInput>
                    </Table.Td>

                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="number"
                        formInputSize="sm"
                        @change="defect_change"
                        v-model="defect.수량"
                      ></FormInput>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel class="leading-relaxed">
            <div
              class="overflow-hidden"
              style="overflow-y: scroll; overflow-x: hidden; height: 200px"
            >
              <div class="p-0">
                <Table.Tbody style="position: sticky; top: 0px; z-index: 2">
                  <Table.Th
                    class="bg-gray-300"
                    style="
                      border-left-width: 1px;
                      border-right-width: 1px;
                      width: 50px;
                    "
                    ><Lucide
                      icon="PlusCircle"
                      class="w-5 h-5"
                      @click="addRows_nonwork"
                    />
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 250px"
                    ><strong>비가동코드</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 150px"
                    ><strong>구분</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 200px"
                    ><strong>비가동명</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 250px"
                    ><strong>내용</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 170px"
                    ><strong>시작일시</strong>
                  </Table.Th>
                  <Table.Th
                    class="bg-gray-300"
                    style="border-right-width: 1px; width: 170px"
                    ><strong>종료일시</strong>
                  </Table.Th>
                </Table.Tbody>
                <Table.Tbody>
                  <Table.Tr
                    class="text-center"
                    v-for="(nonwork, index) in nonworklist"
                    :key="nonwork.NO"
                  >
                    <Table.Td
                      class="px-1 py-1"
                      style="border-left-width: 1px; border-right-width: 1px"
                    >
                      <Lucide
                        icon="MinusCircle"
                        class="ml-4 w-5 h-5"
                        @click="removeRows_nonwork(index)"
                      />
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="nonwork.비가동코드"
                        v-model="nonwork.비가동코드"
                        @click="setNonworkModal(true, nonwork.NO)"
                      ></FormInput>
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="nonwork.구분"
                        v-model="nonwork.구분"
                        readonly
                      ></FormInput>
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="nonwork.비가동명"
                        v-model="nonwork.비가동명"
                        readonly
                      ></FormInput>
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="text"
                        formInputSize="sm"
                        :value="nonwork.내용"
                        v-model="nonwork.내용"
                        readonly
                      ></FormInput>
                    </Table.Td>
                    <Table.Td class="px-1 py-1" style="border-right-width: 1px"
                      ><FormInput
                        type="datetime-local"
                        step="10"
                        formInputSize="sm"
                        :value="nonwork.시작일시"
                        v-model="nonwork.시작일시"
                      ></FormInput>
                    </Table.Td>

                    <Table.Td class="px-1 py-1" style="border-right-width: 1px">
                      <FormInput
                        type="datetime-local"
                        step="10"
                        formInputSize="sm"
                        :value="nonwork.종료일시"
                        v-model="nonwork.종료일시"
                      ></FormInput>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <div class="p-3 text-center">
        <Button
          variant="outline-primary"
          as="a"
          type="button"
          @click="
            () => {
              setResultCheckModal(true);
            }
          "
          class="w-24 mr-5"
        >
          등록
        </Button>
        <Button
          variant="outline-danger"
          as="a"
          type="button"
          @click="
            () => {
              setResultModal(false);
            }
          "
          class="w-24"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 실적입력 Modal Content -->

  <!-- BEGIN: 실적입력확인 Modal -->
  <Dialog
    :open="resultCheckModal"
    @close="
      () => {
        setResultCheckModal(false);
      }
    "
  >
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide
          icon="CheckCircle"
          class="w-16 h-16 mx-auto mt-3 text-primary"
        />
        <div class="mt-5 text-3xl">실적 등록</div>
        <div class="mt-2 text-slate-500">실적을 등록하시겠습니까?</div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          @click="
            () => {
              setResultCheckModal(false);
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
          ref="deleteButtonRef"
          @click="
            () => {
              resultInsert();
            }
          "
        >
          등록
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업수락 Modal -->

  <!-- #########################################################################################################################
  #########################################################################################################################
  #########################################################################################################################
   -->

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
    @close="setItemProcessModal(false, 0)"
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
                    @click="importItemProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_itemProcess.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목2.style"
                    @click="importItemProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_itemProcess.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목3.style"
                    @click="importItemProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_itemProcess.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목4.style"
                    @click="importItemProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_itemProcess.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목5.style"
                    @click="importItemProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_itemProcess.항목5.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목6.style"
                    @click="importItemProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_itemProcess.항목6.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목7.style"
                    @click="importItemProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_itemProcess.항목7.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_itemProcess.항목8.style"
                    @click="importItemProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_itemProcess.항목8.name] }}</div>
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
            @click="setItemProcessModal(false, 0)"
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
  <Dialog size="xxl" :open="defectModal" @close="setDefectModal(false, 0)">
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
                    :style="table_setting_defect.순번.style"
                  >
                    {{ table_setting_defect.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_defect.항목1.style"
                  >
                    {{ table_setting_defect.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_defect.항목2.style"
                  >
                    {{ table_setting_defect.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_defect.항목3.style"
                  >
                    {{ table_setting_defect.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_defect.항목4.style"
                  >
                    {{ table_setting_defect.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_defect.항목5.style"
                  >
                    {{ table_setting_defect.항목5.name }}
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
                    :style="table_setting_defect.순번.style"
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
                    :style="table_setting_defect.항목1.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_defect.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_defect.항목2.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_defect.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_defect.항목3.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_defect.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_defect.항목4.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_defect.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_defect.항목5.style"
                    @click="importDefect(todo.NO)"
                  >
                    <div>{{ todo[table_setting_defect.항목5.name] }}</div>
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
            @click="setDefectModal(false, 0)"
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
  <Dialog size="xxl" :open="nonworkModal" @close="setNonworkModal(false, 0)">
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
                    :style="table_setting_nonwork.순번.style"
                  >
                    {{ table_setting_nonwork.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_nonwork.항목1.style"
                  >
                    {{ table_setting_nonwork.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_nonwork.항목2.style"
                  >
                    {{ table_setting_nonwork.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_nonwork.항목3.style"
                  >
                    {{ table_setting_nonwork.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_nonwork.항목4.style"
                  >
                    {{ table_setting_nonwork.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_nonwork.항목5.style"
                  >
                    {{ table_setting_nonwork.항목5.name }}
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
                    :style="table_setting_nonwork.순번.style"
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
                    :style="table_setting_nonwork.항목1.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>{{ todo[table_setting_nonwork.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_nonwork.항목2.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>{{ todo[table_setting_nonwork.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_nonwork.항목3.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>{{ todo[table_setting_nonwork.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_nonwork.항목4.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>{{ todo[table_setting_nonwork.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_nonwork.항목5.style"
                    @click="importNonwork(todo.NO)"
                  >
                    <div>{{ todo[table_setting_nonwork.항목5.name] }}</div>
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
            @click="setNonworkModal(false, 0)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: NonWork Modal Content -->
</template>
