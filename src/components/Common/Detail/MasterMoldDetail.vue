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
        <div class="text-center text-xl font-bold truncate">금형 상세정보</div>
      </div>
      <div
        class="border-2 pt-1 pb-1 overflow-hidden intro-y"
        style="overflow-y: scroll; overflow-x: hidden; max-height: 600px"
      >
        <Table.Tbody>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2" style="width: 170px"
              ><Lucide icon="Code" class="w-4 h-4 mr-2 text-slate-500" />
              코드</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.코드 == null || props.data?.코드 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.코드 != null && props.data?.코드 != ''"
              >{{ props.data?.코드 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="List" class="w-4 h-4 mr-2 text-slate-500" />
              취득구분</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.취득구분 == null || props.data?.취득구분 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.취득구분 != null && props.data?.취득구분 != ''"
              >{{ props.data?.취득구분 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="List" class="w-4 h-4 mr-2 text-slate-500" />
              공정구분</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.공정구분 == null || props.data?.공정구분 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.공정구분 != null && props.data?.공정구분 != ''"
              >{{ props.data?.공정구분 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Package" class="w-4 h-4 mr-2 text-slate-500" />
              금형명</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.금형명 == null || props.data?.금형명 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.금형명 != null && props.data?.금형명 != ''"
              >{{ props.data?.금형명 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Gem" class="w-4 h-4 mr-2 text-slate-500" />
              등급</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.등급 == null || props.data?.등급 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.등급 != null && props.data?.등급 != ''"
              >{{ props.data?.등급 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Tag" class="w-4 h-4 mr-2 text-slate-500" />
              규격</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.규격 == null || props.data?.규격 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.규격 != null && props.data?.규격 != ''"
              >{{ props.data?.규격 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Vote" class="w-4 h-4 mr-2 text-slate-500" />
              사용여부</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.사용여부 == null || props.data?.사용여부 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.사용여부 != null && props.data?.사용여부 != ''"
              >{{ props.data?.사용여부 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Cpu" class="w-4 h-4 mr-2 text-slate-500" />
              공정</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.공정 == null || props.data?.공정 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.공정 != null && props.data?.공정 != ''"
              >{{ props.data?.공정 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Building2" class="w-4 h-4 mr-2 text-slate-500" />
              제작사</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.제작사 == null || props.data?.제작사 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.제작사 != null && props.data?.제작사 != ''"
              >{{ props.data?.제작사 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Coins" class="w-4 h-4 mr-2 text-slate-500" />
              가격</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.가격 == null || props.data?.가격 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.가격 != null && props.data?.가격 != ''"
              >{{ Number(props.data?.가격).toLocaleString() }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarPlus"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              취득일자</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.취득일자 == null || props.data?.취득일자 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.취득일자 != null && props.data?.취득일자 != ''"
              >{{ props.data?.취득일자 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarMinus"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              교체수명일</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="
                props.data?.교체수명일 == null || props.data?.교체수명일 == ''
              "
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="
                props.data?.교체수명일 != null && props.data?.교체수명일 != ''
              "
              >{{ props.data?.교체수명일 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Warehouse" class="w-4 h-4 mr-2 text-slate-500" />
              보관장소</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.보관장소 == null || props.data?.보관장소 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.보관장소 != null && props.data?.보관장소 != ''"
              >{{ props.data?.보관장소 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Image" class="w-4 h-4 mr-2 text-slate-500" />
              사진</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.사진 == null || props.data?.사진 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.사진 != null && props.data?.사진 != ''"
              >{{ props.data?.사진 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="FileText" class="w-4 h-4 mr-2 text-slate-500" />
              비고</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.비고 == null || props.data?.비고 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.비고 != null && props.data?.비고 != ''"
              >{{ props.data?.비고 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="UserPlus" class="w-4 h-4 mr-2 text-slate-500" />
              등록자</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.등록자 == null || props.data?.등록자 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.등록자 != null && props.data?.등록자 != ''"
              >{{ props.data?.등록자 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              등록일시</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.등록일시 == null || props.data?.등록일시 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.등록일시 != null && props.data?.등록일시 != ''"
              >{{ props.data?.등록일시 }}</Table.Td
            >
          </Table.Tr>
        </Table.Tbody>
      </div>
    </div>
  </div>
</template>
