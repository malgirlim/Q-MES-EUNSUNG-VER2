<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.PreventLifePlan; //권한레벨

const kakaoSendData = ref({
  수신번호: "",
  설비명: "",
  날짜: "",
  시간: "",
  부서: "",
  이름: "",
  직책: "",
  연락처: "",
});

const submit = async () => {
  const res = await fetch("/q-api/kakao/template1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kakaoSendData.value),
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
    <label>수신번호</label>
    <input type="text" v-model="kakaoSendData.수신번호" /> <br />
    <label>설비명</label>
    <input type="text" v-model="kakaoSendData.설비명" /><br />
    <label>날짜</label>
    <input type="text" v-model="kakaoSendData.날짜" /><br />
    <label>시간</label>
    <input type="text" v-model="kakaoSendData.시간" /><br />
    <label>부서</label>
    <input type="text" v-model="kakaoSendData.부서" /><br />
    <label>이름</label>
    <input type="text" v-model="kakaoSendData.이름" /><br />
    <label>직책</label>
    <input type="text" v-model="kakaoSendData.직책" /><br />
    <label>연락처</label>
    <input type="text" v-model="kakaoSendData.연락처" /><br />

    <div class="ml-5 p-3 border-2" v-on:click="submit">전송</div>
  </div>
</template>

<style scoped></style>
