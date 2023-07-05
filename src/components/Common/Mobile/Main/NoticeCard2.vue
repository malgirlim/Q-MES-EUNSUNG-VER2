<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from "vue";
import Lucide from "../../../../base-components/Lucide";
import Tippy from "../../../../base-components/Tippy";
import { Dialog } from "../../../../base-components/Headless";
import NoticeDetail from "../../Detail/NoticeDetail.vue";
import Button from "../../../../base-components/Button";
import dayjs from "dayjs";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../../composables/useSendApi";
import { MainNotice } from "../../../../interfaces/mainInterface";

const { proxy }: any = getCurrentInstance();

onMounted(async () => {
  await main_announ.loadDatas(); // 공지사항 데이터 불러오기
  await getAnnounData();
  setInterval(() => {
    getAnnounData();
  }, 60000);
});

// 공지사항 가져오기
const url_main_announ = "/api/main/announ";
const main_announ = useSendApi<MainNotice>(url_main_announ, ref(1), ref(1));

// 공지사항 데이터
const 공지사항_전체 = ref({} as MainNotice);
const 공지사항_부서 = ref({} as MainNotice);

async function getAnnounData() {
  await main_announ.searchDatas("전체기간", "구분", "전체", "", ""); // 공지사항 데이터 불러오기
  공지사항_전체.value = await main_announ.dataSearchAll.value;
  await main_announ.searchDatas(
    "전체기간",
    "구분",
    proxy.gstate.account.part,
    "",
    ""
  ); // 공지사항 데이터 불러오기
  공지사항_부서.value = await main_announ.dataSearchAll.value;
}

const props = defineProps<{
  type?: any;
}>();

// 페이지 전환
const switch_page = ref(props.type);

// ##### 상세 Modal #####
const detailModalData = ref();
const detailModal = ref(false);
const setDetailModal = (value: boolean, data: any) => {
  detailModalData.value = data;
  detailModal.value = value;
};

// 날짜 구하기
const date_all = ["2023-06-29", "2023-03-28", "2023-02-05"]; // 임시 기입 데이터
const date_part = ["2023-05-09", "2023-03-03", "2023-01-03"]; // 임시 기입 데이터

const new_notice = (date: any) => {
  const days = dayjs().diff(date, "days");
  return days;
};
const days = new_notice(date_all[0]);
</script>

