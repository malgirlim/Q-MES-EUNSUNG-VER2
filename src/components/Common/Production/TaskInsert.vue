<script setup lang="ts">
import { onMounted, reactive, ref, Ref, watch } from "vue";
import { cloneDeep } from "lodash";
import Table from "../../../base-components/Table";
import Button from "../../../base-components/Button";
import { Dialog, Menu } from "../../../base-components/Headless";
import dayjs from "dayjs";
import TomSelect from "tom-select";
import {
  FormInput,
  FormSelect,
  FormCheck,
  FormTextarea,
} from "../../../base-components/Form";
import Lucide from "../../../base-components/Lucide";
import router from "../../../router";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import {
  MasterProduct,
  MasterProcess,
  MasterFacility,
  MasterUser,
} from "../../../interfaces/menu/MasterInterface";
import {
  ProductionPlan,
  ProductionTask,
  ProductionTaskProcess,
  ProductionTaskProcessItem,
} from "../../../interfaces/menu/productionInterface";
import {
  StockItemReceive,
  StockStockLOT,
} from "../../../interfaces/menu/stockInterface";
import PaginationComponent from "../../../components/Pagination/PaginationComponent.vue"; // 페이징설정

// 페이지 로딩 시 시작
onMounted(() => {
  task_modal_plan.loadDatas(); // 생산계획 데이터 불러오기
  task_modal_item.loadDatas(); // 품목 데이터 불러오기
  task_modal_process.loadDatas(); // 공정 데이터 불러오기
  task_modal_facility.loadDatas(); // 설비 데이터 불러오기
  task_modal_user.loadDatas(); // 작업자 데이터 불러오기
  task_modal_itemReceive.loadDatas(); // 품목입고 데이터 불러오기
});

// 작업지시 데이터 설정
const url_task = "/api/production/task";
const task = useSendApi<ProductionTask>(url_task, ref(1), ref(10));
// 작업지시공정 데이터 설정
const url_task_process = "/api/production/task/process";
const task_process = useSendApi<ProductionTaskProcess>(
  url_task_process,
  ref(1),
  ref(10)
);
// 작업지시공정자재 데이터 설정
const url_task_process_item = "/api/production/task/process/item";
const task_process_item = useSendApi<ProductionTaskProcessItem>(
  url_task_process_item,
  ref(1),
  ref(10)
);

// 작업지시 등록 변수
const taskInsertData: ProductionTask = ref({
  NO: 1,
  코드: undefined,
  생산계획NO: undefined,
  품목NO: undefined,
  품목구분: undefined,
  품번: undefined,
  품명: undefined,
  규격: undefined,
  단위: undefined,
  수량: 0,
  시작일: undefined,
  비고: undefined,
});

// 작업지시공정 등록 변수
const processInit: ProductionTaskProcess = {
  NO: undefined,
  작업구분: undefined,
  작업지시NO: undefined,
  공정NO: undefined,
  공정명: undefined,
  설비NO: undefined,
  설비명: undefined,
  작업자ID: undefined,
  작업자: undefined,
  품목NO: undefined,
  품번: undefined,
  구분: undefined,
  품명: undefined,
  규격: undefined,
  단위: undefined,
  수량: undefined,
  비고: undefined,
};

// 작업지시공정자재 등록 변수
const itemInit: ProductionTaskProcessItem = {
  NO: undefined,
  작업지시공정NONO: undefined,
  작업지시공정NO: undefined,
  품목NO: undefined,
  LOT코드: undefined,
  품목구분: undefined,
  품번: undefined,
  품명: undefined,
  규격: undefined,
  단위: undefined,
  수량: undefined,
  비고: undefined,
};

// 공정 리스트를 저장할 곳client
let processlist = ref<ProductionTaskProcess[]>([
  { ...processInit, NO: 1, 작업구분: "내부생산" },
]);
// 공정 리스트 행 추가
const processAddRows = () => {
  // NO에서 가장 큰 숫자를 찾기
  let maxNO = processlist.value
    .filter((item) => item.NO)
    .reduce((prev, curr) => (prev > curr.NO! ? prev : curr.NO!), 0);
  processlist.value.push({
    ...processInit,
    NO: maxNO + 2,
    작업구분: "내부생산",
    수량: taskInsertData.value.수량,
  });

  // NO가 1인 데이터를 마지막으로 보내기
  let firstItem = processlist.value.find((item) => item.NO === 1);
  if (firstItem) {
    processlist.value.splice(processlist.value.indexOf(firstItem), 1);
    processlist.value.push(firstItem);
  }
};
// 공정 리스트 행 삭제
const processRemoveRows = (index: number) => {
  // itemlist 삭제
  itemlist.value = itemlist.value.filter(
    (item) => item.작업지시공정NONO !== processlist.value[index].NO
  );
  processlist.value.splice(index, 1);
};

