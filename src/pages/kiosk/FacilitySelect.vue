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

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../composables/useSendApi";
import { KioskWork } from "../../interfaces/menu/kioskInterface";

onMounted(async () => {
  setInterval(() => {
    now.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
  }, 1000);

  await kiosk_work.loadDatas();
  setInterval(() => {
    kiosk_work.loadDatas();
  }, 10000);
});

// dataManager 만들기
const url_kiosk_work = "/api/kiosk/work";
const kiosk_work = useSendApi<KioskWork>(url_kiosk_work, ref(1), ref(1));

// ################################################  로그인 관련  ################################################
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

#############################################################################################################################
#############################################################################################################################
#############################################################################################################################

<template>
  <div class="pl-4 pr-4 pt-2">
    <div class="intro-y bg-[#3a437c] p-2 rounded-md">
      <img class="m-auto w-32" src="../../assets/images/kiosk_logo.svg" />
    </div>

    <div class="flex items-center h-10 intro-y">
      <LoadingIcon icon="circles" class="w-5 h-5 mr-2" />
      <div>
        <h2 class="mr-5 text-base font-medium truncate" :key="now">
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
      class="p-2 mt-3 mb-3 font-bold border-2 border-[#3a437c] text-center text-xl rounded-md bg-white intro-y"
    >
      설비 선택
    </div>

    <div class="p-3 mt-5 mb-5 text-center bg-slate-200 intro-y">
      <div class="grid grid-cols-5 gap-3">
        <FacilityCard
          name="TEST설비명"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 1)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 1)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 1)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 1)[0]
              ?.시작일시 ?? ''
          "
          @click="$router.push('/kiosk/facility1/')"
        />
        <FacilityCard
          name="설비명2"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 2)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 2)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 2)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 2)[0]
              ?.시작일시 ?? ''
          "
          @click="$router.push('/kiosk/facility2/')"
        />
        <FacilityCard
          name="설비명3"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 3)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 3)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 3)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 3)[0]
              ?.시작일시 ?? ''
          "
          @click="$router.push('/kiosk/facility3/')"
        />
        <FacilityCard
          name="설비명4"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 4)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 4)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 4)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 4)[0]
              ?.시작일시 ?? ''
          "
          @click="$router.push('/kiosk/facility4/')"
        />
        <FacilityCard
          name="설비명5"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 5)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 5)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 5)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 5)[0]
              ?.시작일시 ?? ''
          "
          @click="$router.push('/kiosk/facility5/')"
        />
      </div>
      <div class="grid grid-cols-5 gap-3 mt-10">
        <FacilityCard
          name="설비명6"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 6)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 6)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 6)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 6)[0]
              ?.시작일시 ?? ''
          "
          @click="$router.push('/kiosk/facility6/')"
        />
        <FacilityCard
          name="설비명7"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 7)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 7)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 7)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 7)[0]
              ?.시작일시 ?? ''
          "
          @click="$router.push('/kiosk/facility7/')"
        />
        <FacilityCard
          name="설비명8"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 8)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 8)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 8)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 8)[0]
              ?.시작일시 ?? ''
          "
          @click="$router.push('/kiosk/facility8/')"
        />
        <FacilityCard
          name="설비명9"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 9)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 9)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 9)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 9)[0]
              ?.시작일시 ?? ''
          "
          @click="$router.push('/kiosk/facility9/')"
        />
        <FacilityCard
          name="설비명10"
          :running="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 10)[0]
              ?.설비현황 ?? '미가동'
          "
          :product="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 10)[0]?.품명 ??
            ''
          "
          :worker="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 10)[0]
              ?.작업자 ?? ''
          "
          :time="
            kiosk_work.dataSearchAll.value.filter((k) => k.NO == 10)[0]
              ?.시작일시 ?? ''
          "
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
