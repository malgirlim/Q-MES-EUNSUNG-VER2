<script setup lang="ts">
import { ref } from "vue";
import Lucide from "../../../base-components/Lucide";
import Tippy from "../../../base-components/Tippy";
import { Dialog } from "../../../base-components/Headless";
import NoticeDetail from "../Detail/NoticeDetail.vue";
import Button from "../../../base-components/Button";
import moment from "moment";

// 페이지 전환
const switch_page = ref("all");

// ##### 상세 Modal #####
const detailModal = ref(false);
const setDetailModal = (value: boolean) => {
  detailModal.value = value;
};

// 날짜 구하기
const date_all = ["2023-05-09", "2023-03-28", "2023-02-05"]; // 임시 기입 데이터
const date_part = ["2023-05-09", "2023-03-03", "2023-01-03"]; // 임시 기입 데이터

const new_notice = (date: any) => {
  const days = moment().diff(date, "days");
  return days;
};
const days = new_notice(date_all[0]);
</script>

<template>
  <div class="col-span-2 sm:col-span-2 xl:col-span-2 intro-y">
    <div>
      <div class="p-2.5 box">
        <div class="flex items-center">
          <Lucide icon="BellRing" class="w-[16px] h-[16px] text-primary" />
          <div class="ml-2"><strong>공지사항</strong></div>
          <div
            :class="[
              'ml-8 pl-2 pr-2 border cursor-pointer rounded',
              { 'bg-success': switch_page == 'all' },
              { 'text-white': switch_page == 'all' },
              { 'border-danger': new_notice(date_all[0]) < 7 },
              { 'border-black ': new_notice(date_all[0]) > 7 },
            ]"
            @click="switch_page = 'all'"
          >
            전체
          </div>
          <div
            :class="[
              'ml-3 pl-2 pr-2 border cursor-pointer rounded',
              { 'bg-success': switch_page == 'part' },
              { 'text-white': switch_page == 'part' },
              { 'border-danger': new_notice(date_all[0]) < 7 },
              { 'border-black ': new_notice(date_all[0]) > 7 },
            ]"
            @click="switch_page = 'part'"
          >
            부서
          </div>
          <div class="ml-3 text-danger" v-if="new_notice(date_all[0]) < 7">
            <strong>새로운 공지사항이 있습니다.</strong>
          </div>
          <div
            class="ml-auto mb-1 cursor-pointer"
            @click="$router.push('share/notice')"
          >
            <Lucide icon="ExternalLink" class="w-4 h-4" />
          </div>
        </div>
        <div v-if="switch_page == 'all'" class="fade-in-box">
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">{{ date_all[0] }}</div>
            <div class="mt-1 ml-5 cursor-pointer" @click="setDetailModal(true)">
              전체 공지사항 1
            </div>
            <div class="ml-1.5" v-if="new_notice(date_all[0]) < 7">
              <img src="../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">관리자</div>
          </div>
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">{{ date_all[1] }}</div>
            <div class="mt-1 ml-5 cursor-pointer" @click="setDetailModal(true)">
              전체 공지사항 2
            </div>
            <div class="ml-1.5" v-if="new_notice(date_all[1]) < 7">
              <img src="../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">관리자</div>
          </div>
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">{{ date_all[2] }}</div>
            <div class="mt-1 ml-5 cursor-pointer" @click="setDetailModal(true)">
              전체 공지사항 3
            </div>
            <div class="ml-1.5" v-if="new_notice(date_all[2]) < 7">
              <img src="../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">관리자</div>
          </div>
        </div>
        <div v-if="switch_page == 'part'" class="fade-in-box">
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">{{ date_part[0] }}</div>
            <div class="mt-1 ml-5 cursor-pointer" @click="setDetailModal(true)">
              부서별 공지사항 1
            </div>
            <div class="ml-1.5" v-if="new_notice(date_part[0]) < 7">
              <img src="../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">관리자</div>
          </div>
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">{{ date_part[1] }}</div>
            <div class="mt-1 ml-5 cursor-pointer" @click="setDetailModal(true)">
              부서별 공지사항 2
            </div>
            <div class="ml-1.5" v-if="new_notice(date_part[1]) < 7">
              <img src="../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">관리자</div>
          </div>
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">{{ date_part[2] }}</div>
            <div class="mt-1 ml-5 cursor-pointer" @click="setDetailModal(true)">
              부서별 공지사항 3
            </div>
            <div class="ml-1.5" v-if="new_notice(date_part[2]) < 7">
              <img src="../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">관리자</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- BEGIN: Detail Modal Content -->
  <Dialog
    size="lg"
    :open="detailModal"
    @close="
      () => {
        setDetailModal(false);
      }
    "
  >
    <Dialog.Panel>
      <NoticeDetail data="" />
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-primary"
          as="a"
          type="button"
          @click="
            () => {
              setDetailModal(false);
            }
          "
          class="w-24 mr-1"
        >
          닫기
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: Detail Modal Content -->
</template>

<style scoped>
.fade-in-box {
  animation: fadein 0.3s;
  -webkit-animation: fadein 0.3s;
}
@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
