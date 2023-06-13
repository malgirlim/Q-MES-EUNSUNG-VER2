<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { Dialog } from "../../../base-components/Headless";
import { FormInput, FormSelect } from "../../../base-components/Form";
import Table from "../../../base-components/Table";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import PaginationComponent from "../../../components/Pagination/PaginationComponent.vue"; // 페이징설정
import MobileAlertSelect from "../../../components/Common/Setting/MobileAlertSelect.vue";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import {
  AlertSetting,
  AlertUser,
} from "../../../interfaces/menu/infoInterface";
import {
  MasterFacility,
  MasterUser,
} from "../../../interfaces/menu/MasterInterface";

// 페이지 로딩 시 시작
onMounted(async () => {
  await alert_modal_facility.loadDatas(); // 설비 데이터 불러오기
  await alert_modal_user.loadDatas(); // 사용자 데이터 불러오기

  await alertSetting.loadDatas(); // 데이터 불러오기
  await alertSetting.searchDatas("전체기간", "구분", "OrderForecast", "", ""); // 설정 데이터 불러오기
  alertSettingData.value = alertSetting.dataSearchAll.value[0]; // 짧게 사용하게 위해 변수에 옮김

  alertSettingNO.value = alertSetting.dataSearchAll.value[0]?.NO; // 발송대상 데이터를 부르기 위해 사용됨
  alertUser.searchDatas("전체기간", "알림설정NO", alertSettingNO.value, "", ""); // 발송대상 데이터 불러오기
});

// 짧은 변수를 쓰기 위해서...
const alertSettingData: AlertSetting = ref();
const alertSettingNO: any = ref();

// alertSetting 설정 데이터
const url_alertSetting = "/api/info/alert/setting";
const alertSetting = useSendApi<AlertSetting>(
  url_alertSetting,
  ref(1),
  ref(10)
);
// alertUser 발송대상 데이터
const url_alertUser = "/api/info/alert/user";
const alertUser = useSendApi<AlertUser>(url_alertUser, ref(1), ref(10));

// 조회
const SearchData = async () => {
  await alertSetting.searchDatas("전체기간", "구분", "OrderForecast", "", ""); // 설정 데이터 불러오기
  alertSettingData.value = alertSetting.dataSearchAll.value[0]; // 짧게 사용하게 위해 변수에 옮김
  alertSettingNO.value = alertSetting.dataSearchAll.value[0]?.NO; // 발송대상 데이터를 부르기 위해 사용됨
  alertUser.searchDatas("전체기간", "알림설정NO", alertSettingNO.value, "", ""); // 발송대상 데이터 불러오기
};

// ####################################################################################

// 발송조건 데이터
let alertRuleModalData: AlertSetting;
// 발송조건 등록 Modal
const insertRuleModal = ref(false);
const setInsertRuleModal = (value: boolean) => {
  SearchData();
  insertRuleModal.value = value;
  alertRuleModalData = { 구분: "OrderForecast", 설비NO: 0 }; // 초기화
};
// 발송조건 수정 Modal
const editRuleModal = ref(false);
const setEditRuleModal = (value: boolean) => {
  SearchData();
  editRuleModal.value = value;
};

// 알림발송대상 데이터
let alertUserModalData: AlertUser;
// 알림발송대상 추가 Modal
const addUserModal = ref(false);
const setAddUserModal = (value: boolean) => {
  SearchData();
  addUserModal.value = value;
  alertUserModalData = { 알림설정NO: alertSettingNO.value };
};
// 알림발송대상 삭제 Modal
const deleteUserModal = ref(false);
const setDeleteUserModal = (value: boolean) => {
  SearchData();
  deleteUserModal.value = value;
};

// ####################################################################################
// 설비 모달  데이터
const url_alert_modal_facility = "/api/info/alert/modal/facility";
const alert_modal_facility = useSendApi<MasterFacility>(
  url_alert_modal_facility,
  ref(1),
  ref(10)
);

// ############################################### 사용자 데이터 가져오기 ###############################################
// 페이징기능
const currentPage_user = ref(1); // 현재페이지
const rowsPerPage_user = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_user = () => {
  currentPage_user.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_alert_modal_user = "/api/info/alert/modal/user";
const alert_modal_user = useSendApi<MasterUser>(
  url_alert_modal_user,
  currentPage_user,
  rowsPerPage_user
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_modal_user = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "아이디", style: "width: 50px; text-align: center;" },
  항목2: { name: "이름", style: "width: 50px; text-align: center;" },
  항목3: { name: "연락처", style: "width: 50px; text-align: center;" },
  항목4: { name: "부서명", style: "width: 50px; text-align: center;" },
  항목5: { name: "직책", style: "width: 50px; text-align: center;" },
  항목6: { name: "직급", style: "width: 50px; text-align: center;" },
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
  alert_modal_user.searchDatas(
    searchDate_user.value,
    searchKey_user.value,
    searchInput_user.value,
    sortKey_user.value,
    sortOrder_user.value
  );
};

