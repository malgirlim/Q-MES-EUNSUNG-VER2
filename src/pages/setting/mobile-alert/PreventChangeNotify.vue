<script setup lang="ts">
import { ref } from "vue";
import { Dialog } from "../../../base-components/Headless";
import { FormInput, FormSelect } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import MobileAlertSelect from "../../../components/Common/Setting/MobileAlertSelect.vue";

//임시데이터
const alert_use = ref(true);
const user_alert_use = ref(false);

// 발송조건 수정 Modal
const editRuleModal = ref(false);
const setEditRuleModal = (value: boolean) => {
  editRuleModal.value = value;
};
// 알림발송대상 추가 Modal
const addUserModal = ref(false);
const setAddUserModal = (value: boolean) => {
  addUserModal.value = value;
};
// 알림발송대상 삭제 Modal
const deleteUserModal = ref(false);
const setDeleteUserModal = (value: boolean) => {
  deleteUserModal.value = value;
};
</script>

<template>
  <div class="mt-5 mb-3 text-xl font-bold">
    <div class="flex items-center">
      <Lucide class="mb-0.5 mr-1" icon="BellPlus" /> 모바일 알림설정
    </div>
  </div>
  <!--BEGIN: 설정 항목들 -->
  <div class="mt-5 grid grid-cols-12 gap-1">
    <div class="col-span-2 border-r-2 border-slate-200" style="height: 640px">
      <div><MobileAlertSelect 설비부품교체시기통보_variant="primary" /></div>
    </div>
    <div class="intro-y col-span-3 border-r-2 border-slate-200">
      <div class="flex items-center text-xl font-bold ml-5">
        <div><Lucide class="mb-0.5 mr-1" icon="Settings2" /></div>
        <div>발송조건</div>
        <div class="ml-5">
          <FormSelect class="w-32" model-value="검사기"
            ><option>검사기</option>
            <option>제판기</option>
            <option>인쇄기1</option>
            <option>인쇄기2</option>
            <option>인쇄기3</option>
            <option>인쇄기4</option>
            <option>인쇄기5</option>
            <option>인쇄기6</option>
            <option>인쇄기7</option>
            <option>인쇄기8</option>
          </FormSelect>
        </div>
        <div class="ml-5">
          <Button
            class="mb-1 w-20 h-6 text-base"
            variant="primary"
            @click="setEditRuleModal(true)"
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
              <div v-if="alert_use == true">
                <div class="flex items-center">
                  <div class="text-green-400 mr-1">●</div>
                  <div>ON</div>
                </div>
              </div>
              <div v-if="alert_use == false">
                <div class="flex items-center">
                  <div class="text-danger mr-1">●</div>
                  <div>OFF</div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center mb-5">
            <div class="w-[30%] mx-2 text-center">
              <div>발송시간</div>
            </div>
            <div class="mr-3"><Lucide icon="ChevronRight" /></div>
            <div class="w-[50%]">오후 4시</div>
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
          <div class="-mt-5">
            <div class="flex items-center mt-5">
              <div class="w-[40%] mx-2 text-center">
                <div>박명한 과장</div>
              </div>
              <div class="mr-3"><Lucide icon="ChevronRight" /></div>
              <div class="w-[50%]">010-3258-2466</div>
              <div
                class="ml-2 cursor-pointer"
                @click="setDeleteUserModal(true)"
              >
                <Lucide class="w-5 h-5 text-danger" icon="X" />
              </div>
            </div>
          </div>
          <div class="flex items-center mt-5">
            <div class="w-[40%] mx-2 text-center">
              <div>고범석 주임</div>
            </div>
            <div class="mr-3"><Lucide icon="ChevronRight" /></div>
            <div class="w-[50%]">010-1234-5676</div>
            <div class="ml-2 cursor-pointer" @click="setDeleteUserModal(true)">
              <Lucide class="w-5 h-5 text-danger" icon="X" />
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
                src="../../../assets/images/kakao_template/PreventChangeNotify.png"
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
  <!-- BEGIN: 발송조건 수정 모달 -->
  <Dialog size="md" :open="editRuleModal" @close="setEditRuleModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5 font-bold text-lg">발송조건 수정</div>

      <div class="mb-3">
        <div class="text-left mb-1">기능사용</div>
        <div>
          <FormSelect model-value="ON">
            <option>ON</option>
            <option>OFF</option>
          </FormSelect>
        </div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">발송시간</div>
        <div><FormInput type="time" model-value="16:00" /></div>
      </div>
      <div>
        <div class="mt-5 text-center">
          <Button class="mr-5 shadow-md" variant="primary" @click=""
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
  <Dialog size="md" :open="addUserModal" @close="setAddUserModal(false)">
    <Dialog.Panel class="p-10 text-center">
      <div class="mb-5 font-bold text-lg">알림발송대상 추가</div>
      <div>
        <Button variant="outline-primary">기준정보에서 불러오기</Button>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">이름</div>
        <div><FormInput type="text" /></div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">직책</div>
        <div><FormInput type="text" /></div>
      </div>
      <div class="mb-3">
        <div class="text-left mb-1">연락처</div>
        <div><FormInput type="text" /></div>
      </div>

      <div>
        <div class="mt-5 text-center">
          <Button class="mr-5 shadow-md" variant="primary" @click=""
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
</template>
