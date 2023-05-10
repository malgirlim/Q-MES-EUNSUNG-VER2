<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, Ref } from "vue";
import _ from "lodash";
import { FormLabel } from "../../base-components/Form";

import Lucide from "../../base-components/Lucide";
import Button from "../../base-components/Button";
import LoadingIcon from "../../base-components/LoadingIcon";
import { Dialog } from "../../base-components/Headless";

import moment from "moment";
import { toast } from "vue3-toastify";

import axios from "axios";
import router from "../../router";

import FacilityCard from "../../components/Common/Kiosk/FacilityCard.vue";

onMounted(async () => {
  setInterval(() => {
    now.value = moment().format("YYYY-MM-DD HH:mm:ss");
  }, 1000);
});

/*로그인 관련 BEGIN*/

const { proxy }: any = getCurrentInstance();

const logout = () => {
  axios
    .delete("/api/auth", { params: { user: proxy.gstate.account.id } })
    .then(() => {
      toast.info("정상 로그아웃 하였습니다.");
      proxy.gstate.account.id = null;
      proxy.gstate.account.name = "";
      proxy.gstate.account.rank = "";
      router.push("/kiosk/login");
    });
};

axios
  .get("/api/auth")
  .then((res: any) => {
    proxy.gstate.account = res.data;
  })
  .catch(() => {
    if (proxy.gstate.account.id == null) {
      router.push("/kiosk/login");
    }
  });

/*로그인 관련 END*/

/* 로그아웃 확인 Modal */
const logoutModal = ref(false);
const setLogoutModal = (value: boolean) => {
  logoutModal.value = value;
};

// 날짜 구하기
const now = ref(moment().format("YYYY-MM-DD HH:mm:ss"));
const year = ref(moment().format("YYYY"));
</script>

<template>
  <div class="pl-8 pr-8 pt-8">
    <div class="intro-y bg-[#3a437c] p-3 rounded-md">
      <img class="m-auto w-64" src="../../assets/images/kiosk_logo.svg" />
    </div>

    <div class="flex items-center h-10 intro-y">
      <LoadingIcon icon="circles" class="w-5 h-5 mr-2" />
      <div>
        <h2 class="mr-5 text-lg font-medium truncate" :key="now">
          {{ now }}
        </h2>
      </div>
      <div class="hidden mx-auto md:block text-slate-500"></div>
      <div class="mr-5">
        <strong>{{ proxy.gstate.account.name }}</strong
        >님 로그인 되었습니다.
      </div>
      <div
        class="flex items-center text-danger cursor-pointer mr-5"
        @click="setLogoutModal(true)"
      >
        <Lucide icon="LogOut" class="w-4 h-4 mr-2" /> 로그아웃
      </div>
      <div
        class="flex items-center text-primary cursor-pointer mr-1"
        @click="$router.go(0)"
      >
        <Lucide icon="RefreshCcw" class="w-4 h-4 mr-2" /> 새로고침
      </div>
    </div>
    <div
      class="p-3 mt-5 mb-5 border-2 border-[#3a437c] text-center text-3xl rounded-md bg-white intro-y"
    >
      설비 선택
    </div>

    <div class="p-3 mt-5 mb-5 text-center bg-slate-200 intro-y">
      <div class="grid grid-cols-4 gap-6">
        <FacilityCard
          name="인쇄기1"
          :running="true"
          product="제품1"
          worker="박명한"
          @click="$router.push('/kiosk/facility1/')"
        />
        <FacilityCard
          name="인쇄기2"
          :running="true"
          product="제품2"
          worker="고범석"
        />
        <FacilityCard
          name="인쇄기3"
          :running="false"
          product="제품3"
          worker="윤호상"
        />
        <FacilityCard
          name="인쇄기4"
          :running="true"
          product="제품4"
          worker="강민철"
        />
      </div>
      <div class="grid grid-cols-4 gap-6 mt-10">
        <FacilityCard
          name="인쇄기5"
          :running="false"
          product="제품5"
          worker="김주현"
        />
        <FacilityCard
          name="인쇄기6"
          :running="true"
          product="제품6"
          worker="송은아"
        />
        <FacilityCard
          name="인쇄기7"
          :running="true"
          product="제품7"
          worker="사은미"
        />
        <FacilityCard
          name="인쇄기8"
          :running="true"
          product="제품8"
          worker="이훈노"
        />
      </div>
      <div class="grid grid-cols-4 gap-6 mt-10">
        <FacilityCard
          name="검사기"
          :running="false"
          product="제품9"
          worker="최순우"
        />
        <FacilityCard
          name="제판기"
          :running="true"
          product="제품10"
          worker="손정일"
        />
      </div>
    </div>
  </div>
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mr-10" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->

  <!-- BEGIN: 로그아웃 확인 Modal -->
  <Dialog :open="logoutModal" @close="setLogoutModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="LogOut" class="w-16 h-16 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-xl">로그아웃 하시겠습니까?</div>
      </div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          class="w-24 mr-3"
          @click="setLogoutModal(false)"
        >
          취소
        </Button>

        <Button
          variant="danger"
          type="button"
          @click="
            () => {
              setLogoutModal(false);
              logout();
            }
          "
          class="w-24 mr-1"
        >
          확인
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 로그아웃 확인 Modal -->
</template>
