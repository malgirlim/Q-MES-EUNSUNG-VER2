<script setup lang="ts">
import { ref, onMounted } from "vue";
import router from "../../../../router";
import Button from "../../../../base-components/Button";
import Lucide from "../../../../base-components/Lucide";
import { Dialog } from "../../../../base-components/Headless";
import {
  FormSelect,
  FormInput,
  FormTextarea,
} from "../../../../base-components/Form";

// 컴포넌트 로드

import TaskList from "../../../../components/Common/Mobile/Order/TaskList.vue";
import ItemList from "../../../../components/Common/Mobile/Order/ItemList.vue";
import BadList from "../../../../components/Common/Mobile/Order/BadList.vue";
import NonOPList from "../../../../components/Common/Mobile/Order/NonOPList.vue";

// 페이지 로딩 시 시작
onMounted(async () => {
  setTimeout(() => {
    menu_fix.value = ".";
  }, 500);
});

// 메뉴재정렬 (메뉴 레이아웃 밀리는 문제 해결 코드)
const menu_fix = ref();

// 임시데이터
const data = true;

// ##### 작업지시목록 Modal #####
const taskListModal = ref(false);
const setTaskListModal = (value: boolean) => {
  taskListModal.value = value;
};

// ##### 소요자재목록 Modal #####
const itemListModal = ref(false);
const setItemListModal = (value: boolean) => {
  itemListModal.value = value;
};

// ##### 불량사유목록 Modal #####
const badListModal = ref(false);
const setBadListModal = (value: boolean) => {
  badListModal.value = value;
};

// ##### 비가동사유목록 Modal #####
const nonOPListModal = ref(false);
const setNonOPListModal = (value: boolean) => {
  nonOPListModal.value = value;
};

