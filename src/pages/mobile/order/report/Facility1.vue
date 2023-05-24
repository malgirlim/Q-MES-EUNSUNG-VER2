<script setup lang="ts">
import { ref, onMounted } from "vue";
import router from "../../../../router";
import Button from "../../../../base-components/Button";
import Lucide from "../../../../base-components/Lucide";

// 페이지 로딩 시 시작
onMounted(async () => {
  setTimeout(() => {
    menu_fix.value = ".";
  }, 500);
});

// 메뉴재정렬 (메뉴 레이아웃 밀리는 문제 해결 코드)
const menu_fix = ref();

</script>
    <template>
        <div class="p-5 intro-y">
            <div class="flex">
                <div class="mr-auto">
            <Button class="text-white" variant="success" @click=""><Lucide class="w-4 h-4 mb-0.5 mr-1" icon="Scroll"/>작업지시목록</Button></div>
            <div><Button variant="dark" @click="$router.push('/mobile/order/task-report')"><Lucide class="w-4 h-4 mb-0.5 mr-1" icon="Home"/>설비 선택</Button></div>
                </div>
<div class="flex h-64 text-center items-center"><div class="flex mx-auto text-2xl font-bold">공정정보 실적입력 소요자재 불량사유 비가동사유</div></div>
                <div class="flex mt-5">
                <div class="flex mx-auto">
                    <div class="mr-10">
            <Button class="text-white w-24" variant="pending" @click="">작업중지</Button></div>
            <div><Button class="w-24" variant="facebook" @click="">작업완료</Button></div>
                </div></div>
    </div>

  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mt-5 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved{{ menu_fix }}</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->
</template>