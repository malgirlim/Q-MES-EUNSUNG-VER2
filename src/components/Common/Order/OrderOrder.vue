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
  MasterClient,
  MasterProduct,
} from "../../../interfaces/menu/MasterInterface";
import {
  OrderAccept,
  OrderOrder,
} from "../../../interfaces/menu/orderInterface";
import PaginationComponent from "../../../components/Pagination/PaginationComponent.vue"; // 페이징설정

const props = defineProps<{
  data?: any;
}>();

// 페이지 로딩 시 시작
onMounted(() => {
  order_accept.loadDatas(); // 수주 데이터 불러오기
  order_product.loadDatas(); // 품목 데이터 불러오기
  order_client.loadDatas(); // 거래처 데이터 불러오기
});

// 거래처 데이터 설정
const url_order = "/api/order/order";
const order = useSendApi<OrderOrder>(url_order, ref(1), ref(10));

const orderOrderInit: OrderOrder = {
  NO: undefined,
  수주NO: undefined,
  수주코드: undefined,
  발주코드: undefined,
  발주구분: undefined,
  발주일자: undefined,
  거래처NO: undefined,
  거래처명: undefined,
  품목NO: undefined,
  품목구분: undefined,
  품번: undefined,
  품명: undefined,
  발주수량: undefined,
  단가: undefined,
  공급가액: undefined,
  세액: undefined,
  납기일: undefined,
  도착지주소: undefined,
  기타: undefined,
  비고: undefined,
};

// 수주코드라던지 납품일 같은 공통적인 데이터를 저장할 곳
const defaultData = ref({
  ...orderOrderInit,
  발주일자: dayjs().format("YYYY-MM-DD"),
});

// 품목 리스트를 저장할 곳
// const items = reactive<OrderAccept[]>([{ ...orderOrderInit }]);
let items = ref<OrderOrder[]>([{ ...orderOrderInit, NO: 1 }]);

// 품목 리스트 행 추가
const addRows = () => {
  // NO에서 가장 큰 숫자를 찾기
  let maxNO = items.value
    .filter((item) => item.NO)
    .reduce((prev, curr) => (prev > curr.NO! ? prev : curr.NO!), 0);
  items.value.push({ ...orderOrderInit, NO: maxNO + 2 });
};

// 품목 리스트 행 삭제
const removeRows = (index: number) => {
  items.value.splice(index, 1);
};

// 데이터 등록
const insertData = async () => {
  await items.value.forEach((item) => {
    item.수주NO = defaultData.value.수주NO;
    item.발주코드 = defaultData.value.발주코드;
    item.발주일자 = defaultData.value.발주일자;
    item.거래처NO = defaultData.value.거래처NO;
    item.납기일 = defaultData.value.납기일;
    item.도착지주소 = defaultData.value.도착지주소;
    item.기타 = defaultData.value.기타;
    item.공급가액 = String(Number(item.발주수량) * Number(item.단가));
    item.세액 = String((Number(item.발주수량) * Number(item.단가)) / 10);
  });
  await order.insertAllData(items.value);
  router.push("/order/order-current");
};

// 데이터 등록 확인 모달
const insertButtonRef = ref(null);
const insertCheckModal = ref(false);
const setInsertCheckModal = (value: boolean) => {
  insertCheckModal.value = value;
};

// ############################################### 수주 가져오기 ###############################################

// 수주등록 모달 설정
const acceptModal = ref(false);
const setAcceptModal = (value: boolean) => {
  acceptModal.value = value;
};

// 모달에서 선택한 품목을 items에 넣기
const importAccept = (no: any) => {
  defaultData.value.수주NO = no;
  defaultData.value.발주코드 =
    "O" + order_accept.dataAll.value.filter((c) => c.NO == no)[0]?.코드;
  setAcceptModal(false);
};

