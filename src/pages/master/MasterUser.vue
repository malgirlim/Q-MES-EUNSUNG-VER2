<script setup lang="ts">
import { ref, Ref, getCurrentInstance } from "vue";
import Button from "../../base-components/Button";
import { FormInput, FormSelect, FormCheck } from "../../base-components/Form";
import Lucide from "../../base-components/Lucide";
import { Dialog, Menu } from "../../base-components/Headless";
import Table from "../../base-components/Table";
import moment from "moment";
import Litepicker from "../../base-components/Litepicker";
import * as XLSX from "xlsx";
import { read, utils, writeFileXLSX } from "xlsx";
import printJS from "print-js";
import Progress from "../../base-components/Progress";
import { Tab } from "../../base-components/Headless";
import { toast } from "vue3-toastify";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../composables/useSendApi";
import { MasterUser } from "../../interfaces/menu/MasterInterface";

// 페이징기능
import { onMounted, watch } from "vue";
import PaginationComponent from "../../components/Pagination/PaginationComponent.vue"; // 페이징설정

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.MasterUser; //권한레벨

const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수

const pageChange = () => {
  // 한 페이지에 보여질 데이터 갯수 변경 시 1페이지로 이동
  currentPage.value = 1;
};

// 권한메뉴 전환
const auth_page = ref(0);

const auth_page_change = (page: any) => {
  auth_page.value = page;
  return auth_page;
};

// api 보내기
const url = "/api/master/user";
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
} = useSendApi<MasterUser>(url, currentPage, rowsPerPage);

onMounted(async () => loadDatas()); // 페이지 로딩 시 데이터 불러오기

// 조회
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
  pageChange();
});
const search = () => {
  // console.log(searchKey.value, searchInput.value);
  searchDatas(
    "",
    searchKey.value,
    searchInput.value,
    sortKey.value,
    sortOrder.value
  );
};