// 소요자재 리스트를 저장할 곳
let itemlist = ref<ProductionTaskProcessItem[]>([]);
// 소요자재 리스트 행 추가
const itemAddRows = (작업지시공정: number) => {
  // NO에서 가장 큰 숫자를 찾기
  let maxNO = itemlist.value
    .filter((item) => item.NO)
    .reduce((prev, curr) => (prev > curr.NO! ? prev : curr.NO!), 0);
  itemlist.value.push({
    ...itemInit,
    NO: maxNO + 2,
    작업지시공정NONO: 작업지시공정,
  });
};
// 소요자재 리스트 행 삭제
const itemRemoveRows = (itemNO: number) => {
  // itemlist.value.splice(index, 1);
  itemlist.value = itemlist.value.filter((item) => item.NO != itemNO);
};

// 데이터 등록
const insertData = async () => {
  // console.log(taskInsertData.value);
  // console.log(processlist.value);
  // console.log(itemlist.value);

  // 가장 먼저 작업지시 정보를 저장한다.
  await task.insertData(taskInsertData.value);

  // 작업지시의 마지막 NO를 불러온다.
  await task.loadDatas();
  var maxNO_task = task.dataAll.value
    .filter((t) => t.NO)
    .reduce((p, c) => (p > c.NO! ? p : c.NO!), 0);

  // 공정리스트의 작업지시NO를 설정해준다.
  await processlist.value.forEach((p) => {
    p.작업지시NO = maxNO_task;
    p.진행상황 = "작업미확인";
  });

  // 공정리스트에서 NO가 1인 데이터에는 작업정보등록 품목 데이터로 설정해준다.
  processlist.value.filter((c) => c.NO == 1)[0].품목NO =
    taskInsertData.value.품목NO;
  processlist.value.filter((c) => c.NO == 1)[0].수량 =
    taskInsertData.value.수량;

  // 공정을 하나씩 저장한다.
  for (var process of processlist.value) {
    await task_process.insertData(process);

    // 작업지시공정의 마지막 NO를 불러온다.
    await task_process.loadDatas();
    var maxNO_process = task_process.dataAll.value
      .filter((t) => t.NO)
      .reduce((p, c) => (p > c.NO! ? p : c.NO!), 0);

    // 작업지시공정NONO와 공정리스트 NO가 같은 것을 골라와 작업지시공정의 마지막 NO을 설정한다.
    await itemlist.value
      .filter((i) => i.작업지시공정NONO == process.NO)
      .forEach((i) => {
        i.작업지시공정NO = maxNO_process;
      });
  }

  // 공정 별 소요자재를 저장한다.
  task_process_item.insertAllData(itemlist.value);

  router.push("/production/task-add");
};

// 데이터 등록 확인 모달
const insertButtonRef = ref(null);
const insertCheckModal = ref(false);
const setInsertCheckModal = (value: boolean) => {
  insertCheckModal.value = value;
};

// ############################################### 생산계획 가져오기 ###############################################

// 생산계획 모달 설정
const planModal = ref(false);
const setPlanModal = (value: boolean) => {
  planModal.value = value;
};

// 모달에서 선택한 품목 넣기
const importPlan = (no: any) => {
  taskInsertData.value.생산계획NO = no;
  taskInsertData.value.코드 = task_modal_plan.dataAll.value.filter(
    (c) => c.NO == no
  )[0]?.수주코드;
  setPlanModal(false);
};

