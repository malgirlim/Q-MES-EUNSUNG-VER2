<script setup>
import { ref } from "vue";
import { StreamBarcodeReader } from "vue-barcode-reader";

const decodedText = ref("");

const onLoaded = () => {
  console.log("loaded");
};

const onDecode = (text) => {
  decodedText.value = text;
};
</script>

<template>
  <StreamBarcodeReader
    @decode="onDecode"
    @loaded="onLoaded"
  ></StreamBarcodeReader>
  <div class="text-xl text-center">인식된 QR/barcode 코드</div>
  <div class="text-xl text-center">{{ decodedText }}</div>
</template>

<style scoped>
a {
  color: #42b983;
}
.information {
  margin-top: 100px;
}
</style>
