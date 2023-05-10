import { ref, Ref } from "@vue/reactivity";
import axios from "axios";
import { getCurrentInstance } from "vue";
import { usePagination } from "../components/Pagination/useClientSidePagination";
import { toast } from "vue3-toastify";

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
  const user = proxy.gstate.account.id; // 사용자 정보에서 이름 가져오기

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
    numberOfPages,
  };
}
