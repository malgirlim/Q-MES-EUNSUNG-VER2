<script lang="ts">
export default {
  created() {
    // 컴포넌트 생성시 데이터를 패치한다
    this.fetchData();
  },
  watch: {
    // 라우터 객체를 감시하고 있다가 fetchData() 함수를 호출한다
    $route: "fetchData",
  },
  methods: {
    fetchData() {
      //console.log(this.$route.meta.pagename);
      // console.log(this.$route.meta.name);
    },
  },
};
</script>

<script setup lang="ts">
import { getCurrentInstance, ref, watch } from "vue";
import Lucide from "../../base-components/Lucide";
import logoUrl from "../../assets/images/logo.png";
import Breadcrumb from "../../base-components/Breadcrumb";
import Button from "../../base-components/Button";
import { FormInput } from "../../base-components/Form";
import { Menu, Popover, Dialog } from "../../base-components/Headless";
import fakerData from "../../utils/faker";
import _ from "lodash";
import { TransitionRoot } from "@headlessui/vue";
import { toast } from "vue3-toastify";
import ProgramInfo from "../../components/Common/Info/ProgramInfo.vue";
import UserInfo from "../../components/Common/Info/UserInfo.vue";
import PasswordChange from "../../components/Common/Info/PasswordChange.vue";

/*로그인 관련 BEGIN*/
import axios from "axios";
import router from "../../router";

const { proxy }: any = getCurrentInstance();

const logout = () => {
  axios
    .delete("/api/auth", { params: { user: proxy.gstate.account.id } })
    .then(() => {
      toast.info("정상 로그아웃 하였습니다.");
      proxy.gstate.account.id = null;
      proxy.gstate.account.name = "";
      proxy.gstate.account.rank = "";
      router.push("/login");
    });
};

axios
  .get("/api/auth")
  .then((res: any) => {
    proxy.gstate.account = res.data;
  })
  .catch(() => {
    if (proxy.gstate.account.id == null) {
      router.push("/login");
    }
  });

/*로그인 관련 END*/

/* 로그아웃 확인 Modal */
const logoutModal = ref(false);
const setLogoutModal = (value: boolean) => {
  logoutModal.value = value;
};

/* 프로그램 정보 Modal */
const infoModal = ref(false);
const setInfoModal = (value: boolean) => {
  infoModal.value = value;
};

/* 사용자 정보 Modal */
const userInfoModal = ref(false);
const setUserInfoModal = (value: boolean) => {
  userInfoModal.value = value;
};

/* 비밀번호 변경 Modal */
const passwordModal = ref(false);
const setPasswordModal = (value: boolean) => {
  passwordModal.value = value;
};

const props = defineProps<{
  layout?: "side-menu" | "simple-menu" | "top-menu";
}>();

const searchDropdown = ref(false);
const showSearchDropdown = () => {
  searchDropdown.value = true;
};
const hideSearchDropdown = () => {
  searchDropdown.value = false;
};

// 디버깅모드 설정

proxy.gstate.debug.active = localStorage.getItem("debugMode");

const setDebugMode = () => {
  if (proxy.gstate.debug.active == "off" || proxy.gstate.debug.active == null) {
    localStorage.setItem("debugMode", "on");
    proxy.gstate.debug.active = "on";
  } else {
    localStorage.setItem("debugMode", "off");
    proxy.gstate.debug.active = "off";
  }
};
</script>

