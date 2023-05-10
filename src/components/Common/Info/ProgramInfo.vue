<script setup lang="ts">
import { ref } from "vue";
import Button from "../../../base-components/Button";

let page = ref("program");

const page_change = (value: string) => {
  page.value = value;
};
</script>
<template>
  <div>
    <iframe
      class="w-full"
      style="height: 90px"
      src="https://qmes.co.kr/version/eunsung_version.html"
    ></iframe>
    <div v-if="page == 'program'">
      <Button
        class="mr-5"
        as="a"
        variant="primary"
        @click="page_change('program')"
        >프로그램</Button
      ><Button as="a" variant="outline-primary" @click="page_change('db')"
        >데이터베이스</Button
      >
    </div>
    <div v-if="page == 'db'">
      <Button
        class="mr-5"
        as="a"
        variant="outline-primary"
        @click="page_change('program')"
        >프로그램</Button
      ><Button as="a" variant="primary" @click="page_change('db')"
        >데이터베이스</Button
      >
    </div>
    <div v-if="page == 'program'">
      <iframe
        class="w-full"
        style="height: 250px"
        src="https://qmes.co.kr/version/eunsung.html"
      ></iframe>
    </div>
    <div v-if="page == 'db'">
      <iframe
        class="w-full"
        style="height: 250px"
        src="https://qmes.co.kr/version/eunsung_db.html"
      ></iframe>
    </div>
  </div>
  <div class="mt-8 text-slate-500" style="font-size: 13px">
    Q-MES Copyright 2023 QInnotek. All rights reserved.
  </div>
  <div class="mt-3 text-slate-500" style="font-size: 13px">
    Q-MES는 여러 오픈소스 소프트웨어를 기반으로 제작된 프로그램입니다.
  </div>
</template>