// ########################## 모달 설정 ##########################
const userModal = ref(false);
const setUserModal = (value: boolean) => {
  userModal.value = value;
};

// 모달에서 선택한 품목을 itemProcesslist에 넣기
const importUser = (no: any) => {
  alertUserModalData.사용자ID = no;
  alertUserModalData.이름 = alert_modal_user.dataAll.value.filter(
    (c) => c.아이디 == no
  )[0].이름;
  alertUserModalData.연락처 = alert_modal_user.dataAll.value.filter(
    (c) => c.아이디 == no
  )[0].연락처;
  alertUserModalData.부서명 = alert_modal_user.dataAll.value.filter(
    (c) => c.아이디 == no
  )[0].부서명;
  alertUserModalData.직책 = alert_modal_user.dataAll.value.filter(
    (c) => c.아이디 == no
  )[0].직책;
  alertUserModalData.직급 = alert_modal_user.dataAll.value.filter(
    (c) => c.아이디 == no
  )[0].직급;

  setUserModal(false);
};
</script>

############################################################################################################################
############################################################################################################################
############################################################################################################################

<template>
  <div class="mt-5 mb-3 text-xl font-bold">
    <div class="flex items-center">
      <Lucide class="mb-0.5 mr-1" icon="BellPlus" /> 모바일 알림설정
    </div>
  </div>
  <!--BEGIN: 설정 항목들 -->
  <div class="mt-5 grid grid-cols-12 gap-1">
    <div class="col-span-2 border-r-2 border-slate-200" style="height: 640px">
      <div><MobileAlertSelect 수주대비납품예보_variant="primary" /></div>
    </div>
    <div class="intro-y col-span-3 border-r-2 border-slate-200">
      <div class="flex items-center text-xl font-bold ml-5">
        <div><Lucide class="mb-0.5 mr-1" icon="Settings2" /></div>
        <div>발송조건</div>
        <div class="ml-5">
          <Button
            class="mb-1 w-20 h-6 text-base"
            variant="primary"
            v-if="
              alertSettingData?.NO != null || alertSettingData?.NO != undefined
            "
            @click="
              () => {
                alertRuleModalData = alertSettingData;
                setEditRuleModal(true);
              }
            "
            >수정</Button
          >
        </div>
      </div>

      <div class="p-8 text-lg">
        <div
          class="bg-white p-3 border-2 border-gray-400"
          style="overflow-y: scroll; overflow-x: hidden; height: 540px"
        >
          <div class="flex items-center mb-5">
            <div class="w-[30%] mx-2 text-center">
              <div>기능사용</div>
            </div>
            <div class="mr-3"><Lucide icon="ChevronRight" /></div>
            <div class="w-[50%]">
              <div v-if="alertSettingData?.기능사용 == 'ON'">
                <div class="flex items-center">
                  <div class="text-green-400 mr-1">●</div>
                  <div>ON</div>
                </div>
              </div>
              <div v-if="alertSettingData?.기능사용 == 'OFF'">
                <div class="flex items-center">
                  <div class="text-danger mr-1">●</div>
                  <div>OFF</div>
                </div>
              </div>
              <div
                v-if="
                  alertSettingData?.기능사용 != 'OFF' &&
                  alertSettingData?.기능사용 != 'ON'
                "
              >
                <Button variant="facebook" @click="setInsertRuleModal(true)">
                  기능사용 등록
                </Button>
              </div>
            </div>
          </div>
          <div class="flex items-center mb-5">
            <div class="w-[30%] mx-2 text-center">
              <div>발송시간</div>
            </div>
            <div class="mr-3"><Lucide icon="ChevronRight" /></div>
            <div class="w-[50%]">
              {{ alertSettingData?.발송시간 }}
            </div>
          </div>
          <div class="flex items-center">
            <div class="w-[30%] mx-2 text-center">
              <div>발송시점</div>
            </div>
            <div class="mr-3"><Lucide icon="ChevronRight" /></div>
            <div
              class="w-[50%]"
              v-if="
                alertSettingData?.발송시점 != null ||
                alertSettingData?.발송시점 != undefined
              "
            >
              {{ alertSettingData?.발송시점 }}일전
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="intro-y col-span-3 border-r-2 border-slate-200">
      <div class="flex items-center text-xl font-bold ml-5">
        <div><Lucide class="mb-0.5 mr-1" icon="Users" /></div>
        <div>알림발송대상</div>
        <div class="ml-5">
          <Button
            class="mb-1 w-20 h-6 text-base"
            variant="primary"
            v-if="
              alertSettingData?.NO != null || alertSettingData?.NO != undefined
            "
            @click="setAddUserModal(true)"
            >추가</Button
          >
        </div>
      </div>

      <div class="p-8 text-lg">
        <div
          class="bg-white p-3 border-2 border-gray-400"
          style="overflow-y: scroll; overflow-x: hidden; height: 540px"
        >
          <div v-for="user in alertUser.dataSearchAll.value" :key="user.NO">
            <div class="flex items-center mt-5">
              <div class="w-[40%] mx-2 text-center">
                <div>{{ user.부서명 }}</div>
                <div>{{ user.이름 }} {{ user.직급 }}</div>
              </div>
              <div class="mr-3"><Lucide icon="ChevronRight" /></div>
              <div class="w-[50%]">{{ user.연락처 }}</div>
              <div
                class="ml-2 cursor-pointer"
                @click="
                  () => {
                    alertUserModalData = user;
                    setDeleteUserModal(true);
                  }
                "
              >
                <Lucide class="w-5 h-5 text-danger" icon="X" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="intro-y col-span-4">
      <div class="flex items-center text-xl font-bold ml-5">
        <div><Lucide class="mb-0.5 mr-1" icon="MessageCircle" /></div>
        <div>템플릿 미리보기</div>
      </div>
      <div class="p-8 text-lg">
        <div
          class="bg-white mt-1 p-3 border-2 border-gray-400"
          style="overflow-y: scroll; overflow-x: hidden; height: 540px"
        >
          <div class="flex items-center">
            <div class="flex m-auto mt-5">
              <img
                src="../../../assets/images/kakao_template/OrderForecast.png"
              />
            </div>
          </div>
          <div class="text-center mt-5 text-md">
            카카오톡 메세지로 발송되며 전송 실패시 SMS로 발송됩니다.
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--END: 설정 항목들 -->
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="mt-3 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->

  <!-- ############################################################################################################################
