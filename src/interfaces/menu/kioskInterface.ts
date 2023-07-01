// 키오스크 - 작업관리
export interface KioskWork {
  [attribute: string]: any | undefined;
  NO?: number;
  지시공정NO: number;
  작업코드: string;
  품목구분: string;
  품번: string;
  품명: string;
  규격: string;
  단위: string;
  지시수량: string;
  완료수량: string;
  시작일: string;
  공정명: string;
  설비NO: number;
  설비명: string;
  작업자ID: string;
  작업자: string;
  진행상황: string;
  시작일시: string;
  생산수: string;
  불량수: string;
  비가동시간: string;
  특이사항: string;
  설비현황: string;
  비고: string;
  등록자: string;
  등록일시: string;
}

// 키오스크 - 투입자재관리
export interface KioskItem {
  [attribute: string]: any | undefined;
  NO?: number;
  작업NO: number;
  품목NO: number;
  LOT코드: string;
  품목구분: string;
  품명: string;
  규격: string;
  단위: string;
  수량: string;
  비고: string;
  등록자: string;
  등록일시: string;
}

// 키오스크 - 불량관리
export interface KioskDefect {
  [attribute: string]: any | undefined;
  NO?: number;
  작업NO: number;
  불량NO: number;
  불량코드: string;
  구분: string;
  불량명: string;
  내용: string;
  수량: string;
  비고: string;
  등록자: string;
  등록일시: string;
}

// 키오스크 - 비가동관리
export interface KioskNonwork {
  [attribute: string]: any | undefined;
  NO?: number;
  작업NO: number;
  비가동NO: number;
  비가동코드: string;
  구분: string;
  비가동명: string;
  내용: string;
  시작일시: string;
  종료일시: string;
  비고: string;
  등록자: string;
  등록일시: string;
}