// 페이징기능
const currentPage_accept = ref(1); // 현재페이지
const rowsPerPage_accept = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_accept = () => {
  currentPage_accept.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 수주 데이터 설정
const url_order_accept = "/api/order/order/accept";
const order_accept = useSendApi<OrderAccept>(
  url_order_accept,
  currentPage_accept,
  rowsPerPage_accept
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_accept = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "수주일", style: "width: 50px; text-align: center;" },
  항목2: { name: "코드", style: "width: 50px; text-align: center;" },
  항목3: { name: "코드순번", style: "width: 50px; text-align: center;" },
  항목4: { name: "거래처명", style: "width: 50px; text-align: center;" },
  항목5: { name: "품목구분", style: "width: 50px; text-align: center;" },
  항목6: { name: "품명", style: "width: 50px; text-align: center;" },
  항목7: { name: "수량", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_accept = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_accept = ref("전체");
const searchInput_accept = ref("");
const sortKey_accept = ref("등록일");
const sortOrder_accept = ref("내림차순");
const sortOrderToggle_accept = () => {
  sortOrder_accept.value =
    sortOrder_accept.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_accept, sortOrder_accept], (newValue, oldValue) => {
  search_accept();
  pageChangeFirst_accept();
});
const search_accept = () => {
  // console.log(searchKey.value, searchInput.value);
  order_accept.searchDatas(
    searchDate_accept.value,
    searchKey_accept.value,
    searchInput_accept.value,
    sortKey_accept.value,
    sortOrder_accept.value
  );
};

// ############################################### 거래처 가져오기 ###############################################

// 거래처등록 모달 설정
const clientModal = ref(false);
const setClientModal = (value: boolean) => {
  clientModal.value = value;
};

// 모달에서 선택한 품목을 items에 넣기
const importClient = (no: any) => {
  defaultData.value.거래처NO = no;
  searchKey_item.value = "거래처명";
  searchInput_item.value =
    order_client.dataAll.value.filter((c) => c.NO == no)[0]?.거래처명 ?? "";
  order_product.searchDatas(
    searchDate_item.value,
    searchKey_item.value,
    searchInput_item.value,
    sortKey_item.value,
    sortOrder_item.value
  );
  setClientModal(false);
};

// 페이징기능
const currentPage_client = ref(1); // 현재페이지
const rowsPerPage_client = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_client = () => {
  currentPage_client.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 거래처 데이터 설정
const url_order_client = "/api/order/order/client";
const order_client = useSendApi<MasterClient>(
  url_order_client,
  currentPage_client,
  rowsPerPage_client
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_client = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "구분", style: "width: 50px; text-align: center;" },
  항목2: { name: "사업자번호", style: "width: 50px; text-align: center;" },
  항목3: { name: "거래처명", style: "width: 50px; text-align: center;" },
  항목4: { name: "주소", style: "width: 200px; text-align: center;" },
  항목5: { name: "전화번호", style: "width: 50px; text-align: center;" },
  항목6: { name: "이메일", style: "width: 50px; text-align: center;" },
  항목7: { name: "담당자", style: "width: 50px; text-align: center;" },
  항목8: { name: "항목8", style: "width: 50px; text-align: center;" },
};

// ########################## 조회기간 설정 ##########################
const searchDate_client = ref("전체기간");
// ########################## 품목 조회  ##########################
const searchKey_client = ref("전체");
const searchInput_client = ref("");
const sortKey_client = ref("등록일");
const sortOrder_client = ref("내림차순");
const sortOrderToggle_client = () => {
  sortOrder_client.value =
    sortOrder_client.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey_client, sortOrder_client], (newValue, oldValue) => {
  search_client();
  pageChangeFirst_client();
});
const search_client = () => {
  // console.log(searchKey.value, searchInput.value);
  order_client.searchDatas(
    searchDate_client.value,
    searchKey_client.value,
    searchInput_client.value,
    sortKey_client.value,
    sortOrder_client.value
  );
};

// ############################################### 품목 가져오기 ###############################################

// 품목등록 모달 설정
const itemModal = ref(false);
const itemModalIndex = ref(0);
const setItemModal = (value: boolean, no: any) => {
  itemModal.value = value;
  itemModalIndex.value = no;
};

// 모달에서 선택한 품목을 items에 넣기
const importItem = (no: any) => {
  items.value.filter((c) => c.NO === itemModalIndex.value)[0].품목NO = no;
  items.value.filter((c) => c.NO === itemModalIndex.value)[0].단가 =
    order_product.dataAll.value.filter((c) => c.NO == no)[0]?.단가;
  itemModalIndex.value = 0;
  setItemModal(false, 0);
};