<template>
  <div
    :class="[
      'h-[70px] md:h-[65px] z-[51] border-b border-white/[0.08] mt-12 md:mt-0 -mx-3 sm:-mx-8 md:-mx-0 px-3 md:border-b-0 relative md:fixed md:inset-x-0 md:top-0 sm:px-8 md:px-10 md:pt-10 md:bg-gradient-to-b md:from-slate-100 md:to-transparent dark:md:from-darkmode-700',
      props.layout == 'top-menu' && 'dark:md:from-darkmode-800',
      'before:content-[\'\'] before:absolute before:h-[65px] before:inset-0 before:top-0 before:mx-7 before:bg-success/30 before:mt-3 before:rounded-xl before:hidden before:md:block before:dark:bg-darkmode-600/30',
      'after:content-[\'\'] after:absolute after:inset-0 after:h-[65px] after:mx-3 after:bg-success after:mt-5 after:rounded-xl after:shadow-md after:hidden after:md:block after:dark:bg-darkmode-600',
    ]"
  >
    <div class="flex items-center h-full">
      <!-- BEGIN: Logo -->
      <RouterLink
        :to="{ name: 'top-menu-main' }"
        :class="[
          '-intro-x hidden md:flex',
          props.layout == 'side-menu' && 'xl:w-[180px]',
          props.layout == 'simple-menu' && 'xl:w-auto',
          props.layout == 'top-menu' && 'w-auto',
        ]"
      >
        <img
          alt="Enigma Tailwind HTML Admin Template"
          class="w-6"
          :src="logoUrl"
          style="width: 30px; height: 30px"
        />
        <span
          :class="[
            'ml-3 text-lg text-white',
            props.layout == 'side-menu' && 'hidden xl:block',
            props.layout == 'simple-menu' && 'hidden',
          ]"
        >
          EUNSUNG PRINTERS
        </span>
      </RouterLink>
      <!-- END: Logo -->
      <!-- BEGIN: Breadcrumb -->
      <Breadcrumb
        light
        :class="[
          'h-[45px] md:ml-10 md:border-l border-white/[0.08] dark:border-white/[0.08] mr-auto -intro-x',
          props.layout != 'top-menu' && 'md:pl-6',
          props.layout == 'top-menu' && 'md:pl-10',
        ]"
      >
        <Breadcrumb.Link>메인</Breadcrumb.Link>
        <Breadcrumb.Link v-if="$route.meta.category != undefined">
          {{ $route.meta.category }}
        </Breadcrumb.Link>
        <Breadcrumb.Link>
          {{ $route.meta.pagename }}
        </Breadcrumb.Link>
      </Breadcrumb>

      <!-- END: Breadcrumb -->
      <div class="relative mr-3 intro-x sm:mr-6 text-white">
        {{ proxy.gstate.account.name }}
        {{ proxy.gstate.account.rank }} ({{ proxy.gstate.account.part }})
      </div>
      <!-- BEGIN: Search
      <div class="relative mr-3 intro-x sm:mr-6">
        <div class="relative hidden sm:block">
          <FormInput
            type="text"
            class="border-transparent w-56 shadow-none rounded-full bg-slate-200 pr-8 transition-[width] duration-300 ease-in-out focus:border-transparent focus:w-72 dark:bg-darkmode-400"
            placeholder="Search..."
            @focus="showSearchDropdown"
            @blur="hideSearchDropdown"
          />
          <Lucide
            icon="Search"
            class="absolute inset-y-0 right-0 w-5 h-5 my-auto mr-3 text-slate-600 dark:text-slate-500"
          />
        </div>
        <a class="relative text-white/70 sm:hidden" href="">
          <Lucide icon="Search" class="w-5 h-5 dark:text-slate-500" />
        </a>
        <TransitionRoot
          as="template"
          :show="searchDropdown"
          enter="transition-all ease-linear duration-150"
          enterFrom="mt-5 invisible opacity-0 translate-y-1"
          enterTo="mt-[3px] visible opacity-100 translate-y-0"
          entered="mt-[3px]"
          leave="transition-all ease-linear duration-150"
          leaveFrom="mt-[3px] visible opacity-100 translate-y-0"
          leaveTo="mt-5 invisible opacity-0 translate-y-1"
        >
          <div class="absolute right-0 z-10 mt-[3px]">
            <div class="w-[450px] p-5 box">
              <div class="mb-2 font-medium">Pages</div>
              <div class="mb-5">
                <a href="" class="flex items-center">
                  <div
                    class="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 dark:bg-success/10 text-success"
                  >
                    <Lucide icon="Inbox" class="w-4 h-4" />
                  </div>
                  <div class="ml-3">Mail Settings</div>
                </a>
                <a href="" class="flex items-center mt-2">
                  <div
                    class="flex items-center justify-center w-8 h-8 rounded-full bg-pending/10 text-pending"
                  >
                    <Lucide icon="Users" class="w-4 h-4" />
                  </div>
                  <div class="ml-3">Users & Permissions</div>
                </a>
                <a href="" class="flex items-center mt-2">
                  <div
                    class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary/80"
                  >
                    <Lucide icon="CreditCard" class="w-4 h-4" />
                  </div>
                  <div class="ml-3">Transactions Report</div>
                </a>
              </div>
              <div class="mb-2 font-medium">Users</div>
              <div class="mb-5">
                <a
                  v-for="(faker, fakerKey) in _.take(fakerData, 4)"
                  :key="fakerKey"
                  href=""
                  class="flex items-center mt-2"
                >
                  <div class="w-8 h-8 image-fit">
                    <img
                      alt="Midone Tailwind HTML Admin Template"
                      class="rounded-full"
                      :src="faker.photos[0]"
                    />
                  </div>
                  <div class="ml-3">{{ faker.users[0].name }}</div>
                  <div
                    class="w-48 ml-auto text-xs text-right truncate text-slate-500"
                  >
                    {{ faker.users[0].email }}
                  </div>
                </a>
              </div>
              <div class="mb-2 font-medium">Products</div>
              <a
                v-for="(faker, fakerKey) in _.take(fakerData, 4)"
                :key="fakerKey"
                href=""
                class="flex items-center mt-2"
              >
                <div class="w-8 h-8 image-fit">
                  <img
                    alt="Midone Tailwind HTML Admin Template"
                    class="rounded-full"
                    :src="faker.images[0]"
                  />
                </div>
                <div class="ml-3">{{ faker.products[0].name }}</div>
                <div
                  class="w-48 ml-auto text-xs text-right truncate text-slate-500"
                >
                  {{ faker.products[0].category }}
                </div>
              </a>
            </div>
          </div>
        </TransitionRoot>
      </div>
      END: Search -->
      <!-- BEGIN: Notifications
      <Popover class="mr-4 intro-x sm:mr-6">
        <Popover.Button
          class="relative text-white/70 outline-none block before:content-[''] before:w-[8px] before:h-[8px] before:rounded-full before:absolute before:top-[-2px] before:right-0 before:bg-danger"
        >
          <Lucide icon="Bell" class="w-5 h-5 dark:text-slate-500" />
        </Popover.Button>
        <Popover.Panel class="w-[280px] sm:w-[350px] p-5 mt-2">
          <div class="mb-5 font-medium">Notifications</div>
          <div
            v-for="(faker, fakerKey) in _.take(fakerData, 5)"
            :key="fakerKey"
            :class="[
              'cursor-pointer relative flex items-center',
              { 'mt-5': fakerKey },
            ]"
          >
            <div class="relative flex-none w-12 h-12 mr-1 image-fit">
              <img
                alt="Midone Tailwind HTML Admin Template"
                class="rounded-full"
                :src="faker.photos[0]"
              />
              <div
                class="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-success dark:border-darkmode-600"
              ></div>
            </div>
            <div class="ml-2 overflow-hidden">
              <div class="flex items-center">
                <a href="" class="mr-5 font-medium truncate">
                  {{ faker.users[0].name }}
                </a>
                <div class="ml-auto text-xs text-slate-400 whitespace-nowrap">
                  {{ faker.times[0] }}
                </div>
              </div>
              <div class="w-full truncate text-slate-500 mt-0.5">
                {{ faker.news[0].shortContent }}
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Popover>
      END: Notifications -->
      <!-- BEGIN: Account Menu -->

      <Menu>
        <Menu.Button
          class="block w-8 h-8 overflow-hidden rounded-full shadow-lg image-fit zoom-in intro-x"
        >
          <img
            alt="Midone Tailwind HTML Admin Template"
            src="../../assets/images/user.png"
          />
        </Menu.Button>
        <Menu.Items
          class="w-56 mt-px relative bg-success/80 before:block before:absolute before:bg-black before:inset-0 before:rounded-md before:z-[-1] text-white"
        >
          <Menu.Header class="font-normal">
            <div class="font-medium">{{ proxy.gstate.account.name }}</div>
            <div class="text-xs text-white/70 mt-0.5 dark:text-slate-500">
              {{ proxy.gstate.account.part }} / {{ proxy.gstate.account.rank }}
            </div>
          </Menu.Header>
          <Menu.Devider class="bg-white/[0.08]" />
          <Menu.Item class="hover:bg-white/5" @click="setUserInfoModal(true)">
            <Lucide icon="User" class="w-4 h-4 mr-2" />
            사용자 정보
          </Menu.Item>

          <Menu.Item class="hover:bg-white/5" @click="setPasswordModal(true)">
            <Lucide icon="Lock" class="w-4 h-4 mr-2" /> 비밀번호 변경
          </Menu.Item>

          <Menu.Item class="hover:bg-white/5">
            <Lucide icon="HelpCircle" class="w-4 h-4 mr-2" /> 도움말
          </Menu.Item>
          <Menu.Item class="hover:bg-white/5" @click="setInfoModal(true)">
            <Lucide icon="Info" class="w-4 h-4 mr-2" />
            프로그램 정보
          </Menu.Item>
          <Menu.Devider class="bg-white/[0.08]" />
          <Menu.Item class="hover:bg-white/5" @click="setDebugMode()">
            <div class="flex" v-if="proxy.gstate.debug.active != 'on'">
              <Lucide icon="ToggleLeft" class="w-4 h-4 mr-2" /> 디버그모드(OFF)
            </div>
            <div class="flex" v-if="proxy.gstate.debug.active == 'on'">
              <Lucide icon="ToggleRight" class="w-4 h-4 mr-2" /> 디버그모드(ON)
            </div>
          </Menu.Item>
          <Menu.Item class="hover:bg-white/5" @click="setLogoutModal(true)">
            <Lucide icon="LogOut" class="w-4 h-4 mr-2" /> 로그아웃
          </Menu.Item>
        </Menu.Items>
      </Menu>
      <!-- END: Account Menu -->
    </div>
  </div>

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
  <!-- BEGIN: 프로그램 정보 Modal -->
  <Dialog :open="infoModal" @close="setInfoModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="Info" class="w-16 h-16 mx-auto mt-3 text-success" />
        <div class="mt-5 text-xl">Q-MES 정보</div>
        <div><ProgramInfo /></div>
      </div>

      <div class="px-5 pb-8 text-center">
        <Button
          as="a"
          variant="outline-success"
          type="button"
          class="w-24 mr-3"
          @click="setInfoModal(false)"
        >
          확인
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 프로그램 정보 Modal -->
  <!-- BEGIN: 사용자 정보 Modal -->
  <Dialog :open="userInfoModal" @close="setUserInfoModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <div class="mt-5 text-xl">사용자 정보</div>
        <div><UserInfo :data="proxy.gstate.account" /></div>
      </div>

      <div class="px-5 pb-8 text-center">
        <Button
          as="a"
          variant="outline-success"
          type="button"
          class="w-24 mr-3"
          @click="setUserInfoModal(false)"
        >
          확인
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 사용자 정보 Modal -->
  <!-- BEGIN: 비밀번호 변경 Modal -->
  <Dialog :open="passwordModal" @close="setPasswordModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <div class="mt-5 text-xl">비밀번호 변경</div>
        <div><PasswordChange /></div>
      </div>

      <div class="px-5 pb-8 text-center">
        <Button
          as="a"
          variant="primary"
          type="button"
          class="w-24 mr-3"
          @click="setPasswordModal(false)"
        >
          확인
        </Button>
        <Button
          as="a"
          variant="outline-primary"
          type="button"
          class="w-24 mr-3"
          @click="setPasswordModal(false)"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 비밀번호 변경 Modal -->
</template>
