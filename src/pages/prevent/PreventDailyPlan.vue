<script setup lang="ts">
import { FormInput, FormSelect, FormCheck } from "../../base-components/Form";
import axios from "axios";

////////////////////////////////////// 파일 업로드
let file = "";

const submitFile = () => {
  let formData = new FormData();
  formData.append("file", file);

  axios
    .post("/q-api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(function () {
      console.log("SUCCESS!!");
    })
    .catch(function () {
      console.log("FAILURE!!");
    });
};

const handleFileUpload = (event: any) => {
  file = event.target.files[0];
};
</script>
<template>
  <div class="text-xl">ALTERYX 테스트</div>

  <div class="mt-3">
    <FormLabel htmlFor="vertical-form-11">업로드</FormLabel>
    <FormInput
      id="vertical-form-11"
      type="file"
      placeholder=""
      @change="handleFileUpload($event)"
    />
  </div>
</template>
