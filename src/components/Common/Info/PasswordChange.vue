<script setup lang="ts">
import { ref, Ref } from "vue";
import { FormInput, FormLabel } from "../../../base-components/Form";
const props = defineProps<{
  data?: any;
}>();

//등록창 에러검출 및 변수전달

//패스워드 정규식(문자,숫자,특문 포함한 8자이상)
const pw_reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const set_pw0 = ref();
const set_pw1 = ref();
const set_pw2 = ref();

let pass_flag = false;

const insert_check = () => {
  pass_flag = true;

  if (set_pw1.value != null && set_pw1.value != "") {
  } else {
    set_pw1.value = "";
    pass_flag = false;
  }

  if (set_pw2.value != null && set_pw2.value != "") {
  } else {
    set_pw2.value = "";
    pass_flag = false;
  }

  if (pw_reg.test(set_pw1.value) && pw_reg.test(set_pw2.value)) {
    //insertModalData.비밀번호 = set_pw1.value;
  } else {
    pass_flag = false;
  }

  if (set_pw1.value == set_pw2.value) {
    //insertModalData.비밀번호 = set_pw1.value;
  } else {
    pass_flag = false;
  }

  if (pass_flag == false) {
    return;
  }
};
</script>
<template>
  <div class="mt-3 text-left">
    <FormLabel>현재 비밀번호</FormLabel>
    <FormInput type="password" placeholder="" v-model="set_pw0" />
  </div>
  <div v-if="set_pw0 == ''" class="text-danger text-xs text-left mt-1">
    패스워드가 입력되지 않았습니다.
  </div>
  <div class="mt-3 text-left">
    <FormLabel>변경 비밀번호</FormLabel>
    <FormInput type="password" placeholder="" v-model="set_pw1" />
  </div>
  <div
    v-if="!pw_reg.test(set_pw1) && set_pw1 != null"
    class="text-danger text-xs text-left mt-1"
  >
    영문자, 숫자, 특수문자를 포함한 8자이상으로 구성되어야 합니다.
  </div>
  <div class="mt-3 text-left">
    <FormLabel>변경 비밀번호 확인</FormLabel>
    <FormInput type="password" placeholder="" v-model="set_pw2" />
  </div>
  <div
    v-if="set_pw1 == '' && set_pw2 == ''"
    class="text-danger text-xs text-left mt-1"
  >
    패스워드가 입력되지 않았습니다.
  </div>
  <div
    v-if="set_pw1 != set_pw2 && set_pw1 != '' && set_pw2 != ''"
    class="text-danger text-xs text-left mt-1"
  >
    패스워드가 일치하지 않습니다.
  </div>
</template>