// 페이징기능
const currentPage_plan = ref(1); // 현재페이지
const rowsPerPage_plan = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_plan = () => {
  currentPage_plan.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 거래처 데이터 설정
const url_task_modal_plan = "/api/production/task/modal/plan";
const task_modal_plan = useSendApi<ProductionPlan>(
  url_task_modal_plan,
  currentPage_plan,
  rowsPerPage_plan
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_plan = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "수주코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "수주코드순번", style: "width: 50px; text-align: center;" },
  항목3: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목4: { name: "품번", style: "width: 50px; text-align: left;" },
  항목5: { name: "품명", style: "width: 50px; text-align: center;" },
  항목6: { name: "수주수량", style: "width: 50px; text-align: center;" },
  항목7: { name: "계획수량", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_plan = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_plan = ref("전체");
const searchInput_plan = ref("");
const sortKey_plan = ref("등록일");
const sortOrder_plan = ref("내림차순");
const sortOrderToggle_plan = () => {
  sortOrder_plan.value =
    sortOrder_plan.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_plan, sortOrder_plan], (newValue, oldValue) => {
  search_plan();
  pageChangeFirst_plan();
});
const search_plan = () => {
  // console.log(searchKey.value, searchInput.value);
  task_modal_plan.searchDatas(
    searchDate_plan.value,
    searchKey_plan.value,
    searchInput_plan.value,
    sortKey_plan.value,
    sortOrder_plan.value
  );
};

// ############################################### 품목 가져오기 ###############################################
// 페이징기능
const currentPage_item = ref(1); // 현재페이지
const rowsPerPage_item = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_item = () => {
  currentPage_item.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_task_modal_item = "/api/production/task/modal/product";
const task_modal_item = useSendApi<MasterProduct>(
  url_task_modal_item,
  currentPage_item,
  rowsPerPage_item
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_item = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "구분", style: "width: 50px; text-align: center;" },
  항목2: { name: "품번", style: "width: 50px; text-align: center;" },
  항목3: { name: "품명", style: "width: 50px; text-align: center;" },
  항목4: { name: "규격", style: "width: 50px; text-align: center;" },
  항목5: { name: "단위", style: "width: 50px; text-align: center;" },
  항목6: { name: "항목6", style: "width: 50px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_item = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_item = ref("전체");
const searchInput_item = ref("");
const sortKey_item = ref("등록일");
const sortOrder_item = ref("내림차순");
const sortOrderToggle_item = () => {
  sortOrder_item.value =
    sortOrder_item.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_item, sortOrder_item], (newValue, oldValue) => {
  search_item();
  pageChangeFirst_item();
});
const search_item = () => {
  // console.log(searchKey.value, searchInput.value);
  task_modal_item.searchDatas(
    searchDate_item.value,
    searchKey_item.value,
    searchInput_item.value,
    sortKey_item.value,
    sortOrder_item.value
  );
};

// ###################### 작업 정보 등록 품목 모달 ######################
// 품목등록 모달 설정
const itemModal = ref(false);
const setItemModal = (value: boolean) => {
  itemModal.value = value;
};

// 모달에서 선택한 품목을 itemlist에 넣기
const importItem = (no: any) => {
  taskInsertData.value.품목NO = no;
  taskInsertData.value.품목구분 = task_modal_item.dataAll.value.filter(
    (c) => c.NO == no
  )[0]?.구분;
  taskInsertData.value.품번 = task_modal_item.dataAll.value.filter(
    (c) => c.NO == no
  )[0]?.품번;
  taskInsertData.value.품명 = task_modal_item.dataAll.value.filter(
    (c) => c.NO == no
  )[0]?.품명;
  taskInsertData.value.규격 = task_modal_item.dataAll.value.filter(
    (c) => c.NO == no
  )[0]?.규격;
  taskInsertData.value.단위 = task_modal_item.dataAll.value.filter(
    (c) => c.NO == no
  )[0]?.단위;
  setItemModal(false);
};
// ###################### 공정 별 생산대상 품목 모달 ######################
// 품목등록 모달 설정
const produceitemModal = ref(false);
const produceitemModalIndex = ref(0);
const setProduceItemModal = (value: boolean, no: any) => {
  produceitemModal.value = value;
  produceitemModalIndex.value = no;
};

// 모달에서 선택한 품목을 itemlist에 넣기
const importProduceItem = (no: any) => {
  processlist.value.filter(
    (c) => c.NO == produceitemModalIndex.value
  )[0].품목NO = no;
  processlist.value.filter(
    (c) => c.NO === produceitemModalIndex.value
  )[0].품번 = task_modal_item.dataAll.value.filter((c) => c.NO == no)[0]?.품번;
  processlist.value.filter(
    (c) => c.NO === produceitemModalIndex.value
  )[0].구분 = task_modal_item.dataAll.value.filter((c) => c.NO == no)[0]?.구분;
  processlist.value.filter(
    (c) => c.NO === produceitemModalIndex.value
  )[0].품명 = task_modal_item.dataAll.value.filter((c) => c.NO == no)[0]?.품명;
  processlist.value.filter(
    (c) => c.NO === produceitemModalIndex.value
  )[0].규격 = task_modal_item.dataAll.value.filter((c) => c.NO == no)[0]?.규격;
  processlist.value.filter(
    (c) => c.NO === produceitemModalIndex.value
  )[0].단위 = task_modal_item.dataAll.value.filter((c) => c.NO == no)[0]?.단위;
  setProduceItemModal(false, 0);
};

// ############################################### 공정 가져오기 ###############################################
// 공정등록 모달 설정
const processModal = ref(false);
const processModalIndex = ref(0);
const setProcessModal = (value: boolean, no: any) => {
  processModal.value = value;
  processModalIndex.value = no;
};

// 모달에서 선택한 품목을 processlist에 넣기
const importProcess = (no: any) => {
  processlist.value.filter((c) => c.NO == processModalIndex.value)[0].공정NO =
    no;
  processlist.value.filter((c) => c.NO === processModalIndex.value)[0].공정명 =
    task_modal_process.dataAll.value.filter((c) => c.NO == no)[0]?.공정명;
  processModalIndex.value = 0;
  setProcessModal(false, 0);
};

// 페이징기능
const currentPage_process = ref(1); // 현재페이지
const rowsPerPage_process = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_process = () => {
  currentPage_process.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_task_modal_process = "/api/production/task/modal/process";
const task_modal_process = useSendApi<MasterProcess>(
  url_task_modal_process,
  currentPage_process,
  rowsPerPage_process
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_process = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "코드", style: "width: 50px; text-align: center;" },
  항목2: { name: "구분", style: "width: 50px; text-align: center;" },
  항목3: { name: "공정명", style: "width: 50px; text-align: center;" },
  항목4: { name: "내용", style: "width: 50px; text-align: center;" },
  항목5: { name: "설비", style: "width: 50px; text-align: center;" },
  항목6: { name: "항목6", style: "width: 50px; text-align: center;" },
  항목7: { name: "항목7", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_process = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_process = ref("전체");
const searchInput_process = ref("");
const sortKey_process = ref("등록일");
const sortOrder_process = ref("내림차순");
const sortOrderToggle_process = () => {
  sortOrder_process.value =
    sortOrder_process.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_process, sortOrder_process], (newValue, oldValue) => {
  search_process();
  pageChangeFirst_process();
});
const search_process = () => {
  // console.log(searchKey.value, searchInput.value);
  task_modal_process.searchDatas(
    searchDate_process.value,
    searchKey_process.value,
    searchInput_process.value,
    sortKey_process.value,
    sortOrder_process.value
  );
};

// ############################################### 설비 가져오기 ###############################################
// 설비등록 모달 설정
const facilityModal = ref(false);
const facilityModalIndex = ref(0);
const setFacilityModal = (value: boolean, no: any) => {
  facilityModal.value = value;
  facilityModalIndex.value = no;
};

// 모달에서 선택한 품목을 facilitylist에 넣기
const importFacility = (no: any) => {
  processlist.value.filter((c) => c.NO == facilityModalIndex.value)[0].설비NO =
    no;
  processlist.value.filter((c) => c.NO === facilityModalIndex.value)[0].설비명 =
    task_modal_facility.dataAll.value.filter((c) => c.NO == no)[0]?.설비명;
  facilityModalIndex.value = 0;
  setFacilityModal(false, 0);
};

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

// ############################################### 작업자 가져오기 ###############################################
// 작업자등록 모달 설정
const userModal = ref(false);
const userModalIndex = ref(0);
const setUserModal = (value: boolean, no: any) => {
  userModal.value = value;
  userModalIndex.value = no;
};

// 모달에서 선택한 품목을 userlist에 넣기
const importUser = (no: any) => {
  processlist.value.filter((c) => c.NO == userModalIndex.value)[0].작업자ID =
    no;
  processlist.value.filter((c) => c.NO === userModalIndex.value)[0].작업자 =
    task_modal_user.dataAll.value.filter((c) => c.아이디 == no)[0]?.이름;
  userModalIndex.value = 0;
  setUserModal(false, 0);
};

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
  itemlist.value.filter((c) => c.NO === itemReceiveModalIndex.value)[0].품목NO =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.품목NO;
  // LOT코드
  itemlist.value.filter(
    (c) => c.NO === itemReceiveModalIndex.value
  )[0].LOT코드 = task_modal_itemReceive.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.LOT코드;
  // 품번
  itemlist.value.filter((c) => c.NO === itemReceiveModalIndex.value)[0].품번 =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.품번;
  // 품목구분
  itemlist.value.filter(
    (c) => c.NO === itemReceiveModalIndex.value
  )[0].품목구분 = task_modal_itemReceive.dataAll.value.filter(
    (c) => c.LOT코드 == no
  )[0]?.품목구분;
  // 품명
  itemlist.value.filter((c) => c.NO === itemReceiveModalIndex.value)[0].품명 =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.품명;
  // 규격
  itemlist.value.filter((c) => c.NO === itemReceiveModalIndex.value)[0].규격 =
    task_modal_itemReceive.dataAll.value.filter(
      (c) => c.LOT코드 == no
    )[0]?.규격;
  // 단위
  itemlist.value.filter((c) => c.NO === itemReceiveModalIndex.value)[0].단위 =
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

#######################################################################################################################
#######################################################################################################################
#######################################################################################################################

<template>
  <!--BEGIN : 작업 정보 등록-->
  <div class="intro-y text-xl mt-10"><strong>작업 정보 등록</strong></div>
  <div class="grid grid-cols-8 gap-6 mt-3">
    <div class="col-span-4 intro-y">
      <div class="border-2">
        <Table.Tbody>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="width: 150px; border-right-width: 1px"
              ><strong>생산계획</strong>
            </Table.Td>
            <Table.Td style="width: 300px" class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="
                  task_modal_plan.dataAll.value.filter(
                    (c) => c.NO == taskInsertData.생산계획NO
                  )[0]?.수주코드
                "
                placeholder="여기를 클릭하여 생산계획을 등록해주세요"
                @click="setPlanModal(true)"
              >
              </FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="width: 150px; border-right-width: 1px"
              ><strong>작업지시코드</strong>
            </Table.Td>
            <Table.Td style="width: 300px" class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="taskInsertData.코드"
                v-model="taskInsertData.코드"
              >
              </FormInput>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><strong>품명</strong></Table.Td
            >
            <Table.Td class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="taskInsertData.품명"
                placeholder="여기를 클릭하여 품목을 등록해주세요"
                @click="setItemModal(true)"
              >
              </FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="width: 100px; border-right-width: 1px"
              ><strong>품번</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="taskInsertData.품번"
                readonly
              >
              </FormInput>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><strong>구분</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="taskInsertData.품목구분"
                readonly
              ></FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="width: 60px; border-right-width: 1px"
              ><strong>수량</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1">
              <FormInput
                type="number"
                formInputSize="sm"
                :value="taskInsertData.수량"
                v-model="taskInsertData.수량"
              ></FormInput>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><strong>작업 시작일</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1">
              <FormInput
                type="date"
                formInputSize="sm"
                :value="taskInsertData.시작일"
                v-model="taskInsertData.시작일"
              ></FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="width: 60px; border-right-width: 1px"
              ><strong>비고</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="taskInsertData.비고"
                v-model="taskInsertData.비고"
              ></FormInput>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><strong>작업표준서</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1 text-center" colspan="3">
              <Button as="a" variant="outline-success" style="height: 30px"
                ><Lucide icon="ClipboardList" class="w-5 h-5 mr-1" />작업표준서
                열람</Button
              >
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </div>
    </div>

    <div class="col-span-3 intro-y"></div>
  </div>
  <!--END :작업 정보 등록-->

  <!--BEGIN : 공정 등록-->

  <div class="flex itemlist-center intro-y text-xl mt-10">
    <div><strong>공정 등록</strong></div>
    <div class="ml-3">
      <Button size="sm" as="a" variant="outline-success" @click="processAddRows"
        ><Lucide icon="ListPlus" class="w-4 h-4" />공정 추가</Button
      >
    </div>
  </div>
  <div v-for="(process, index_process) in processlist" :key="process.NO">
    <div class="grid grid-cols-8 gap-6 mt-3">
      <div class="col-span-7 intro-y">
        <div class="flex itemlist-center mt-3 mb-2">
          <Lucide icon="Cpu" class="w-6 h-6 mr-1" />
          <label class="text-lg" v-if="process.NO == 1"
            ><strong>마지막 공정</strong></label
          >
          <label class="text-lg" v-if="process.NO != 1"
            ><strong>공정 {{ index_process + 1 }}</strong></label
          >

          <Button
            class="ml-3"
            size="sm"
            as="a"
            variant="outline-danger"
            v-if="process.NO != 1"
            @click="processRemoveRows(index_process)"
            ><Lucide icon="ListMinus" class="w-4 h-4" />공정 삭제</Button
          >
        </div>

        <div class="border-2">
          <Table.Tbody>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 200px"
              ><strong>작업구분</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 200px"
              ><strong>공정명</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 200px"
              ><strong>설비</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 150px"
              ><strong>작업자</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 200px"
              ><strong>생산대상 품번</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 200px"
              ><strong>생산대상 구분</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 200px"
              ><strong>생산대상 품명</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 200px"
              ><strong>생산대상 단위</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 100px"
              ><strong>수량</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 350px"
              ><strong>비고</strong>
            </Table.Th>
          </Table.Tbody>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormSelect
                  type="text"
                  formInputSize="sm"
                  :value="process.작업구분"
                  v-model="process.작업구분"
                  ><option>내부생산</option>
                  <option>외주</option>
                </FormSelect>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="text"
                  formInputSize="sm"
                  class="text-center"
                  :value="process.공정명"
                  placeholder="공정 선택"
                  @click="setProcessModal(true, process.NO)"
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="text"
                  class="text-center"
                  formInputSize="sm"
                  :value="process.설비명"
                  placeholder="설비 선택"
                  @click="setFacilityModal(true, process.NO)"
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  placeholder="작업자 선택"
                  :value="process.작업자"
                  @click="setUserModal(true, process.NO)"
                >
                </FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  v-if="process.NO == 1"
                  :value="taskInsertData.품번"
                  v-model="taskInsertData.품번"
                  readonly
                ></FormInput>
                <FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  v-if="process.NO != 1"
                  :value="process.품번"
                  placeholder="품목 선택"
                  @click="setProduceItemModal(true, process.NO)"
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  v-if="process.NO == 1"
                  :value="taskInsertData.품목구분"
                  v-model="taskInsertData.품목구분"
                  readonly
                ></FormInput>
                <FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  v-if="process.NO != 1"
                  :value="process.구분"
                  v-model="process.구분"
                  readonly
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  v-if="process.NO == 1"
                  :value="taskInsertData.품명"
                  v-model="taskInsertData.품명"
                  readonly
                ></FormInput>
                <FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  v-if="process.NO != 1"
                  :value="process.품명"
                  v-model="process.품명"
                  readonly
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  v-if="process.NO == 1"
                  :value="taskInsertData.단위"
                  v-model="taskInsertData.단위"
                  readonly
                ></FormInput>
                <FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  v-if="process.NO != 1"
                  :value="process.단위"
                  v-model="process.단위"
                  readonly
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  class="text-center"
                  type="text"
                  formInputSize="sm"
                  v-if="process.NO == 1"
                  :value="taskInsertData.수량"
                  v-model="taskInsertData.수량"
                  readonly
                ></FormInput>
                <FormInput
                  class="text-center"
                  type="number"
                  formInputSize="sm"
                  v-if="process.NO != 1"
                  :value="process.수량"
                  v-model="process.수량"
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="text"
                  formInputSize="sm"
                  :value="process.비고"
                  v-model="process.비고"
                ></FormInput>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-8 gap-6 mt-3">
      <div class="col-span-6 intro-y">
        <div class="text-md"><strong>투입자재 등록</strong></div>
        <div class="border-2">
          <Table.Tbody>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 50px"
              ><Lucide
                icon="PlusCircle"
                class="w-5 h-5"
                @click="itemAddRows(process.NO ?? 0)"
              />
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 300px"
              ><strong>투입자재코드</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 150px"
              ><strong>품목구분</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 250px"
              ><strong>품목명</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 250px"
              ><strong>규격</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 100px"
              ><strong>수량</strong>
            </Table.Th>
            <Table.Th
              class="bg-gray-300"
              style="border-right-width: 1px; width: 100px"
              ><strong>단위</strong>
            </Table.Th>
            <Table.Th class="bg-gray-300" style="width: 400px"
              ><strong>비고</strong>
            </Table.Th>
          </Table.Tbody>
          <Table.Tbody>
            <Table.Tr
              v-for="(item, index_item) in itemlist.filter(
                (item) => item.작업지시공정NONO == process.NO
              )"
              :key="item.NO"
            >
              <Table.Td class="px-1 py-1" style="border-right-width: 1px">
                <Lucide
                  icon="MinusCircle"
                  class="ml-4 w-5 h-5"
                  @click="itemRemoveRows(item.NO ?? 0)"
                />
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="text"
                  formInputSize="sm"
                  placeholder="여기를 클릭하여 품목을 등록해주세요"
                  :value="item.LOT코드"
                  @click="setItemReceiveModal(true, item.NO)"
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="text"
                  formInputSize="sm"
                  :value="item.품목구분"
                  readonly
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="text"
                  formInputSize="sm"
                  :value="item.품명"
                  readonly
                >
                </FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="text"
                  formInputSize="sm"
                  :value="item.규격"
                  readonly
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="number"
                  formInputSize="sm"
                  :value="item.수량"
                  v-model="item.수량"
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="text"
                  formInputSize="sm"
                  :value="item.단위"
                  readonly
                ></FormInput>
              </Table.Td>
              <Table.Td
                class="px-1 py-1 text-center"
                style="border-right-width: 1px"
                ><FormInput
                  type="text"
                  formInputSize="sm"
                  :value="item.비고"
                  v-model="item.비고"
                ></FormInput
              ></Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </div>
      </div>
    </div>
    <hr
      class="mt-5 mb-5 text-slate-200 w-11/12 intro-y"
      style="border: dashed 2px"
    />
  </div>

  <!--END : 공정 등록-->

  <div class="text-center mt-5 intro-y">
    <Button
      class="mr-3 shadow-md"
      as="a"
      variant="primary"
      @click="setInsertCheckModal(true)"
    >
      <Lucide icon="FilePlus" class="w-4 h-4 mr-2" />
      등록
    </Button>
    <Button
      class="shadow-md"
      as="a"
      variant="outline-danger"
      @click="$router.push('task-add')"
    >
      <Lucide icon="FilePlus" class="w-4 h-4 mr-2" />
      취소
    </Button>
  </div>

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: Plan Modal Content -->
  <Dialog size="xxl" :open="planModal" @close="setPlanModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--Plan Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        생산계획 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect v-model="searchKey_plan" class="w-30 mt-3 !box sm:mt-0">
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
                v-model="searchInput_plan"
                @keyup.enter="
                  () => {
                    search_plan();
                    pageChangeFirst_plan();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_plan();
                    pageChangeFirst_plan();
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
            <FormSelect v-model="sortKey_plan" class="w-30 mt-3 !box sm:mt-0">
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
              v-if="sortOrder_plan == '오름차순'"
              @click="sortOrderToggle_plan"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_plan }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_plan == '내림차순'"
              @click="sortOrderToggle_plan"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_plan }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_plan"
              @change="pageChangeFirst_plan"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_plan.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_plan"
              :numberOfPages="task_modal_plan.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_plan.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_item }} /
              {{ task_modal_plan.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_plan.순번.style"
                  >
                    {{ table_setting_plan.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_plan.항목1.style"
                  >
                    {{ table_setting_plan.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_plan.항목2.style"
                  >
                    {{ table_setting_plan.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_plan.항목3.style"
                  >
                    {{ table_setting_plan.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_plan.항목4.style"
                  >
                    {{ table_setting_plan.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_plan.항목5.style"
                  >
                    {{ table_setting_plan.항목5.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_plan.항목6.style"
                  >
                    {{ table_setting_plan.항목6.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_plan.항목7.style"
                  >
                    {{ table_setting_plan.항목7.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_plan.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_plan.순번.style"
                    @click="importPlan(todo.NO)"
                  >
                    <div>
                      {{
                        index + 1 + (currentPage_plan - 1) * rowsPerPage_plan
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_plan.항목1.style"
                    @click="importPlan(todo.NO)"
                  >
                    <div>{{ todo[table_setting_plan.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_plan.항목2.style"
                    @click="importPlan(todo.NO)"
                  >
                    <div>{{ todo[table_setting_plan.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_plan.항목3.style"
                    @click="importPlan(todo.NO)"
                  >
                    <div>{{ todo[table_setting_plan.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_plan.항목4.style"
                    @click="importPlan(todo.NO)"
                  >
                    <div>{{ todo[table_setting_plan.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_plan.항목5.style"
                    @click="importPlan(todo.NO)"
                  >
                    <div>{{ todo[table_setting_plan.항목5.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_plan.항목6.style"
                    @click="importPlan(todo.NO)"
                  >
                    <div>{{ todo[table_setting_plan.항목6.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_plan.항목7.style"
                    @click="importPlan(todo.NO)"
                  >
                    <div>{{ todo[table_setting_plan.항목7.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_plan.dataCount.value == 0"
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
            @click="setPlanModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Plan Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->
  <!-- BEGIN: Item Modal Content -->
  <Dialog size="xxl" :open="itemModal" @close="setItemModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--Item Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        품목 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect v-model="searchKey_item" class="w-30 mt-3 !box sm:mt-0">
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
                v-model="searchInput_item"
                @keyup.enter="
                  () => {
                    search_item();
                    pageChangeFirst_item();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_item();
                    pageChangeFirst_item();
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
            <FormSelect v-model="sortKey_item" class="w-30 mt-3 !box sm:mt-0">
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
              v-if="sortOrder_item == '오름차순'"
              @click="sortOrderToggle_item"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_item }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_item == '내림차순'"
              @click="sortOrderToggle_item"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_item }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_item"
              @change="pageChangeFirst_item"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_item.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_item"
              :numberOfPages="task_modal_item.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_item.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_item }} /
              {{ task_modal_item.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_item.순번.style"
                  >
                    {{ table_setting_item.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목1.style"
                  >
                    {{ table_setting_item.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목2.style"
                  >
                    {{ table_setting_item.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목3.style"
                  >
                    {{ table_setting_item.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목4.style"
                  >
                    {{ table_setting_item.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목5.style"
                  >
                    {{ table_setting_item.항목5.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_item.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.순번.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>
                      {{
                        index + 1 + (currentPage_item - 1) * rowsPerPage_item
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목1.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목2.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목3.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목4.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목5.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목5.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_item.dataCount.value == 0"
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
            @click="setItemModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Item Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->
  <!-- BEGIN: Produce Item Modal Content -->
  <Dialog
    size="xxl"
    :open="produceitemModal"
    @close="setProduceItemModal(false, 0)"
  >
    <Dialog.Panel class="p-10 text-center">
      <!--Item Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        품목 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect v-model="searchKey_item" class="w-30 mt-3 !box sm:mt-0">
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
                v-model="searchInput_item"
                @keyup.enter="
                  () => {
                    search_item();
                    pageChangeFirst_item();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_item();
                    pageChangeFirst_item();
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
            <FormSelect v-model="sortKey_item" class="w-30 mt-3 !box sm:mt-0">
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
              v-if="sortOrder_item == '오름차순'"
              @click="sortOrderToggle_item"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_item }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_item == '내림차순'"
              @click="sortOrderToggle_item"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_item }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_item"
              @change="pageChangeFirst_item"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_item.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_item"
              :numberOfPages="task_modal_item.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_item.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_item }} /
              {{ task_modal_item.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_item.순번.style"
                  >
                    {{ table_setting_item.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목1.style"
                  >
                    {{ table_setting_item.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목2.style"
                  >
                    {{ table_setting_item.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목3.style"
                  >
                    {{ table_setting_item.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목4.style"
                  >
                    {{ table_setting_item.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_item.항목5.style"
                  >
                    {{ table_setting_item.항목5.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_item.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.순번.style"
                    @click="importProduceItem(todo.NO)"
                  >
                    <div>
                      {{
                        index + 1 + (currentPage_item - 1) * rowsPerPage_item
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목1.style"
                    @click="importProduceItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목2.style"
                    @click="importProduceItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목3.style"
                    @click="importProduceItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목4.style"
                    @click="importProduceItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_item.항목5.style"
                    @click="importProduceItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목5.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_item.dataCount.value == 0"
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
            @click="setProduceItemModal(false, 0)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Item Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: Process Modal Content -->
  <Dialog size="xxl" :open="processModal" @close="setProcessModal(false, 0)">
    <Dialog.Panel class="p-10 text-center">
      <!--Item Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        공정 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect
              v-model="searchKey_process"
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
                v-model="searchInput_process"
                @keyup.enter="
                  () => {
                    search_process();
                    pageChangeFirst_process();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_process();
                    pageChangeFirst_process();
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
              v-model="sortKey_process"
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
              v-if="sortOrder_process == '오름차순'"
              @click="sortOrderToggle_process"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_process }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_process == '내림차순'"
              @click="sortOrderToggle_process"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_process }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_process"
              @change="pageChangeFirst_process"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="task_modal_process.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_process"
              :numberOfPages="task_modal_process.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ task_modal_process.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_process }} /
              {{ task_modal_process.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_process.순번.style"
                  >
                    {{ table_setting_process.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_process.항목1.style"
                  >
                    {{ table_setting_process.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_process.항목2.style"
                  >
                    {{ table_setting_process.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_process.항목3.style"
                  >
                    {{ table_setting_process.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_process.항목4.style"
                  >
                    {{ table_setting_process.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_process.항목5.style"
                  >
                    {{ table_setting_process.항목5.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in task_modal_process.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_process.순번.style"
                    @click="importProcess(todo.NO)"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_process - 1) * rowsPerPage_process
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_process.항목1.style"
                    @click="importProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_process.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_process.항목2.style"
                    @click="importProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_process.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_process.항목3.style"
                    @click="importProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_process.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_process.항목4.style"
                    @click="importProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_process.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_process.항목5.style"
                    @click="importProcess(todo.NO)"
                  >
                    <div>{{ todo[table_setting_process.항목5.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="task_modal_process.dataCount.value == 0"
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
            @click="setProcessModal(false, 0)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Process Modal Content -->

  <!-- #######################################################################################################################
  #######################################################################################################################
  ####################################################################################################################### -->

  <!-- BEGIN: Facility Modal Content -->
  <Dialog size="xxl" :open="facilityModal" @close="setFacilityModal(false, 0)">
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
            @click="setFacilityModal(false, 0)"
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
  <Dialog size="xxl" :open="userModal" @close="setUserModal(false, 0)">
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
            @click="setUserModal(false, 0)"
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

  <!-- BEGIN: Insert Check Modal -->
  <Dialog
    :open="insertCheckModal"
    @close="
      () => {
        setInsertCheckModal(false);
      }
    "
    :initialFocus="insertButtonRef"
  >
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="HelpCircle" class="w-16 h-16 mx-auto mt-3 text-success" />
        <div class="mt-5 text-3xl">등록</div>
        <div class="mt-2 text-slate-500">정말 등록하시겠습니까?</div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          @click="
            () => {
              setInsertCheckModal(false);
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
          ref="insertButtonRef"
          @click="
            () => {
              insertData();
              setInsertCheckModal(false);
            }
          "
        >
          등록
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Insert Check Modal -->
</template>
