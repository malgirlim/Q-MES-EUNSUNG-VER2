<script setup lang="ts">
import { ref } from "vue";
const phone = ref("");

const submit = async () => {
  const res = await fetch("/api/kakao/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: phone.value,
    }),
  });
  const data = await res.json();
  if (data.result === "success") {
    alert("카톡 전송 완료");
  } else {
    alert("카톡 전송 실패");
  }
};
</script>

<template>
  <div class="text-xl">알림톡 전송</div>
  <div class="flex items-center">
    <input type="text" v-model="phone" />
    <div class="ml-5 p-3 border-2" v-on:click="submit">전송</div>
  </div>
</template>

<style scoped></style>
