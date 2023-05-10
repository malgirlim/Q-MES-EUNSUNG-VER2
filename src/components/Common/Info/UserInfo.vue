<script setup lang="ts">
import Lucide from "../../../base-components/Lucide";
import Table from "../../../base-components/Table";
const props = defineProps<{
  data?: any;
}>();
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
      <div class="text-base font-medium text-left">{{ data.name }}</div>
      <div class="text-slate-500">{{ data.part }} {{ data.rank }}</div>
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
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.id == null || props.data?.id == ''"
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.id != null && props.data?.id != ''"
          >{{ props.data?.id }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="User" class="w-4 h-4 mr-2 text-slate-500" />
          이름</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.name == null || props.data?.name == ''"
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.name != null && props.data?.name != ''"
          >{{ props.data?.name }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="Phone" class="w-4 h-4 mr-2 text-slate-500" />
          연락처</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목03 == null || props.data?.항목03 == ''"
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목03 != null && props.data?.항목03 != ''"
          >{{ props.data?.항목03 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="Mail" class="w-4 h-4 mr-2 text-slate-500" />
          이메일</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목04 == null || props.data?.항목04 == ''"
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목04 != null && props.data?.항목04 != ''"
          >{{ props.data?.항목04 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="FormInput" class="w-4 h-4 mr-2 text-slate-500" />
          부서명</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목05 == null || props.data?.항목05 == ''"
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목05 != null && props.data?.항목05 != ''"
          >{{ props.data?.항목05 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="FileText" class="w-4 h-4 mr-2 text-slate-500" />
          직책</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목06 == null || props.data?.항목06 == ''"
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목06 != null && props.data?.항목06 != ''"
          >{{ props.data?.항목06 }}</Table.Td
        >
      </Table.Tr>
      <Table.Tr>
        <Table.Td class="flex border-0 py-2"
          ><Lucide icon="UserPlus" class="w-4 h-4 mr-2 text-slate-500" />
          직급</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목07 == null || props.data?.항목07 == ''"
          >-</Table.Td
        >
        <Table.Td
          class="border-0 py-2"
          style="border-left-width: 2px"
          v-if="props.data?.항목07 != null && props.data?.항목07 != ''"
          >{{ props.data?.항목07 }}</Table.Td
        >
      </Table.Tr>
    </Table.Tbody>
  </div>
</template>
