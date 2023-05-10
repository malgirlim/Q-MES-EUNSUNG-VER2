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
        <div class="text-center text-xl font-bold truncate">---- 상세정보</div>
      </div>
      <div
        class="border-2 pt-1 pb-1 overflow-hidden intro-y"
        style="overflow-y: scroll; overflow-x: hidden; max-height: 600px"
      >
        <Table.Tbody>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2" style="width: 170px"
              ><Lucide icon="Package2" class="w-4 h-4 mr-2 text-slate-500" />
              항목01</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목01 == null || props.data?.항목01 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목01 != null && props.data?.항목01 != ''"
              >{{ props.data?.항목01 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Code" class="w-4 h-4 mr-2 text-slate-500" />
              항목02</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목02 == null || props.data?.항목02 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목02 != null && props.data?.항목02 != ''"
              >{{ props.data?.항목02 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide icon="Package" class="w-4 h-4 mr-2 text-slate-500" />
              항목03</Table.Td
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
              ><Lucide icon="List" class="w-4 h-4 mr-2 text-slate-500" />
              항목04</Table.Td
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
              항목05</Table.Td
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
              항목06</Table.Td
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
              항목07</Table.Td
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
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목08</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목08 == null || props.data?.항목08 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목08 != null && props.data?.항목08 != ''"
              >{{ props.data?.항목08 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목09</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목09 == null || props.data?.항목09 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목09 != null && props.data?.항목09 != ''"
              >{{ props.data?.항목09 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목10</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목10 == null || props.data?.항목10 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목10 != null && props.data?.항목10 != ''"
              >{{ props.data?.항목10 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목11</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목11 == null || props.data?.항목11 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목11 != null && props.data?.항목11 != ''"
              >{{ props.data?.항목11 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목12</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목12 == null || props.data?.항목12 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목12 != null && props.data?.항목12 != ''"
              >{{ props.data?.항목12 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목13</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목13 == null || props.data?.항목13 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목13 != null && props.data?.항목13 != ''"
              >{{ props.data?.항목13 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목14</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목14 == null || props.data?.항목14 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목14 != null && props.data?.항목14 != ''"
              >{{ props.data?.항목14 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목15</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목15 == null || props.data?.항목15 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목15 != null && props.data?.항목15 != ''"
              >{{ props.data?.항목15 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목16</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목16 == null || props.data?.항목16 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목16 != null && props.data?.항목16 != ''"
              >{{ props.data?.항목16 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목17</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목17 == null || props.data?.항목17 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목17 != null && props.data?.항목17 != ''"
              >{{ props.data?.항목17 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목18</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목18 == null || props.data?.항목18 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목18 != null && props.data?.항목18 != ''"
              >{{ props.data?.항목18 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목19</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목19 == null || props.data?.항목19 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목19 != null && props.data?.항목19 != ''"
              >{{ props.data?.항목19 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목20</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목20 == null || props.data?.항목20 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목20 != null && props.data?.항목20 != ''"
              >{{ props.data?.항목20 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목21</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목21 == null || props.data?.항목21 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목21 != null && props.data?.항목21 != ''"
              >{{ props.data?.항목21 }}</Table.Td
            >
          </Table.Tr>
          <Table.Tr>
            <Table.Td class="flex border-0 py-2"
              ><Lucide
                icon="CalendarClock"
                class="w-4 h-4 mr-2 text-slate-500"
              />
              항목22</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목22 == null || props.data?.항목22 == ''"
              >-</Table.Td
            >
            <Table.Td
              class="border-0 py-2"
              style="border-left-width: 2px"
              v-if="props.data?.항목22 != null && props.data?.항목22 != ''"
              >{{ props.data?.항목22 }}</Table.Td
            >
          </Table.Tr>
        </Table.Tbody>
      </div>
    </div>
  </div>
</template>