############################################################################################################################
############################################################################################################################ -->

  <!-- BEGIN: 발송조건 등록 모달 -->
  <Dialog size="md" :open="insertRuleModal" @close="setInsertRuleModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5 font-bold text-lg">발송조건 등록</div>

      <div class="mb-3">
        <div class="text-left mb-1">기능사용</div>
        <div>
          <FormSelect v-model="alertRuleModalData.기능사용">
            <option>ON</option>
            <option>OFF</option>
          </FormSelect>
        </div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">발송시간</div>
        <div>
          <FormInput type="time" v-model="alertRuleModalData.발송시간" />
        </div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">발송시점</div>
        <div>
          <FormInput type="number" v-model="alertRuleModalData.발송시점" />
        </div>
      </div>

      <div>
        <div class="mt-5 text-center">
          <Button
            class="mr-5 shadow-md"
            variant="primary"
            @click="
              () => {
                alertSetting.insertData(alertRuleModalData);
                setInsertRuleModal(false);
              }
            "
            >확인</Button
          >
          <Button
            class="shadow-md"
            variant="outline-primary"
            @click="setInsertRuleModal(false)"
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 발송조건 등록 모달 -->
  <!-- BEGIN: 발송조건 수정 모달 -->
  <Dialog size="md" :open="editRuleModal" @close="setEditRuleModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5 font-bold text-lg">발송조건 수정</div>

      <div class="mb-3">
        <div class="text-left mb-1">기능사용</div>
        <div>
          <FormSelect v-model="alertRuleModalData.기능사용">
            <option>ON</option>
            <option>OFF</option>
          </FormSelect>
        </div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">발송시간</div>
        <div>
          <FormInput type="time" v-model="alertRuleModalData.발송시간" />
        </div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">발송시점</div>
        <div>
          <FormInput type="number" v-model="alertRuleModalData.발송시점" />
        </div>
      </div>

      <div>
        <div class="mt-5 text-center">
          <Button
            class="mr-5 shadow-md"
            variant="primary"
            @click="
              () => {
                alertSetting.editData(alertRuleModalData);
                setEditRuleModal(false);
              }
            "
            >확인</Button
          >
          <Button
            class="shadow-md"
            variant="outline-primary"
            @click="setEditRuleModal(false)"
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 발송조건 수정 모달 -->
  <!-- BEGIN: 알림발송대상 추가 모달 -->
  <Dialog
    size="md"
    :open="addUserModal"
    @close="setAddUserModal(false)"
    :key="alertUserModalData?.사용자ID"
  >
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5 font-bold text-lg">알림발송대상 추가</div>
      <div>
        <Button variant="outline-primary" @click="setUserModal(true)">
          기준정보에서 불러오기
        </Button>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">부서</div>
        <div>
          <FormInput type="text" v-model="alertUserModalData.부서명" readonly />
        </div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">이름</div>
        <div>
          <FormInput type="text" v-model="alertUserModalData.이름" readonly />
        </div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">직책</div>
        <div>
          <FormInput type="text" v-model="alertUserModalData.직책" readonly />
        </div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">연락처</div>
        <div>
          <FormInput type="text" v-model="alertUserModalData.연락처" readonly />
        </div>
      </div>

      <div>
        <div class="mt-5 text-center">
          <Button
            class="mr-5 shadow-md"
            variant="primary"
            @click="
              () => {
                alertUser.insertData(alertUserModalData);
                setAddUserModal(false);
              }
            "
            >확인</Button
          >
          <Button
            class="shadow-md"
            variant="outline-primary"
            @click="setAddUserModal(false)"
            >취소</Button
          >
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 알림발송대상 추가 모달 -->
  <!-- BEGIN: 알림발송대상 삭제 모달 -->
  <Dialog size="md" :open="deleteUserModal" @close="setDeleteUserModal(false)">
    <Dialog.Panel class="text-center">
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-3xl">삭제</div>
        <div class="mt-2 text-slate-500">
          선택한 발송대상을 삭제하시겠습니까?
        </div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          @click="
            () => {
              setDeleteUserModal(false);
            }
          "
          class="w-24 mr-5"
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
              alertUser.deleteData([alertUserModalData.NO]);
              setDeleteUserModal(false);
            }
          "
        >
          삭제
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 알림발송대상 삭제 모달 -->
  <!-- #######################################################################################################################
  ##################################################  생산실적 리스트  ###################################################
  ####################################################################################################################### -->

  <!-- BEGIN: User Modal Content -->
  <Dialog size="xxl" :open="userModal" @close="setUserModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!-- Modal 내용 시작-->
      <div class="mb-3" style="font-weight: bold; font-size: x-large">
        사용자 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap itemlist-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect v-model="searchKey_user" class="w-30 mt-3 !box sm:mt-0">
              <option>전체</option>
              <option>아이디</option>
              <option>이름</option>
              <option>연락처</option>
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
              <option>아이디</option>
              <option>이름</option>
              <option>연락처</option>
              <option>부서명</option>
              <option>직책</option>
              <option>직급</option>
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
              <option :value="alert_modal_user.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_user"
              :numberOfPages="alert_modal_user.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ alert_modal_user.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_user }} /
              {{ alert_modal_user.numberOfPages }} 페이지 ]</span
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
                    :style="table_setting_modal_user.순번.style"
                  >
                    {{ table_setting_modal_user.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_user.항목1.style"
                  >
                    {{ table_setting_modal_user.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_user.항목2.style"
                  >
                    {{ table_setting_modal_user.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_user.항목3.style"
                  >
                    {{ table_setting_modal_user.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_user.항목4.style"
                  >
                    {{ table_setting_modal_user.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_user.항목5.style"
                  >
                    {{ table_setting_modal_user.항목5.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_modal_user.항목6.style"
                  >
                    {{ table_setting_modal_user.항목6.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in alert_modal_user.datas.value"
                  :key="todo.아이디"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_user.순번.style"
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
                    :style="table_setting_modal_user.항목1.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>
                      {{ todo[table_setting_modal_user.항목1.name] }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_user.항목2.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>
                      {{ todo[table_setting_modal_user.항목2.name] }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_user.항목3.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>
                      {{ todo[table_setting_modal_user.항목3.name] }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_user.항목4.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>
                      {{ todo[table_setting_modal_user.항목4.name] }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_user.항목5.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>
                      {{ todo[table_setting_modal_user.항목5.name] }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-2 dark:bg-darkmode-600"
                    :style="table_setting_modal_user.항목6.style"
                    @click="importUser(todo.아이디)"
                  >
                    <div>
                      {{ todo[table_setting_modal_user.항목6.name] }}
                    </div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="alert_modal_user.dataCount.value == 0"
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
</template>
