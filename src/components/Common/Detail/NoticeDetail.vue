<script setup lang="ts">
import Lucide from "../../../base-components/Lucide";
import Table from "../../../base-components/Table";
const props = defineProps<{
  data?: any;
}>();
</script>
<template>
  <div class="p-5">
    <div>
      <div
        class="items-center pb-5 mb-5 border-b border-slate-200/60 dark:border-darkmode-400"
      >
        <div class="text-center text-xl font-bold truncate">공지사항</div>
      </div>
      <div class="border-2 pt-1 pb-1">
        <Table.Tbody>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2" style="width: 170px"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              등록일시</Table.Td
            >
            <Table.Td class="border-0 py-2" style="border-left-width: 2px">{{
              props.data?.등록일시
            }}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2" style="width: 170px"
              ><Lucide icon="Megaphone" class="w-4 h-4 mr-2 text-slate-500" />
              구분</Table.Td
            >
            <Table.Td class="border-0 py-2" style="border-left-width: 2px">{{
              props.data?.구분
            }}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Tag" class="w-4 h-4 mr-2 text-slate-500" />
              제목</Table.Td
            >
            <Table.Td class="border-0 py-2" style="border-left-width: 2px">{{
              props.data?.제목
            }}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="FileText" class="w-4 h-4 mr-2 text-slate-500" />
              내용</Table.Td
            >
            <Table.Td class="border-0 py-2" style="border-left-width: 2px">{{
              props.data?.내용
            }}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="UserPlus" class="w-4 h-4 mr-2 text-slate-500" />
              등록자</Table.Td
            >
            <Table.Td class="border-0 py-2" style="border-left-width: 2px">{{
              props.data?.등록자
            }}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </div>
    </div>
  </div>
</template>
