<script setup lang="ts">
import { ref } from "vue";

const phone = ref("");

const submit = async () => {
  const res = await fetch("/api/sms/send", {
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
    alert("SMS 전송 완료");
  } else {
    alert("SMS 전송 실패");
  }
};
</script>

<template>
  <div class="text-xl">SMS전송</div>
  <div class="flex items-center">
    <input type="text" v-model="phone" />
    <div class="ml-5 p-3 border-2" v-on:click="submit">전송</div>
  </div>
</template>

<style scoped></style>
