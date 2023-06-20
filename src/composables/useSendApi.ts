import { ref, Ref } from "@vue/reactivity";
import axios from "axios";
import { getCurrentInstance } from "vue";
import { usePagination } from "../components/Pagination/useClientSidePagination";
import { toast } from "vue3-toastify";

import {
  시스템_개발자,
  시스템_관리자,
  구매_관리자,
  구매_일반,
  영업_관리자,
  영업_일반,
  품질_관리자,
  품질_일반,
  생산_관리자,
  생산_일반,
} from "../composables/authData";
import router from "../router";

export function useSendApi<T>(
  url: string, // api 보낼 주소
  currentPage: Ref<number>, // 현재페이지
  rowsPerPage?: Ref<number> // 한 페이지에 나타낼 데이터 갯수
) {
  const datas: Ref<T[]> = ref([]); // 인터페이스 T 형식에 맞는 모든 데이터를 가져오지만 페이징으로 인해 나눠짐
  const dataAll: Ref<T[]> = ref([]); // 인터페이스 T 형식에 맞는 모든 데이터 등록\
  const dataSearchAll: Ref<T[]> = ref([]); // 인터페이스 T 형식에 맞는 조회조건 데이터 등록
  const datasAreLoading = ref(false); // 데이터를 가져오면서 로딩하고 있는지 확인하는 변수
  const dataCount = ref(0); // 가져온 데이터의 갯수

  const { proxy }: any = getCurrentInstance(); // 사용자 정보 가져오기
  let user = proxy.gstate.account.id; // 사용자 정보에서 이름 가져오기

  axios
    .get("/api/auth")
    .then((res: any) => {
      proxy.gstate.account = res.data;
      user = res.data.id;
      if (res.data.auth == "시스템개발자") proxy.gstate.level = 시스템_개발자;
      if (res.data.auth == "시스템관리자") proxy.gstate.level = 시스템_관리자;
      if (res.data.auth == "구매일반") proxy.gstate.level = 구매_일반;
      if (res.data.auth == "구매관리자") proxy.gstate.level = 구매_관리자;
      if (res.data.auth == "영업일반") proxy.gstate.level = 영업_일반;
      if (res.data.auth == "영업관리자") proxy.gstate.level = 영업_관리자;
      if (res.data.auth == "생산일반") proxy.gstate.level = 생산_일반;
      if (res.data.auth == "생산관리자") proxy.gstate.level = 생산_관리자;
      if (res.data.auth == "품질일반") proxy.gstate.level = 품질_일반;
      if (res.data.auth == "품질관리자") proxy.gstate.level = 품질_관리자;
    })
    .catch(() => {
      if (proxy.gstate.account.id == null) {
        router.push("/login");
      }
    });

  const noti = (data: any) => {
    Notification.requestPermission();
    new Notification("설비 알림", {
      body: data,
      image: "../assets/image/logo.png",
    });
  };

  // 페이지 첫 로딩 시 데이터 가져오기
  const loadDatas = async () => {
    datasAreLoading.value = true;
    try {
      await axios.get(url, { params: { user: user } }).then((res) => {
        datas.value = res.data;
        dataAll.value = res.data;
        dataSearchAll.value = res.data;
        dataCount.value = datas.value.length;
      });
    } catch (err: any) {
      console.log(err);
      if (proxy.gstate.debug.active == "on") {
        toast.error(
          "status : " +
            err.response.status +
            "\nstatusText : " +
            err.response.statusText +
            "\ndata : " +
            err.response.data,
          { autoClose: 2000 }
        );
      } else {
        toast.error(
          "현재 작업중인 페이지입니다.\n에러코드 : " + err.response.status
        );
      }
      // noti(err);
    } finally {
      datasAreLoading.value = false;
    }
  };

  // 조건 조회
  const searchDatas = async (
    searchDate: string,
    searchKey: string,
    searchInput: string,
    sortKey: string,
    sortOrder: string
  ) => {
    datasAreLoading.value = true;
    try {
      const startDate =
        searchDate == "전체기간"
          ? "000101"
          : searchDate.replace(/\//g, "").slice(0, 6);
      const endDate =
        searchDate == "전체기간"
          ? "990101"
          : searchDate.replace(/\//g, "").slice(-6);
      sortKey = sortKey == "등록일" || sortKey == "" ? "NO" : sortKey;
      sortOrder = sortOrder == "오름차순" ? "ASC" : "DESC";

      await axios
        .post(url, {
          startDate,
          endDate,
          searchKey,
          searchInput,
          sortKey,
          sortOrder,
          user,
        })
        .then((res) => {
          datas.value = res.data;
          dataSearchAll.value = res.data;
          dataCount.value = datas.value.length;
        });
    } catch (err: any) {
      console.log(err);
      if (proxy.gstate.debug.active == "on") {
        toast.error(
          "status : " +
            err.response.status +
            "\nstatusText : " +
            err.response.statusText +
            "\ndata : " +
            err.response.data,
          { autoClose: 2000 }
        );
      } else {
        toast.error(
          "에러가 발생하였습니다.\n에러코드 : " + err.response.status
        );
      }
      // noti(err);
    } finally {
      datasAreLoading.value = false;
    }
  };

  // 등록
  const insertData = async (data: T) => {
    try {
      await axios.post(url + "/insert", { data, user });
    } catch (err: any) {
      console.log(err);
      if (proxy.gstate.debug.active == "on") {
        toast.error(
          "status : " +
            err.response.status +
            "\nstatusText : " +
            err.response.statusText +
            "\ndata : " +
            err.response.data,
          { autoClose: 2000 }
        );
      } else {
        toast.error(
          "에러가 발생하였습니다.\n에러코드 : " + err.response.status
        );
      }
      // noti(err);
    }
  };

  // 수정
  const editData = async (data: T) => {
    try {
      await axios.post(url + "/edit", { data, user });
    } catch (err: any) {
      console.log(err);
      if (proxy.gstate.debug.active == "on") {
        toast.error(
          "status : " +
            err.response.status +
            "\nstatusText : " +
            err.response.statusText +
            "\ndata : " +
            err.response.data,
          { autoClose: 2000 }
        );
      } else {
        toast.error(
          "에러가 발생하였습니다.\n에러코드 : " + err.response.status
        );
      }
      // noti(err);
    }
  };

  // 삭제
  const deleteData = async (data: any) => {
    try {
      await axios.post(url + "/delete", { data, user });
    } catch (err: any) {
      console.log(err);
      if (proxy.gstate.debug.active == "on") {
        toast.error(
          "status : " +
            err.response.status +
            "\nstatusText : " +
            err.response.statusText +
            "\ndata : " +
            err.response.data,
          { autoClose: 2000 }
        );
      } else {
        toast.error(
          "에러가 발생하였습니다.\n에러코드 : " + err.response.status
        );
      }
      // noti(err);
    }
  };

  // 엑셀로 한번에 등록
  const insertAllData = async (data: any) => {
    try {
      await axios.post(url + "/insertAll", { data, user });
    } catch (err: any) {
      console.log(err);
      if (proxy.gstate.debug.active == "on") {
        toast.error(
          "status : " +
            err.response.status +
            "\nstatusText : " +
            err.response.statusText +
            "\ndata : " +
            err.response.data,
          { autoClose: 2000 }
        );
      } else {
        toast.error(
          "에러가 발생하였습니다.\n에러코드 : " + err.response.status
        );
      }
      // noti(err);
    }
  };

  // 이미지 또는 파일 저장
  const fileUploadName = ref(""); // 폴더에 업로드된 파일 이름을 가져오기 위한 변수
  const uploadFile = async (file: any) => {
    let formData = new FormData();
    await formData.append("file", file);
    try {
      await axios
        .post(url + "/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log("SUCCESS!!");
          fileUploadName.value = res.data; // 무사히 파일이 저장되면 업로드된 파일이름을 가져옴
        })
        .catch(function () {
          console.log("FAILURE!!");
        });
    } catch (err: any) {
      console.log(err);
      if (proxy.gstate.debug.active == "on") {
        toast.error(
          "status : " +
            err.response.status +
            "\nstatusText : " +
            err.response.statusText +
            "\ndata : " +
            err.response.data,
          { autoClose: 2000 }
        );
      } else {
        toast.error(
          "에러가 발생하였습니다.\n에러코드 : " + err.response.status
        );
      }
      // noti(err);
    }
  };

  // 페이징 기능
  const { paginatedArray, numberOfPages } = usePagination<T>({
    rowsPerPage,
    arrayToPaginate: datas,
    currentPage,
  });

  return {
    dataAll,
    dataSearchAll,
    datas: paginatedArray,
    dataCount,
    datasAreLoading,
    loadDatas,
    searchDatas,
    insertData,
    editData,
    deleteData,
    insertAllData,
    uploadFile,
    fileUploadName,
    numberOfPages,
  };
}