<template>
  <div class="col-span-3 intro-y">
    <div>
      <div class="p-2.5 box">
        <div class="flex items-center">
          <Lucide icon="BellRing" class="w-[16px] h-[16px] text-primary" />
          <div class="ml-2"><strong>공지사항</strong></div>
          <div
            v-if="switch_page == 'all'"
            :class="[
              'ml-8 pl-2 pr-2 border rounded',
              { 'bg-success': switch_page == 'all' },
              { 'text-white': switch_page == 'all' },
              {
                'border-danger':
                  new_notice(
                    공지사항_전체[0]?.등록일시.slice(0, 10) ?? '2000-01-01'
                  ) < 7,
              },
              {
                'border-black ':
                  new_notice(
                    공지사항_전체[0]?.등록일시.slice(0, 10) ?? '2000-01-01'
                  ) > 7,
              },
            ]"
          >
            전체
          </div>
          <div
            v-if="switch_page == 'part'"
            :class="[
              'ml-8 pl-2 pr-2 border rounded',
              { 'bg-pending': switch_page == 'part' },
              { 'text-white': switch_page == 'part' },
              {
                'border-danger':
                  new_notice(
                    공지사항_부서[0]?.등록일시.slice(0, 10) ?? '2000-01-01'
                  ) < 7,
              },
              {
                'border-black ':
                  new_notice(
                    공지사항_부서[0]?.등록일시.slice(0, 10) ?? '2000-01-01'
                  ) > 7,
              },
            ]"
          >
            부서 : {{ proxy.gstate.account.part }}
          </div>
          <div
            class="ml-3 text-danger"
            v-if="
              switch_page == 'all' &&
              new_notice(
                공지사항_전체[0]?.등록일시.slice(0, 10) ?? '2000-01-01'
              ) < 7
            "
          >
            <strong>새로운 공지사항이 있습니다.</strong>
          </div>
          <div
            class="ml-3 text-danger"
            v-if="
              switch_page == 'part' &&
              new_notice(
                공지사항_부서[0]?.등록일시.slice(0, 10) ?? '2000-01-01'
              ) < 7
            "
          >
            <strong>새로운 공지사항이 있습니다.</strong>
          </div>
          <!-- <div
            class="ml-auto mb-1 cursor-pointer"
            @click="$router.push('share/notice')"
          >
            <Lucide icon="ExternalLink" class="w-4 h-4" />
          </div> -->
        </div>
        <div v-if="switch_page == 'all'" class="fade-in-box">
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">
              {{ 공지사항_전체[0]?.등록일시.slice(0, 10) }}
            </div>
            <div
              class="mt-1 ml-5 cursor-pointer"
              @click="setDetailModal(true, 공지사항_전체[0])"
            >
              {{ 공지사항_전체[0]?.제목 }}
            </div>
            <div
              class="ml-1.5"
              v-if="
                new_notice(
                  공지사항_전체[0]?.등록일시.slice(0, 10) ?? '2000-01-01'
                ) < 7
              "
            >
              <img src="../../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">{{ 공지사항_전체[0]?.등록자 }}</div>
          </div>
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">
              {{ 공지사항_전체[1]?.등록일시.slice(0, 10) }}
            </div>
            <div
              class="mt-1 ml-5 cursor-pointer"
              @click="setDetailModal(true, 공지사항_전체[1])"
            >
              {{ 공지사항_전체[1]?.제목 }}
            </div>
            <div
              class="ml-1.5"
              v-if="
                new_notice(
                  공지사항_전체[1]?.등록일시.slice(0, 10) ?? '2000-01-01'
                ) < 7
              "
            >
              <img src="../../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">{{ 공지사항_전체[1]?.등록자 }}</div>
          </div>
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">
              {{ 공지사항_전체[2]?.등록일시.slice(0, 10) }}
            </div>
            <div
              class="mt-1 ml-5 cursor-pointer"
              @click="setDetailModal(true, 공지사항_전체[2])"
            >
              {{ 공지사항_전체[2]?.제목 }}
            </div>
            <div
              class="ml-1.5"
              v-if="
                new_notice(
                  공지사항_전체[2]?.등록일시.slice(0, 10) ?? '2000-01-01'
                ) < 7
              "
            >
              <img src="../../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">{{ 공지사항_전체[2]?.등록자 }}</div>
          </div>
        </div>
        <div v-if="switch_page == 'part'" class="fade-in-box">
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">
              {{ 공지사항_부서[0]?.등록일시.slice(0, 10) }}
            </div>
            <div
              class="mt-1 ml-5 cursor-pointer"
              @click="setDetailModal(true, 공지사항_부서[0])"
            >
              {{ 공지사항_부서[0]?.제목 }}
            </div>
            <div
              class="ml-1.5"
              v-if="
                new_notice(
                  공지사항_부서[0]?.등록일시.slice(0, 10) ?? '2000-01-01'
                ) < 7
              "
            >
              <img src="../../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">{{ 공지사항_부서[0]?.등록자 }}</div>
          </div>
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">
              {{ 공지사항_부서[1]?.등록일시.slice(0, 10) }}
            </div>
            <div
              class="mt-1 ml-5 cursor-pointer"
              @click="setDetailModal(true, 공지사항_부서[1])"
            >
              {{ 공지사항_부서[1]?.제목 }}
            </div>
            <div
              class="ml-1.5"
              v-if="
                new_notice(
                  공지사항_부서[1]?.등록일시.slice(0, 10) ?? '2000-01-01'
                ) < 7
              "
            >
              <img src="../../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">{{ 공지사항_부서[1]?.등록자 }}</div>
          </div>
          <div class="flex mt-0.5 items-center">
            <Lucide icon="MessageCircle" class="w-4 h-4" />
            <div class="mt-1 ml-1">
              {{ 공지사항_부서[2]?.등록일시.slice(0, 10) }}
            </div>
            <div
              class="mt-1 ml-5 cursor-pointer"
              @click="setDetailModal(true, 공지사항_부서[2])"
            >
              {{ 공지사항_부서[2]?.제목 }}
            </div>
            <div
              class="ml-1.5"
              v-if="
                new_notice(
                  공지사항_부서[2]?.등록일시.slice(0, 10) ?? '2000-01-01'
                ) < 7
              "
            >
              <img src="../../../../assets/images/new.png" />
            </div>
            <div class="mt-1 ml-auto pr-1">{{ 공지사항_부서[2]?.등록자 }}</div>
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
        setDetailModal(false, null);
      }
    "
  >
    <Dialog.Panel>
      <NoticeDetail :data="detailModalData" />
      <div class="px-5 pb-8 text-center">
        <Button
          variant="outline-primary"
          as="a"
          type="button"
          @click="
            () => {
              setDetailModal(false, null);
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
