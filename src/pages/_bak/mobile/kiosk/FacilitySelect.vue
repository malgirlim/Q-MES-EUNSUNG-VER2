<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, Ref } from "vue";
import _ from "lodash";
import { FormLabel } from "../../base-components/Form";

import Lucide from "../../base-components/Lucide";
import Button from "../../base-components/Button";
import LoadingIcon from "../../base-components/LoadingIcon";
import { Dialog } from "../../base-components/Headless";

import dayjs from "dayjs";
import { toast } from "vue3-toastify";

import axios from "axios";
import router from "../../router";

import FacilityCard from "../../components/Common/Kiosk/FacilityCard.vue";

onMounted(async () => {
  setInterval(() => {
    now.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
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
const now = ref(dayjs().format("YYYY-MM-DD HH:mm:ss"));
const year = ref(dayjs().format("YYYY"));
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
      class="p-3 mt-5 mb-5 font-bold border-2 border-[#3a437c] text-center text-4xl rounded-md bg-white intro-y"
    >
      설비 선택
    </div>

    <div class="p-3 mt-5 mb-5 text-center bg-slate-200 intro-y">
      <div class="grid grid-cols-4 gap-6">
        <FacilityCard
          name="인쇄기1"
          running="가동중"
          product="제품1"
          worker="박명한"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility1/')"
        />
        <FacilityCard
          name="인쇄기2"
          running="가동중"
          product="제품2"
          worker="고범석"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility2/')"
        />
        <FacilityCard
          name="인쇄기3"
          running="비가동"
          product="제품3"
          worker="윤호상"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility3/')"
        />
        <FacilityCard
          name="인쇄기4"
          running="가동중"
          product="제품4"
          worker="강민철"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility4/')"
        />
      </div>
      <div class="grid grid-cols-4 gap-6 mt-10">
        <FacilityCard
          name="인쇄기5"
          running="미가동"
          product="제품5"
          worker="김주현"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility5/')"
        />
        <FacilityCard
          name="인쇄기6"
          running="가동중"
          product="제품6"
          worker="송은아"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility6/')"
        />
        <FacilityCard
          name="인쇄기7"
          running="가동중"
          product="제품7"
          worker="사은미"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility7/')"
        />
        <FacilityCard
          name="인쇄기8"
          running="비가동"
          product="제품8"
          worker="이훈노"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility8/')"
        />
      </div>
      <div class="grid grid-cols-4 gap-6 mt-10">
        <FacilityCard
          name="검사기"
          running="가동중"
          product="제품9"
          worker="최순우"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility9/')"
        />
        <FacilityCard
          name="제판기"
          running="미가동"
          product="제품10"
          worker="손정일"
          time="2023-05-11 12:34"
          @click="$router.push('/kiosk/facility10/')"
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
  <Dialog :open="logoutModal" size="lg" @close="setLogoutModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="LogOut" class="w-32 h-32 mx-auto mt-3 text-danger" />
        <div class="mt-10 text-3xl">로그아웃 하시겠습니까?</div>
      </div>

      <div class="mt-10 px-5 pb-8 text-center">
        <Button
          variant="outline-secondary"
          type="button"
          class="w-48 mr-10 text-2xl"
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
          class="w-48 text-2xl"
        >
          확인
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 로그아웃 확인 Modal -->
</template>