//등록 Modal
const insertModal = ref(false);
const setInsertModal = (value: boolean) => {
  if (user_level >= 3) {
    insertModal.value = value;
    set_id.value = null;
    set_pw1.value = null;
    set_pw2.value = null;
    set_name.value = null;
    insertModalData = {}; // 변수 초기화
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let insertModalData: MasterUser; // 등록할 변수

//등록창 에러검출 및 변수전달

//패스워드 정규식(문자,숫자,특문 포함한 8자이상)
const pw_reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const set_id = ref();
const set_pw1 = ref();
const set_pw2 = ref();
const set_name = ref();

let pass_flag = false;

const insert_check = () => {
  pass_flag = true;

  if (set_id.value != null && set_id.value != "") {
    insertModalData.아이디 = set_id.value;
  } else {
    set_id.value = "";
    pass_flag = false;
  }

  if (set_pw1.value != null && set_pw1.value != "") {
  } else {
    set_pw1.value = "";
    pass_flag = false;
  }

  if (set_pw2.value != null && set_pw2.value != "") {
  } else {
    set_pw2.value = "";
    pass_flag = false;
  }

  if (pw_reg.test(set_pw1.value) && pw_reg.test(set_pw2.value)) {
    insertModalData.비밀번호 = set_pw1.value;
  } else {
    pass_flag = false;
  }

  if (set_pw1.value == set_pw2.value) {
    insertModalData.비밀번호 = set_pw1.value;
  } else {
    pass_flag = false;
  }

  if (set_name.value != null && set_name.value != "") {
    insertModalData.이름 = set_name.value;
  } else {
    set_name.value = "";
    pass_flag = false;
  }

  if (pass_flag == false) {
    return;
  }
};

//수정 Modal
const editModal = ref(false);
const setEditModal = (value: boolean) => {
  if (user_level >= 3) {
    editModal.value = value;
    search();
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
let editModalData: MasterUser; // 수정할 변수

//삭제 Modal
const deleteConfirmationModal = ref(false);
const setDeleteConfirmationModal = (value: boolean) => {
  if (user_level >= 4) {
    deleteConfirmationModal.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const deleteButtonRef = ref(null);
const deleteDataFunction = async () => {
  await deleteData(checkDebug.value); // await : 이 함수가 끝나야 다음으로 넘어간다
  resetCheckBox();
  search();
};

//권한Modal
const authModal = ref(false);
const setAuthModal = (value: boolean) => {
  if (user_level >= 3) {
    authModal.value = value;
  } else {
    toast.warning("액세스 권한이 없습니다.\n관리자에게 문의하세요.");
  }
};
const authButtonRef = ref(null);

// print.js 프린트 기능

const printPage = (data: any) => {
  printJS({
    printable: data,
    properties: [
      "아이디",
      "이름",
      "연락처",
      "이메일",
      "부서명",
      "직책",
      "직급",
    ],
    type: "json",
    documentTitle: "기준정보 > 사용자 관리",
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
    "기준정보_사용자관리_" + moment().format("YYMMDD_HHmmss") + "_export.xlsx"
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
  "../../src/assets/xlsx/업로드양식_기준정보_사용자관리.xlsx"; // 엑셀 양식주소
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
      await insertAllData(file_data.value);
      search();
      pageChange();
    };
    reader.readAsArrayBuffer(file);
  }
};
// ########################## 엑셀 다운로드 및 업로드 끝 ##########################

// 날짜 구하기
const now = moment().format("YYYY-MM-DD");
const nowPlus = moment().add(7, "days").format("YYYY-MM-DD");
const max_year = moment().format("YYYY");
const min_year = moment().add(-3, "years").format("YYYY");
const now2 = "전체기간";

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
  // 페이징 넘기면 체크박스 데이터 초기화\
  const mBox = document.querySelector<HTMLElement>(
    "input[id=checkbox_all]"
  ) as HTMLInputElement | null; // 오류 안뜨게 하려고 넣어둔것
  if (!mBox) return; // 오류 안뜨게 하려고 넣어둔것
  mBox.checked = false; // 메인체크박스 체크해제
  mainCheckBox.value = true; // 메인체크박스 데이터 초기화
  checkDebug.value = [];
};

const category_list = [
  "기준정보",
  "주문관리",
  "생산관리",
  "공정관리",
  "재고관리",
  "품질관리",
  "모니터링",
  "예방보전",
  "관리자메뉴",
];
const menu_list = [
  [
    "사용자 관리",
    "거래처 관리",
    "품목 관리",
    "BOM 관리",
    "설비 관리",
    "공정 관리",
    "불량코드 관리",
    "비가동코드 관리",
    "설비부품 관리",
    "품질기준정보",
    "설비기준정보",
    "재고기준정보",
    "레시피관리",
  ],
  [
    "수주",
    "수주현황",
    "수주대비납품 예보",
    "수주대비납품 통보",
    "납품",
    "발주",
    "발주현황",
    "설비부품발주",
    "설비부품발주현황",
  ],
  ["생산계획", "작업지시", "생산실적집계", "불량재작업"],
  [
    "LOT출력(바코드)",
    "LOT추적",
    "검사기 설비상태정보",
    "제판기 설비상태정보",
    "인쇄기1 설비상태정보",
    "인쇄기2 설비상태정보",
    "인쇄기3 설비상태정보",
    "인쇄기4 설비상태정보",
    "인쇄기5 설비상태정보",
    "인쇄기6 설비상태정보",
    "인쇄기7 설비상태정보",
    "인쇄기8 설비상태정보",
  ],
  [
    "원재료입고",
    "원재료재공",
    "원재료출고",
    "반제품입고",
    "반제품재공",
    "반제품출고",
    "완제품입고",
    "설비부품 입고등록",
    "설비부품 사용등록",
    "설비부품 재고현황",
  ],
  [
    "품질기준서",
    "검사성적서",
    "수입검사",
    "공정검사",
    "출하검사",
    "부적합 관리",
  ],
  [
    "KPI지수 현황",
    "종합 현황",
    "생산 현황",
    "공정 현황",
    "재고 현황",
    "설비 일상점검 현황",
    "설비 예방보전 현황",
    "MTBF 현황",
    "MTTR 현황",
    "OEE현황",
  ],
  [
    "예방보전계획",
    "일상점검계획",
    "설비수리계획",
    "설비부품수명계획",
    "예방보전 예보",
    "예방보전 통보",
    "설비고장발생 통보",
    "일상점검 확인통보",
    "설비수리 예보",
    "설비수리 통보",
    "설비부품 교체시기 통보",
  ],
  ["Log 조회"],
];
</script>

<template>
  <div v-if="user_level >= 2">
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
        <div class="hidden mx-auto md:block text-slate-500"></div>
        <div class="mr-5">
          <a href="" class="flex items-center ml-auto text-primary">
            <Lucide icon="RefreshCcw" class="w-4 h-4 mr-3" /> 새로고침
          </a>
        </div>
        <div>
          <FormSelect v-model="searchKey" class="w-30 mt-3 !box sm:mt-0">
            <option>전체</option>
            <option>아이디</option>
            <option>이름</option>
            <option>연락처</option>
            <option>이메일</option>
            <option>부서명</option>
            <option>직책</option>
            <option>직급</option>
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
            <option>아이디</option>
            <option>이름</option>
            <option>연락처</option>
            <option>이메일</option>
            <option>부서명</option>
            <option>직책</option>
            <option>직급</option>
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
        <div class="ml-5">
          <FormSelect
            class="w-20 mt-3 !box sm:mt-0"
            v-model="rowsPerPage"
            @change="pageChange"
          >
            <option>10</option>
            <option>25</option>
            <option>50</option>
            <option>100</option>
            <option :value="dataCount">전체</option>
          </FormSelect>
        </div>
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
          <span class="mr-4"
            >[ {{ currentPage }} / {{ numberOfPages }} 페이지 ]</span
          >
        </div>
      </div>

      <!-- END: Pagination-->
      <!-- BEGIN: Users Layout -->

      <div
        v-for="todo in datas"
        :key="todo.아이디"
        class="col-span-12 intro-y md:col-span-3 m-1"
      >
        <div class="box">
          <div
            class="flex flex-col items-center p-5 border-b lg:flex-row border-slate-200/60 dark:border-darkmode-400"
          >
            <div
              class="mt-3 text-center lg:ml-2 lg:mr-auto lg:text-left lg:mt-0"
            >
              <span class="font-medium">
                {{ todo.이름 }} ({{ todo.아이디 }})</span
              >
              <div class="text-slate-500 text-xs mt-0.5">
                {{ todo.부서명 }}
              </div>
              <div class="text-slate-500 text-xs mt-0.5">
                <span class="mr-3"><b>Mobile.</b> {{ todo.연락처 }}</span>
                <span><b>E-mail.</b> {{ todo.이메일 }}</span>
              </div>
            </div>
            <div
              class="flex mt-3 -ml-2 lg:ml-0 lg:justify-end lg:mt-0"
              style="text-align: right"
            >
              <div><!--네임카드 우측 공간 기입란--></div>
            </div>
          </div>
          <div
            class="flex flex-wrap items-center justify-center p-3 lg:flex-nowrap"
          >
            <div class="w-full mb-4 mr-auto lg:w-1/2 lg:mb-0">
              <div class="flex text-xs text-slate-500">
                <div class="mr-auto">시스템 사용률</div>
                <div>20%</div>
              </div>
              <Progress class="h-1 mt-2">
                <Progress.Bar
                  class="w-1/4 bg-primary"
                  role="progressbar"
                  :aria-valuenow="0"
                  :aria-valuemin="0"
                  :aria-valuemax="100"
                ></Progress.Bar>
              </Progress>
            </div>
            <Button
              variant="outline-secondary"
              class="px-2 py-1 mr-2"
              @click="
                (event) => {
                  event.preventDefault();
                  setEditModal(true);
                  editModalData = todo;
                }
              "
            >
              수정
            </Button>
            <!-- <Button
              variant="outline-success"
              class="px-2 py-1 mr-2"
              @click="
                (event) => {
                  event.preventDefault();
                  setAuthModal(true);
                }
              "
            >
              권한
            </Button> -->
            <Button
              variant="outline-danger"
              class="px-2 py-1 mr-2"
              @click="
                () => {
                  checkDebug = [todo.아이디];
                  setDeleteConfirmationModal(true);
                }
              "
            >
              삭제
            </Button>
          </div>
        </div>
      </div>

      <!-- END: Users Layout -->
      <!-- END: Data List -->
    </div>
    <div class="text-center mt-20 intro-y" v-if="dataCount == 0">
      저장된 데이터가 없습니다.
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

  <!-- BEGIN: Insert Modal Content -->
  <Dialog size="md" :open="insertModal">
    <Dialog.Panel class="p-10 text-center">
      <!--추가 Modal 내용 시작-->
      <div class="mb-5" style="font-weight: bold">사용자 등록</div>
      <div style="text-align: left">
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-1">아이디</FormLabel
          ><label class="text-danger"><sup>*</sup></label>
          <FormInput
            id="vertical-form-1"
            type="text"
            v-model="set_id"
            placeholder=""
          />
          <div v-if="set_id == ''" class="text-danger text-xs mt-1">
            아이디가 입력되지 않았습니다.
          </div>
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-2">비밀번호</FormLabel>
          <label class="text-danger"><sup>*</sup></label>
          <FormInput
            id="vertical-form-2"
            type="password"
            v-model="set_pw1"
            placeholder=""
          />
          <div
            v-if="!pw_reg.test(set_pw1) && set_pw1 != null"
            class="text-danger text-xs mt-1"
          >
            영문자, 숫자, 특수문자를 포함한 8자이상으로 구성되어야 합니다.
          </div>
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-3">비밀번호 확인</FormLabel>
          <label class="text-danger"><sup>*</sup></label>
          <FormInput
            id="vertical-form-2"
            type="password"
            v-model="set_pw2"
            placeholder=""
          />
          <div
            v-if="set_pw1 == '' && set_pw2 == ''"
            class="text-danger text-xs mt-1"
          >
            패스워드가 입력되지 않았습니다.
          </div>
          <div
            v-if="set_pw1 != set_pw2 && set_pw1 != '' && set_pw2 != ''"
            class="text-danger text-xs mt-1"
          >
            패스워드가 일치하지 않습니다.
          </div>
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">이름</FormLabel>
          <label class="text-danger"><sup>*</sup></label>
          <FormInput
            id="vertical-form-3"
            type="text"
            v-model="set_name"
            placeholder=""
          />
          <div v-if="set_name == ''" class="text-danger text-xs mt-1">
            이름이 입력되지 않았습니다.
          </div>
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-5">연락처</FormLabel>
          <FormInput
            id="vertical-form-4"
            type="text"
            v-model="insertModalData.연락처"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-6">이메일</FormLabel>
          <FormInput
            id="vertical-form-5"
            type="text"
            v-model="insertModalData.이메일"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-7">부서명</FormLabel>
          <FormInput
            id="vertical-form-6"
            type="text"
            v-model="insertModalData.부서명"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-8">직책</FormLabel>
          <FormInput
            id="vertical-form-7"
            type="text"
            v-model="insertModalData.직책"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-9">직급</FormLabel>
          <FormInput
            id="vertical-form-8"
            type="text"
            v-model="insertModalData.직급"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-9">권한</FormLabel>
          <FormSelect
            id="vertical-form-8"
            type="text"
            v-model="insertModalData.권한"
            ><option>구매일반</option>
            <option>구매관리자</option>
            <option>영업일반</option>
            <option>영업관리자</option>
            <option>생산일반</option>
            <option>생산관리자</option>
            <option>품질일반</option>
            <option>품질관리자</option></FormSelect
          >
        </div>
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="
              () => {
                insert_check();
                if (pass_flag == false) {
                  toast.warning(
                    '등록 내용에 오류가 있습니다. \n 오류 내용을 확인하세요.'
                  );
                  return;
                } else {
                  insertData(insertModalData);
                  pass_flag = false;
                  setInsertModal(false);
                  search();
                  pageChange();
                }
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
  <Dialog size="md" :open="editModal">
    <Dialog.Panel class="p-8 text-center">
      <div class="mb-5" style="font-weight: bold">수정</div>

      <div class="text-left">
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-1">아이디</FormLabel>
          <FormInput
            id="vertical-form-1"
            type="text"
            v-model="editModalData.아이디"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-2">비밀번호</FormLabel>
          <FormInput
            id="vertical-form-2"
            type="password"
            v-model="editModalData.비밀번호"
            placeholder=""
          />
        </div>
        <div>
          <FormLabel htmlFor="vertical-form-3">이름</FormLabel>
          <FormInput
            id="vertical-form-3"
            type="text"
            v-model="editModalData.이름"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-4">연락처</FormLabel>
          <FormInput
            id="vertical-form-4"
            type="text"
            v-model="editModalData.연락처"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-5">이메일</FormLabel>
          <FormInput
            id="vertical-form-5"
            type="text"
            v-model="editModalData.이메일"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-6">부서명</FormLabel>
          <FormInput
            id="vertical-form-6"
            type="text"
            v-model="editModalData.부서명"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-7">직책</FormLabel>
          <FormInput
            id="vertical-form-7"
            type="text"
            v-model="editModalData.직책"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-8">직급</FormLabel>
          <FormInput
            id="vertical-form-8"
            type="text"
            v-model="editModalData.직급"
            placeholder=""
          />
        </div>
        <div class="mt-3">
          <FormLabel htmlFor="vertical-form-8">권한</FormLabel>
          <FormSelect
            id="vertical-form-8"
            type="text"
            v-model="editModalData.권한"
            ><option>구매일반</option>
            <option>구매관리자</option>
            <option>영업일반</option>
            <option>영업관리자</option>
            <option>생산일반</option>
            <option>생산관리자</option>
            <option>품질일반</option>
            <option>품질관리자</option></FormSelect
          >
        </div>
      </div>

      <div style="text-align: left">
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

  <!-- BEGIN: Auth Modal Content -->
  <Dialog size="lg" :open="authModal">
    <Dialog.Panel class="p-8 text-center">
      <div class="mb-5" style="font-weight: bold">권한 설정</div>

      <div class="text-left mb-5 p-2 border-2">
        <div>Level 1 : 권한 없음</div>
        <div>Level 2 : 조회 권한 부여</div>
        <div>Level 3 : 조회, 등록, 수정 권한 부여</div>
        <div>Level 4 : 조회, 등록, 수정, 삭제 권한 부여</div>
      </div>

      <Table.Tbody>
        <Table.Tr>
          <Table.Td class="p-2" style="width: 200px">
            <div class="p-0" v-for="(category, index) in category_list">
              <Button
                as="a"
                :class="[
                  'mb-3',
                  { 'bg-primary text-white': index == auth_page },
                ]"
                @click="auth_page_change(index)"
              >
                {{ category }}</Button
              >
            </div>
          </Table.Td>
          <Table.Td class="p-2" style="width: 75%; vertical-align: top">
            <div v-for="(menu, index) in menu_list">
              <div class="" v-if="index == auth_page">
                <div class="text-right mr-3 mb-5 flex">
                  <div class="flex" style="margin-left: auto">
                    <div>Level 1</div>
                    <div class="ml-3">Level 2</div>
                    <div class="ml-3">Level 3</div>
                    <div class="ml-3">Level 4</div>
                  </div>
                </div>
                <div class="text-right" v-for="e in menu" :key="e">
                  <div class="flex mt-2 mb-2">
                    <div style="">{{ e }}</div>
                    <div
                      class="flex flex-col sm:flex-row"
                      style="margin-left: auto"
                    >
                      <FormCheck>
                        <FormCheck.Input
                          id="radio-switch-1"
                          type="radio"
                          :name="e"
                          value=""
                        />
                      </FormCheck>
                      <FormCheck class="ml-10 sm:mt-0">
                        <FormCheck.Input
                          id="radio-switch-2"
                          type="radio"
                          :name="e"
                          value=""
                        />
                      </FormCheck>
                      <FormCheck class="ml-10 sm:mt-0">
                        <FormCheck.Input
                          id="radio-switch-3"
                          type="radio"
                          :name="e"
                          value=""
                        />
                      </FormCheck>
                      <FormCheck class="ml-10 mr-6 sm:mt-0">
                        <FormCheck.Input
                          id="radio-switch-4"
                          type="radio"
                          :name="e"
                          value=""
                        />
                      </FormCheck>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>

      <div style="text-align: left">
        <div class="mt-5 text-right">
          <Button
            class="mr-2 shadow-md"
            variant="primary"
            @click="
              () => {
                setAuthModal(false);
              }
            "
            >확인</Button
          >
          <Button
            class="mr-2 shadow-md"
            variant="outline-primary"
            @click="
              () => {
                setAuthModal(false);
              }
            "
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Auth Modal Content -->
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