// 페이징기능
const currentPage_item = ref(1); // 현재페이지
const rowsPerPage_item = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst_item = () => {
  currentPage_item.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// 품목 데이터 설정
const url_order_product = "/api/order/order/product";
const order_product = useSendApi<MasterProduct>(
  url_order_product,
  currentPage_item,
  rowsPerPage_item
);

// 테이블항목 설정 및 가로크기 조정
const table_setting_item = {
  순번: { name: "순번", style: "width: 50px; text-align: center;" },
  항목1: { name: "구분", style: "width: 50px; text-align: center;" },
  항목2: { name: "품번", style: "width: 200px; text-align: center;" },
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
  order_product.searchDatas(
    searchDate_item.value,
    searchKey_item.value,
    searchInput_item.value,
    sortKey_item.value,
    sortOrder_item.value
  );
};
</script>

#######################################################################################################################

<template>
  <!--BEGIN : 첫번째 행-->
  <div class="grid grid-cols-8 gap-6 mt-3">
    <!--BEGIN : 수주일자, 거래처, 연락처-->
    <div class="col-span-2 intro-y">
      <div class="border-2">
        <Table.Tbody>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="width: 150px; border-right-width: 1px"
              ><strong>수주코드</strong>
            </Table.Td>
            <Table.Td style="width: 300px" class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="
                  order_accept.dataAll.value.filter(
                    (c) => c.NO == defaultData.수주NO
                  )[0]?.코드
                "
                placeholder="여기를 클릭하여 수주코드를 등록해주세요"
                @click="setAcceptModal(true)"
              >
              </FormInput>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><label class="text-danger">*</label><strong>발주코드</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="defaultData.발주코드"
                v-model="defaultData.발주코드"
              ></FormInput>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="width: 100px; border-right-width: 1px"
              ><strong>발주일자</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1">
              <FormInput
                type="date"
                formInputSize="sm"
                v-model="defaultData.발주일자"
              >
              </FormInput>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><strong>거래처</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="
                  order_client.dataAll.value.filter(
                    (c) => c.NO == defaultData.거래처NO
                  )[0]?.거래처명
                "
                placeholder="여기를 클릭하여 거래처를 등록해주세요"
                @click="setClientModal(true)"
              >
              </FormInput>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </div>
    </div>
    <!--END : 수주일자, 거래처, 연락처-->
    <div class="col-span-3 intro-y"></div>
    <!--BEGIN : 공급자-->
    <div class="col-span-3 intro-y">
      <div class="border-2">
        <Table.Tbody>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-3 py-1 text-center bg-gray-300"
              style="width: 30px; border-right-width: 1px"
              rowspan="4"
              ><strong>수요자</strong></Table.Td
            >
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="width: 180px; border-right-width: 1px"
              ><strong>사업자등록번호</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1 text-center" colspan="3">
              <div class="p-1">{{ props.data?.사업자등록번호 }}</div>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><strong>상호</strong>
            </Table.Td>
            <Table.Td style="width: 250px" class="px-1 py-1 text-center">
              <div class="p-1">{{ props.data?.상호 }}</div>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="width: 150px; border-right-width: 1px"
              ><strong>대표자</strong>
            </Table.Td>
            <Table.Td style="width: 250px" class="px-1 py-1 text-center">
              <div class="p-1">{{ props.data?.대표자 }}</div>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><strong>주소</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1 text-center" colspan="3">
              <div class="p-1">
                {{ props.data?.주소 }}
              </div>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><strong>업태</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1 text-center">
              <div class="p-1">{{ props.data?.업태 }}</div>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-left-width: 1px; border-right-width: 1px"
              ><strong>종목</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1 text-center">
              <div class="p-1">{{ props.data?.종목 }}</div>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </div>
    </div>
    <!--END : 수주일자, 거래처, 연락처-->
  </div>
  <!--END :첫번째 행-->
  <!--BEGIN : 두번째 행-->
  <div class="grid grid-cols-8 gap-6 mt-5">
    <div class="col-span-4 intro-y">
      <div class="border-2">
        <Table.Tbody>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px; width: 150px"
              ><strong>납기일자</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1 text-center" style="width: 300px">
              <FormInput
                type="date"
                formInputSize="sm"
                v-model="defaultData.납기일"
              ></FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px; width: 140px"
              rowspan="2"
              ><strong>기타</strong>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              rowspan="2"
              style="width: 350px"
            >
              <FormTextarea
                formTextareaSize="sm"
                style="height: 63px"
                v-model="defaultData.기타"
              >
              </FormTextarea>
            </Table.Td>
          </Table.Tr>
          <Table.Tr class="intro-y">
            <Table.Td
              class="px-1 py-1 text-center bg-gray-300"
              style="border-right-width: 1px"
              ><strong>도착지주소</strong>
            </Table.Td>
            <Table.Td class="px-1 py-1">
              <FormInput
                type="text"
                formInputSize="sm"
                :value="defaultData.도착지주소"
                v-model="defaultData.도착지주소"
              ></FormInput>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </div>
    </div>
  </div>
  <!--END : 두번째 행-->
  <!--BEGIN : 세번째 행-->
  <div class="grid grid-cols-8 gap-6 mt-5">
    <div class="col-span-8 intro-y">
      <div class="border-2">
        <Table.Tbody>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 50px"
            ><Lucide icon="PlusCircle" class="w-5 h-5" @click="addRows" />
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 150px"
            ><strong>품목코드</strong>
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
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 150px"
            ><strong>단가</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 150px"
            ><strong>공급가액</strong>
          </Table.Th>
          <Table.Th
            class="bg-gray-300"
            style="border-right-width: 1px; width: 150px"
            ><strong>세액</strong>
          </Table.Th>
          <Table.Th class="bg-gray-300" style="width: 400px"
            ><strong>비고</strong>
          </Table.Th>
        </Table.Tbody>
        <Table.Tbody>
          <Table.Tr v-for="(item, index) in items" :key="item.NO">
            <Table.Td class="px-1 py-1" style="border-right-width: 1px">
              <Lucide
                icon="MinusCircle"
                class="ml-4 w-5 h-5"
                @click="removeRows(index)"
              />
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                :value="
                  order_product.dataAll.value.filter(
                    (c) => c.NO === item.품목NO
                  )[0]?.품번
                "
                readonly
              ></FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                :value="
                  order_product.dataAll.value.filter(
                    (c) => c.NO === item.품목NO
                  )[0]?.구분
                "
                readonly
              ></FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                placeholder="거래처 선택 후 품목을 등록해주세요"
                :value="
                  order_product.dataAll.value.filter(
                    (c) => c.NO === item.품목NO
                  )[0]?.품명
                "
                @click="setItemModal(true, item.NO)"
              >
              </FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                :value="
                  order_product.dataAll.value.filter(
                    (c) => c.NO === item.품목NO
                  )[0]?.규격
                "
                readonly
              ></FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                v-model="item.발주수량"
              ></FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                :value="
                  order_product.dataAll.value.filter(
                    (c) => c.NO === item.품목NO
                  )[0]?.단위
                "
                readonly
              ></FormInput>
            </Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                :value="item.단가"
                v-model="item.단가"
              ></FormInput
            ></Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                :value="(Number(item.발주수량) || 0) * (Number(item.단가) || 0)"
                readonly
              ></FormInput
            ></Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                :value="
                  ((Number(item.발주수량) || 0) * (Number(item.단가) || 0)) / 10
                "
                readonly
              ></FormInput
            ></Table.Td>
            <Table.Td
              class="px-1 py-1 text-center"
              style="border-right-width: 1px"
              ><FormInput
                type="text"
                formInputSize="sm"
                v-model="item.비고"
              ></FormInput
            ></Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </div>
    </div>
  </div>
  <div class="text-center mt-5 intro-y">
    <Button
      class="mr-2 shadow-md"
      as="a"
      variant="primary"
      @click="setInsertCheckModal(true)"
    >
      <Lucide icon="FilePlus" class="w-4 h-4 mr-2" />
      발주 등록 후 현황이동
    </Button>
  </div>

  <!-- BEGIN: Accept Modal Content -->
  <Dialog size="xxl" :open="acceptModal" @close="setAcceptModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--Accept Modal 내용 시작-->
      <div class="mb-5" style="font-weight: bold; font-size: x-large">
        수주 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap items-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect
              v-model="searchKey_accept"
              class="w-30 mt-3 !box sm:mt-0"
            >
              <option>전체</option>
              <option>수주일</option>
              <option>코드</option>
              <option>거래처명</option>
              <option>품명</option>
            </FormSelect>
          </div>
          <div class="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-2">
            <div class="relative w-56 text-slate-500">
              <FormInput
                type="text"
                class="w-56 pr-10 !box"
                v-model="searchInput_accept"
                @keyup.enter="
                  () => {
                    search_accept();
                    pageChangeFirst_accept();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_accept();
                    pageChangeFirst_accept();
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
            <FormSelect v-model="sortKey_accept" class="w-30 mt-3 !box sm:mt-0">
              <option>등록일</option>
              <option>수주일</option>
              <option>코드</option>
              <option>거래처명</option>
              <option>품명</option>
            </FormSelect>
          </div>
          <div class="ml-3">
            <Button
              class="shadow-md"
              as="a"
              variant="outline-primary"
              v-if="sortOrder_accept == '오름차순'"
              @click="sortOrderToggle_accept"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_accept }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_accept == '내림차순'"
              @click="sortOrderToggle_accept"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_accept }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_accept"
              @change="pageChangeFirst_accept"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="order_accept.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_accept"
              :numberOfPages="order_accept.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ order_accept.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_item }} / {{ order_accept.numberOfPages }} 페이지
              ]</span
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
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_accept.순번.style"
                  >
                    {{ table_setting_accept.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_accept.항목1.style"
                  >
                    {{ table_setting_accept.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_accept.항목2.style"
                  >
                    {{ table_setting_accept.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_accept.항목3.style"
                  >
                    {{ table_setting_accept.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_accept.항목4.style"
                  >
                    {{ table_setting_accept.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_accept.항목5.style"
                  >
                    {{ table_setting_accept.항목5.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in order_accept.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_accept.순번.style"
                    @click="importAccept(todo.NO)"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_accept - 1) * rowsPerPage_accept
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_accept.항목1.style"
                    @click="importAccept(todo.NO)"
                  >
                    <div>{{ todo[table_setting_accept.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_accept.항목2.style"
                    @click="importAccept(todo.NO)"
                  >
                    <div>{{ todo[table_setting_accept.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_accept.항목3.style"
                    @click="importAccept(todo.NO)"
                  >
                    <div>{{ todo[table_setting_accept.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_accept.항목4.style"
                    @click="importAccept(todo.NO)"
                  >
                    <div>{{ todo[table_setting_accept.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_accept.항목5.style"
                    @click="importAccept(todo.NO)"
                  >
                    <div>{{ todo[table_setting_accept.항목5.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="order_accept.dataCount.value == 0"
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
            @click="setAcceptModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Accept Modal Content -->

  <!-- BEGIN: Client Modal Content -->
  <Dialog size="xxl" :open="clientModal" @close="setClientModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <!--Client Modal 내용 시작-->
      <div class="mb-5" style="font-weight: bold; font-size: x-large">
        거래처 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap items-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
        >
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div class="ml-2">
            <FormSelect
              v-model="searchKey_client"
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
                v-model="searchInput_client"
                @keyup.enter="
                  () => {
                    search_client();
                    pageChangeFirst_client();
                  }
                "
                placeholder="검색어를 입력해주세요"
              />
              <button
                @click="
                  () => {
                    search_client();
                    pageChangeFirst_client();
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
            <FormSelect v-model="sortKey_client" class="w-30 mt-3 !box sm:mt-0">
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
              v-if="sortOrder_client == '오름차순'"
              @click="sortOrderToggle_client"
            >
              <Lucide icon="SortAsc" class="w-4 h-4 mr-1" />

              {{ sortOrder_client }}</Button
            >
            <Button
              class="shadow-md"
              as="a"
              variant="outline-danger"
              v-if="sortOrder_client == '내림차순'"
              @click="sortOrderToggle_client"
            >
              <Lucide icon="SortDesc" class="w-4 h-4 mr-1" />

              {{ sortOrder_client }}</Button
            >
          </div>
          <div class="ml-5">
            <FormSelect
              class="w-20 mt-3 !box sm:mt-0"
              v-model="rowsPerPage_client"
              @change="pageChangeFirst_client"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
              <option :value="order_client.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_client"
              :numberOfPages="order_client.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ order_client.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_item }} / {{ order_client.numberOfPages }} 페이지
              ]</span
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
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_client.순번.style"
                  >
                    {{ table_setting_client.순번.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_client.항목1.style"
                  >
                    {{ table_setting_client.항목1.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_client.항목2.style"
                  >
                    {{ table_setting_client.항목2.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_client.항목3.style"
                  >
                    {{ table_setting_client.항목3.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_client.항목4.style"
                  >
                    {{ table_setting_client.항목4.name }}
                  </Table.Th>
                  <Table.Th
                    class="text-center border-b-0 whitespace-nowrap"
                    :style="table_setting_client.항목5.style"
                  >
                    {{ table_setting_client.항목5.name }}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody style="position: relative; z-index: 1">
                <Table.Tr
                  v-for="(todo, index) in order_client.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_client.순번.style"
                    @click="importClient(todo.NO)"
                  >
                    <div>
                      {{
                        index +
                        1 +
                        (currentPage_client - 1) * rowsPerPage_client
                      }}
                    </div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_client.항목1.style"
                    @click="importClient(todo.NO)"
                  >
                    <div>{{ todo[table_setting_client.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_client.항목2.style"
                    @click="importClient(todo.NO)"
                  >
                    <div>{{ todo[table_setting_client.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_client.항목3.style"
                    @click="importClient(todo.NO)"
                  >
                    <div>{{ todo[table_setting_client.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_client.항목4.style"
                    @click="importClient(todo.NO)"
                  >
                    <div>{{ todo[table_setting_client.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_client.항목5.style"
                    @click="importClient(todo.NO)"
                  >
                    <div>{{ todo[table_setting_client.항목5.name] }}</div>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div
              class="text-center mt-20"
              v-if="order_client.dataCount.value == 0"
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
            @click="setClientModal(false)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Client Modal Content -->

  <!-- BEGIN: Item Modal Content -->
  <Dialog size="xxl" :open="itemModal" @close="setItemModal(false, 0)">
    <Dialog.Panel class="p-10 text-center">
      <!--Item Modal 내용 시작-->
      <div class="mb-5" style="font-weight: bold; font-size: x-large">
        품목 리스트
      </div>
      <div class="grid grid-cols-12 gap-1 mt-1">
        <div
          class="flex flex-wrap items-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
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
          class="flex flex-wrap items-center col-span-12 mt-0 intro-y sm:flex-nowrap"
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
              <option :value="order_product.dataCount.value">전체</option>
            </FormSelect>
          </div>
          <div>
            <PaginationComponent
              class="pagination-component"
              v-model="currentPage_item"
              :numberOfPages="order_product.numberOfPages.value"
            />
          </div>
          <div class="hidden mx-auto md:block text-slate-500"></div>
          <div>
            <span class="mr-3"
              >[ {{ order_product.dataCount }}개 데이터 조회됨 ]
            </span>
            <span class="mr-4">
              [ {{ currentPage_item }} /
              {{ order_product.numberOfPages }} 페이지 ]</span
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
                  v-for="(todo, index) in order_product.datas.value"
                  :key="todo.NO"
                  class="intro-x hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
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
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_item.항목1.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목1.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_item.항목2.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목2.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_item.항목3.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목3.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                    :style="table_setting_item.항목4.style"
                    @click="importItem(todo.NO)"
                  >
                    <div>{{ todo[table_setting_item.항목4.name] }}</div>
                  </Table.Td>
                  <Table.Td
                    class="first:rounded-l-md last:rounded-r-md text-center border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
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
              v-if="order_product.dataCount.value == 0"
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
            @click="setItemModal(false, 0)"
            >취소</Button
          >
        </div>
      </div>
      <!--Modal 내용 끝-->
    </Dialog.Panel>
  </Dialog>
  <!-- END: Item Modal Content -->

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
