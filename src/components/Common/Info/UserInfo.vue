<script setup lang="ts">
import { ref } from "vue";
import Lucide from "../../../base-components/Lucide";
import Table from "../../../base-components/Table";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import { MasterUser } from "../../../interfaces/menu/MasterInterface";

const props = defineProps<{
  data?: any;
}>();

// dataManager 만들기
const url = "/api/master/user/info";
const dataManager = useSendApi<MasterUser>(url, ref(1), ref(10));
dataManager.searchDatas("", "", props.data?.id, "", "");
</script>
<template>
  <div class="flex items-center mt-3">
    <div class="w-12 h-12 image-fit ml-auto">
      <img
        alt="Midone Tailwind HTML Admin Template"
        class="rounded-full"
        src="../../../assets/images/user.png"
      />
    </div>
    <div class="ml-4 mr-auto">
      <div class="text-base font-medium text-left">
        {{ dataManager.dataSearchAll.value[0]?.아이디 }}
      </div>
      <div class="text-slate-500">
        {{ dataManager.dataSearchAll.value[0]?.부서명 }}
        {{ dataManager.dataSearchAll.value[0]?.직급 }}
      </div>
    </div>
  </div>

  <div class="mt-5 border border-2">
    <Table.Tbody>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2" style="width: 170px"
          ><Lucide icon="Code" class="w-4 h-4 mr-2 text-slate-500" />
          아이디</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.아이디 == null ||
            dataManager.dataSearchAll.value[0]?.아이디 == ''
          "
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.아이디 != null &&
            dataManager.dataSearchAll.value[0]?.아이디 != ''
          "
          >{{ dataManager.dataSearchAll.value[0]?.아이디 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="User" class="w-4 h-4 mr-2 text-slate-500" />
          이름</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.이름 == null ||
            dataManager.dataSearchAll.value[0]?.이름 == ''
          "
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.이름 != null &&
            dataManager.dataSearchAll.value[0]?.이름 != ''
          "
          >{{ dataManager.dataSearchAll.value[0]?.이름 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="Phone" class="w-4 h-4 mr-2 text-slate-500" />
          연락처</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.연락처 == null ||
            dataManager.dataSearchAll.value[0]?.연락처 == ''
          "
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.연락처 != null &&
            dataManager.dataSearchAll.value[0]?.연락처 != ''
          "
          >{{ dataManager.dataSearchAll.value[0]?.연락처 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="Mail" class="w-4 h-4 mr-2 text-slate-500" />
          이메일</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.이메일 == null ||
            dataManager.dataSearchAll.value[0]?.이메일 == ''
          "
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.이메일 != null &&
            dataManager.dataSearchAll.value[0]?.이메일 != ''
          "
          >{{ dataManager.dataSearchAll.value[0]?.이메일 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="FormInput" class="w-4 h-4 mr-2 text-slate-500" />
          부서명</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.부서명 == null ||
            dataManager.dataSearchAll.value[0]?.부서명 == ''
          "
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.부서명 != null &&
            dataManager.dataSearchAll.value[0]?.부서명 != ''
          "
          >{{ dataManager.dataSearchAll.value[0]?.부서명 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="FileText" class="w-4 h-4 mr-2 text-slate-500" />
          직책</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.직책 == null ||
            dataManager.dataSearchAll.value[0]?.직책 == ''
          "
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.직책 != null &&
            dataManager.dataSearchAll.value[0]?.직책 != ''
          "
          >{{ dataManager.dataSearchAll.value[0]?.직책 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="UserPlus" class="w-4 h-4 mr-2 text-slate-500" />
          직급</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.직급 == null ||
            dataManager.dataSearchAll.value[0]?.직급 == ''
          "
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2 text-left"
          style="border-left-width: 2px"
          v-if="
            dataManager.dataSearchAll.value[0]?.직급 != null &&
            dataManager.dataSearchAll.value[0]?.직급 != ''
          "
          >{{ dataManager.dataSearchAll.value[0]?.직급 }}</Table.Td
        >
      </Table.Tr>
    </Table.Tbody>
  </div>
</template>