// ##### 설비 선택 Modal #####
const facilitySelectModal = ref(false);
const setFacilitySelectModal = (value: boolean) => {
  facilitySelectModal.value = value;
};
</script>
<template>
  <div class="p-5 intro-y">
    <div class="flex">
      <div class="mr-auto">
        <Button
          class="text-white"
          variant="success"
          @click="setTaskListModal(true)"
          ><Lucide
            class="w-4 h-4 mb-0.5 mr-1"
            icon="Scroll"
          />작업지시목록</Button
        >
      </div>
      <div>
        <Button variant="dark" @click="setFacilitySelectModal(true)"
          ><Lucide class="w-4 h-4 mb-0.5 mr-1" icon="Home" />설비 선택</Button
        >
      </div>
    </div>
    <!-- BEGIN : 작업 공정 정보-->
    <div v-if="data == true">
      <div class="mt-5">
        <div
          class="flex rounded-t-md text-center h-8 pl-1 pr-1 pt-1 bg-success text-white"
        >
          <div class="m-auto"><strong>작업 공정 정보</strong></div>
        </div>
        <div class="border-2 border-success">
          <table class="w-full">
            <tbody>
              <tr class="border-b-2 border-success h-7">
                <td
                  class="text-center border-r-2 border-success bg-slate-200 font-bold w-24"
                >
                  작업코드
                </td>
                <td class="pl-2 text-left">TAS0022112202</td>
              </tr>
              <tr class="border-b-2 border-success h-7">
                <td
                  class="text-center border-r-2 border-success bg-slate-200 font-bold"
                >
                  공정
                </td>
                <td class="pl-2 text-left">인쇄2공정</td>
              </tr>

              <tr class="border-b-2 border-success h-7">
                <td
                  class="text-center border-r-2 border-success bg-slate-200 font-bold"
                >
                  품목구분
                </td>
                <td class="pl-2 text-left">반제품</td>
              </tr>
              <tr class="border-b-2 border-success h-7">
                <td
                  class="text-center border-r-2 border-success bg-slate-200 font-bold"
                >
                  품명
                </td>
                <td class="pl-2 text-left">POWER TERMINAL PRE-MOLD</td>
              </tr>
              <tr class="border-b-2 border-success h-7">
                <td
                  class="text-center border-r-2 border-success bg-slate-200 font-bold"
                >
                  규격
                </td>
                <td class="pl-2 text-left">A2 E-EGR</td>
              </tr>
              <tr class="border-b-2 border-success h-7">
                <td
                  class="text-center border-r-2 border-success bg-slate-200 font-bold"
                >
                  지시수량
                </td>
                <td class="pl-2 text-left">3,000</td>
              </tr>
              <tr class="border-success h-7">
                <td
                  class="text-center border-r-2 border-success bg-slate-200 font-bold"
                >
                  단위
                </td>
                <td class="pl-2 text-left">매</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- END : 작업 공정 정보-->
      <!-- BEGIN : 실적 입력-->
      <div class="mt-5">
        <div
          class="flex rounded-t-md text-center h-8 pl-1 pr-1 pt-1 bg-primary text-white"
        >
          <div class="m-auto"><strong>실적 입력</strong></div>
        </div>
        <div class="border-2 border-primary">
          <table class="w-full">
            <tbody>
              <tr class="border-b-2 border-primary h-7">
                <td
                  class="text-center border-r-2 border-primary bg-slate-200 font-bold w-24"
                >
                  작업자
                </td>
                <td class="p-1 text-left">
                  <FormInput
                    class="pl-1 w-full h-7"
                    type="text"
                    placeholder=""
                  />
                </td>
              </tr>
              <tr class="border-b-2 border-primary h-7">
                <td
                  class="text-center border-r-2 border-primary bg-slate-200 font-bold"
                >
                  설비
                </td>
                <td class="p-1 text-left">
                  <div>
                    <FormInput
                      class="pl-1 w-full h-7"
                      type="text"
                      placeholder=""
                    />
                  </div>
                </td>
              </tr>
              <tr class="border-b-2 border-primary h-7">
                <td
                  class="text-center border-r-2 border-primary bg-slate-200 font-bold"
                >
                  생산수
                </td>
                <td class="p-1 text-left">
                  <FormInput
                    class="pl-1 w-full h-7"
                    type="text"
                    placeholder=""
                  />
                </td>
              </tr>
              <tr class="border-b-2 border-primary h-7">
                <td
                  class="text-center border-r-2 border-primary bg-slate-200 font-bold"
                >
                  양품수
                </td>
                <td class="p-1 text-left">
                  <FormInput
                    class="pl-1 w-full h-7"
                    readonly
                    type="text"
                    placeholder=""
                  />
                </td>
              </tr>
              <tr class="border-b-2 border-primary h-7">
                <td
                  class="border-b-2 text-center border-r-2 border-primary bg-slate-200 font-bold"
                >
                  시작일시
                </td>
                <td class="p-1 text-left">
                  <FormInput
                    class="pl-1 w-full h-7"
                    type="datetime-local"
                    step="10"
                    placeholder=""
                  />
                </td>
              </tr>
              <tr class="border-b-2 border-primary h-7">
                <td
                  class="border-b-2 text-center border-r-2 border-primary bg-slate-200 font-bold"
                >
                  종료일시
                </td>
                <td class="p-1 text-left">
                  <FormInput
                    class="pl-1 w-full h-7"
                    type="datetime-local"
                    step="10"
                    placeholder=""
                  />
                </td>
              </tr>
              <tr class="border-primary h-7">
                <td
                  class="text-center border-r-2 border-primary bg-slate-200 font-bold"
                >
                  특이사항
                </td>
                <td class="p-1 text-left">
                  <FormInput
                    class="pl-1 w-full h-7"
                    type="text"
                    placeholder=""
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- END : 실적 입력-->
      <!-- BEGIN : 소요 자재 -->
      <div class="mt-5">
        <div
          class="flex rounded-t-md h-8 pl-1 pr-1 pt-1 bg-[#D9821C] text-white"
        >
          <div class="my-auto pl-9 ml-auto"><strong>소요 자재</strong></div>
          <div class="my-auto ml-auto">
            <Button
              class="h-6 mb-0.5 mr-0.5"
              variant="primary"
              @click="setItemListModal(true)"
              >+</Button
            >
          </div>
        </div>
        <div class="border-l-2 border-r-2 border-t-2 border-[#D9821C]">
          <table class="w-full">
            <thead class="border-b-2 border-[#D9821C] bg-slate-200 h-8">
              <th class="border-r-2 border-[#D9821C] w-24">LOT코드</th>
              <th class="border-r-2 border-[#D9821C] w-32">품명</th>
              <th class="border-r-2 border-[#D9821C] w-32">규격</th>
              <th class="border-r-2 border-[#D9821C] w-16">단위</th>
              <th class="w-16">수량</th>
            </thead>
            <tbody>
              <tr v-for="i in Array(5).fill('10')">
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  FA1230418
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  인쇄용지1
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  인쇄규격2
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  롤
                </td>
                <td class="p-1 text-center border-b-2 border-[#D9821C] h-7">
                  <FormInput
                    class="pl-1 w-full h-7"
                    type="text"
                    placeholder=""
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- END : 소요 자재-->

      <!-- BEGIN : 불량 사유 -->
      <div class="mt-5">
        <div
          class="flex rounded-t-md h-8 pl-1 pr-1 pt-1 bg-[#D9821C] text-white"
        >
          <div class="my-auto pl-9 ml-auto"><strong>불량 사유</strong></div>
          <div class="my-auto ml-auto">
            <Button
              class="h-6 mb-0.5 mr-0.5"
              variant="primary"
              @click="setBadListModal(true)"
              >+</Button
            >
          </div>
        </div>
        <div class="border-l-2 border-r-2 border-t-2 border-[#D9821C]">
          <table class="w-full">
            <thead class="border-b-2 border-[#D9821C] bg-slate-200 h-8">
              <th class="border-r-2 border-[#D9821C] w-14">코드</th>
              <th class="border-r-2 border-[#D9821C] w-22">구분</th>
              <th class="border-r-2 border-[#D9821C] w-32">불량명</th>
              <th class="w-14">수량</th>
            </thead>
            <tbody>
              <tr v-for="i in Array(5).fill('10')">
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  0011
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  오염
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  재질오염
                </td>
                <td class="p-1 text-center border-b-2 border-[#D9821C] h-7">
                  <FormInput
                    class="pl-1 w-full h-7"
                    type="text"
                    placeholder=""
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- END : 불량 사유-->

      <!-- BEGIN : 비가동 사유 -->
      <div class="mt-5">
        <div
          class="flex rounded-t-md h-8 pl-1 pr-1 pt-1 bg-[#D9821C] text-white"
        >
          <div class="my-auto pl-9 ml-auto"><strong>비가동 사유</strong></div>
          <div class="my-auto ml-auto">
            <Button
              class="h-6 mb-0.5 mr-0.5"
              variant="primary"
              @click="setNonOPListModal(true)"
              >+</Button
            >
          </div>
        </div>
        <div class="border-l-2 border-r-2 border-t-2 border-[#D9821C]">
          <table class="w-full">
            <thead class="border-b-2 border-[#D9821C] bg-slate-200 h-8">
              <th class="border-r-2 border-[#D9821C] w-12">코드</th>
              <th class="border-r-2 border-[#D9821C] w-28">비가동명</th>
              <th class="w-44">시작/종료일시</th>
            </thead>
            <tbody>
              <tr v-for="i in Array(5).fill('10')">
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  0012
                </td>
                <td
                  class="text-center border-b-2 border-r-2 border-[#D9821C] h-7"
                >
                  계획정지
                </td>
                <td class="p-1 border-b-2 border-[#D9821C] h-7">
                  <FormInput
                    class="pl-1 w-48 h-7 mb-1"
                    type="datetime-local"
                    step="10"
                    placeholder=""
                  />
                  <FormInput
                    class="pl-1 w-48 h-7"
                    type="datetime-local"
                    step="10"
                    placeholder=""
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- END : 비가동 사유-->

      <!--BEGIN : 하단 버튼 시작-->
      <div class="flex mt-5">
        <div class="flex mx-auto">
          <div class="mr-10">
            <Button class="text-white w-24" variant="pending" @click=""
              >작업중지</Button
            >
          </div>
          <div>
            <Button class="w-24" variant="facebook" @click="">작업완료</Button>
          </div>
        </div>
      </div>
      <!--END : 하단 버튼 시작-->
    </div>
  </div>
  <div v-if="data == false">
    <div class="text-center mt-10 mb-10 text-md intro-y">
      <div>선택된 작업이 없습니다.</div>
      <div class="mt-2">작업지시목록에서 작업을 선택해주세요.</div>
    </div>
  </div>
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mt-5 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved{{ menu_fix }}</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->

  <!-- BEGIN: 작업지시목록 Modal -->
  <Dialog
    :open="taskListModal"
    size="md"
    @close="
      () => {
        setTaskListModal(false);
      }
    "
  >
    <Dialog.Panel style="top: -7%">
      <div class="font-bold text-xl text-center pt-4">작업지시 선택</div>
      <div><TaskList /></div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-primary"
          type="button"
          class="w-24"
          @click="setTaskListModal(false)"
        >
          닫기
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 작업지시목록 Modal -->

  <!-- BEGIN: 소요자재 목록 Modal -->
  <Dialog
    :open="itemListModal"
    size="md"
    @close="
      () => {
        setItemListModal(false);
      }
    "
  >
    <Dialog.Panel style="top: -7%">
      <div class="font-bold text-xl text-center pt-4">소요자재 선택</div>
      <div><ItemList v-model:modalclose="itemListModal" /></div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 소요자재목록 Modal -->

  <!-- BEGIN: 불량사유 목록 Modal -->
  <Dialog
    :open="badListModal"
    size="md"
    @close="
      () => {
        setBadListModal(false);
      }
    "
  >
    <Dialog.Panel style="top: -7%">
      <div class="font-bold text-xl text-center pt-4">불량유형 선택</div>
      <div><BadList v-model:modalclose="badListModal" /></div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 불량사유 목록 Modal -->

  <!-- BEGIN: 비가동사유 목록 Modal -->
  <Dialog
    :open="nonOPListModal"
    size="md"
    @close="
      () => {
        setNonOPListModal(false);
      }
    "
  >
    <Dialog.Panel style="top: -7%">
      <div class="font-bold text-xl text-center pt-4">비가동사유 선택</div>
      <div><NonOPList v-model:modalclose="nonOPListModal" /></div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 비가동사유목록 Modal -->

  <!-- BEGIN: 설비 선택 Modal -->
  <Dialog
    :open="facilitySelectModal"
    size="md"
    @close="
      () => {
        setFacilitySelectModal(false);
      }
    "
  >
    <Dialog.Panel style="top: 25%">
      <div class="p-3">
        <div class="text-primary">
          <Lucide class="mx-auto w-20 h-20" icon="HelpCircle" />
        </div>
        <div class="font-bold text-xl text-center pt-4">
          설비선택 메뉴로 돌아가시겠습니까?
        </div>
        <div class="px-5 pb-4 pt-5 text-center">
          <Button
            variant="primary"
            type="button"
            class="w-24 mr-5"
            @click="
              setFacilitySelectModal(false);
              $router.push('/mobile/order/task-report');
            "
          >
            확인
          </Button>
          <Button
            variant="outline-primary"
            type="button"
            class="w-24"
            @click="setFacilitySelectModal(false)"
          >
            취소
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 설비 선택 Modal -->
</template>
