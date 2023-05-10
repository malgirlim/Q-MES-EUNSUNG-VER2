<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, Ref } from "vue";
import _ from "lodash";
import { FormLabel } from "../../../base-components/Form";

import Button from "../../../base-components/Button";
import Lucide from "../../../base-components/Lucide";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { Dialog } from "../../../base-components/Headless";
import Table from "../../../base-components/Table";

import moment from "moment";
import { toast } from "vue3-toastify";

import axios from "axios";
import router from "../../../router";

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
    <div class="intro-y bg-[#3a437c] p-2 rounded-md">
      <img class="m-auto w-32" src="../../../assets/images/kiosk_logo.svg" />
    </div>

    <div class="flex mt-2 items-center h-10 intro-y">
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
    <div class="mt-3 flex intro-y">
      <div class="flex m-auto">
        <Button
          class="mr-5 h-14 w-44 text-2xl"
          as="a"
          variant="dark"
          @click="$router.push('/kiosk')"
          ><Lucide icon="Home" class="w-7 h-7 mb-0.5 mr-1" /><strong
            >설비선택</strong
          ></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl text-white"
          as="a"
          variant="success"
          ><strong>작업지시목록</strong></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl text-white"
          as="a"
          variant="success"
          ><strong>점검목록</strong></Button
        ><Button
          class="mr-5 h-14 w-44 text-2xl text-white"
          as="a"
          variant="success"
          ><strong>작업시작</strong></Button
        ><Button class="mr-5 h-14 w-44 text-2xl" as="a" variant="pending"
          ><strong>비가동등록</strong></Button
        ><Button class="mr-5 h-14 w-44 text-2xl" as="a" variant="pending"
          ><strong>불량등록</strong></Button
        ><Button class="mr-5 h-14 w-44 text-2xl" as="a" variant="primary"
          ><strong>투입자재변경</strong></Button
        ><Button class="mr-5 h-14 w-44 text-2xl" as="a" variant="primary"
          ><strong>작업자변경</strong></Button
        ><Button class="h-14 w-44 text-2xl" as="a" variant="danger"
          ><strong>작업종료</strong></Button
        >
      </div>
    </div>
    <div class="p-1 mt-3 text-center text-xl intro-y">
      <strong>인쇄기1 설비 작업현황</strong>
    </div>
    <div
      class="p-2 mt-3 border-2 border-[#3a437c] text-center text-xl rounded-md bg-white intro-y"
      style="height: 650px"
    >
      <div class="grid grid-cols-4 gap-2">
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-success text-white">
            <strong>생산제품</strong>
          </div>
          <div class="border-2 border-success" style="height: 279px"></div>
        </div>
        <div class="col-span-2">
          <div class="pl-1 pr-1 pt-1 bg-[#D9821C] text-white">
            <strong>투입자재</strong>
          </div>
          <div class="border-2 border-[#D9821C]" style="height: 279px"></div>
        </div>

        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-primary text-white">
            <strong>생산실적</strong>
          </div>
          <div class="border-2 border-primary" style="height: 279px"></div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-2 mt-2">
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-success text-white">
            <strong>작업지시정보</strong>
          </div>
          <div class="border-2 border-success" style="height: 279px"></div>
        </div>
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-[#D9821C] text-white">
            <strong>비가동</strong>
          </div>
          <div class="border-2 border-[#D9821C]" style="height: 279px"></div>
        </div>
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-[#D9821C] text-white">
            <strong>불량</strong>
          </div>
          <div class="border-2 border-[#D9821C]" style="height: 279px"></div>
        </div>
        <div class="col-span-1">
          <div class="pl-1 pr-1 pt-1 bg-primary text-white">
            <strong>생산수입력</strong>
          </div>
          <div class="border-2 border-primary" style="height: 279px">
            <div class="grid grid-cols-3">
              <div class="cols-span-1 mt-3">
                <Button class="w-32 text-4xl">7</Button>
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">8</Button>
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">9</Button>
              </div>
            </div>
            <div class="grid grid-cols-3 mt-1">
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">4</Button>
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">5</Button>
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">6</Button>
              </div>
            </div>
            <div class="grid grid-cols-3 mt-1">
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">1</Button>
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">2</Button>
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">3</Button>
              </div>
            </div>
            <div class="grid grid-cols-3 mt-1">
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">AC</Button>
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">0</Button>
              </div>
              <div class="cols-span-1">
                <Button class="w-32 text-4xl">DEL</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mr-10 mt-2" style="text-align: right">
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
