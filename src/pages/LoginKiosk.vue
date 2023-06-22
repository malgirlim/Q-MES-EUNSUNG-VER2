<script setup lang="ts">
import { ref } from "vue";
import logoUrl from "../assets/images/logo.png";
import illustrationUrl from "../assets/images/illustration.png";
import { FormInput, FormCheck } from "../base-components/Form";
import Button from "../base-components/Button";
import { toast } from "vue3-toastify";
import Lucide from "../base-components/Lucide";

import { reactive } from "vue";
import axios from "axios";
import router from "../router";

const state = reactive({
  account: {
    id: null,
    part: "",
    rank: "",
    name: "",
  },
  form: {
    loginId: "kiosk",
    loginPw: "",
  },
});

const submit = (pin: any) => {
  const args = {
    loginId: state.form.loginId,
    loginPw: pin,
  };

  axios
    .post("/api/auth", args)
    .then((res: any) => {
      state.account = res.data;
      toast.success(
        "안녕하세요" +
          " " +
          state.account.name +
          " " +
          state.account.rank +
          "님.\n" +
          "좋은 하루 되세요.",
        { autoClose: 3000 }
      );
      router.push("/kiosk");
    })
    .catch(() => {
      toast.error(
        "PIN이 올바르지 않습니다. \n 입력하신 내용을 다시 확인해주세요."
      );
    });
};

axios.get("/api/auth").then((res: any) => {
  state.account = res.data;
  if (state.account.id != null) {
    router.push("/kiosk");
  }
});

// PIN 전달부분

const pin = ref("");
const pin_block = ref("");

const insert_pin = (numpad_value: any) => {
  if (pin.value.length < 4) {
    pin.value = pin.value + numpad_value;
    pin_block.value = pin_block.value + "● ";
  }
  if (pin.value.length == 4) {
    setTimeout(() => {
      submit(pin.value);
      reset_pin();
    }, 75);
  }
};

const reset_pin = () => {
  pin.value = "";
  pin_block.value = "";
};

const delete_pin = () => {
  pin.value = pin.value.slice(0, -1);
  pin_block.value = pin_block.value.slice(0, -2);
};
</script>

<template>
  <div class="bg-[#3a437c]">
    <div class="p-4 intro-y">
      <div>
        <img class="m-auto mb-3 h-12" src="../assets/images/kiosk_logo.svg" />
      </div>
      <div class="text-xl text-center text-slate-200 mt-2">
        <strong>은성프린터스 현장 시스템</strong>
      </div>
      <div>
        <div class="px-2 pt-2 mt-3">
          <div class="mb-2 text-base box p-2 w-4/5 m-auto">
            <div class="text-2xl text-slate-500 text-center text-black mt-3">
              <strong>로그인 PIN 입력</strong>
            </div>

            <div
              class="text-center text-4xl mt-3 mb-5 border-2 w-2/5 h-16 m-auto"
            >
              <div class="mt-2">{{ pin_block }}</div>
            </div>

            <div class="w-3/5 m-auto">
              <div class="flex mt-3">
                <Button
                  class="m-auto mr-5 text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('1')"
                  >1</Button
                >
                <Button
                  class="m-auto mr-5 text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('2')"
                  >2</Button
                >
                <Button
                  class="m-auto text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('3')"
                  >3</Button
                >
              </div>
              <div class="flex mt-3">
                <Button
                  class="m-auto mr-5 text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('4')"
                  >4</Button
                >
                <Button
                  class="m-auto mr-5 text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('5')"
                  >5</Button
                >
                <Button
                  class="m-auto text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('6')"
                  >6</Button
                >
              </div>
              <div class="flex mt-3">
                <Button
                  class="m-auto mr-5 text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('7')"
                  >7</Button
                >
                <Button
                  class="m-auto mr-5 text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('8')"
                  >8</Button
                >
                <Button
                  class="m-auto text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('9')"
                  >9</Button
                >
              </div>
              <div class="flex mt-3 mb-10">
                <Button
                  class="m-auto mr-5 text-4xl"
                  style="width: 140px; height: 65px"
                  @click="reset_pin()"
                  ><Lucide
                    icon="RotateCcw"
                    class="w-12 h-12 mx-auto text-danger"
                /></Button>
                <Button
                  class="m-auto mr-5 text-4xl"
                  style="width: 140px; height: 65px"
                  @click="insert_pin('0')"
                  >0</Button
                >
                <Button
                  class="m-auto text-4xl"
                  style="width: 140px; height: 65px"
                  @click="delete_pin()"
                >
                  <Lucide icon="Delete" class="w-14 h-14 mx-auto text-info"
                /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- BEGIN: FOOTER(COPYRIGHT) -->
    <div class="intro-y -mt-3 text-slate-200" style="text-align: center">
      <footer>&copy;2023 QInnotek. All rights reserved.</footer>
    </div>
    <!-- END: FOOTER(COPYRIGHT) -->
  </div>
</template>
