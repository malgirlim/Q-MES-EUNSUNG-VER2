// 기준정보 - 금형 관리
export interface MasterMold {
  [attribute: string]: any | undefined;
  NO?: number;
  코드?: string;
  취득구분?: string;
  공정구분?: string;
  금형명?: string;
  등급?: string;
  규격?: string;
  공정NO: number;
  공정명: string;
  제작사?: string;
  가격?: string;
  취득일자?: string;
  교체수명일?: string;
  보관장소?: string;
  사진?: string;
  사용여부?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 금형 생산품목 관리
export interface MasterMoldItem {
  [attribute: string]: any | undefined;
  NO?: number;
  금형NO?: number;
  품목NO?: number;
  품번?: string;
  품목구분?: string;
  품명?: string;
  규격?: string;
  CAVITY?: string;
  동시여부?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 금형 점검 관리
export interface MasterMoldInspect {
  [attribute: string]: any | undefined;
  NO?: number;
  금형NO?: number;
  금형코드?: string;
  금형명?: string;
  구분?: string;
  내용?: string;
  검사방법?: string;
  기준?: string;
  단위?: string;
  최소?: string;
  최대?: string;
  담당자ID?: string;
  담당자?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 금형관리 - 금형 사용 관리
export interface MoldUse {
  [attribute: string]: any | undefined;
  NO?: number;
  금형NO?: number;
  금형코드?: string;
  금형명?: string;
  생산실적NO?: number;
  작업코드?: string;
  품번?: string;
  품목구분?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  생산수?: string;
  불량수?: string;
  사용횟수?: string;
  사용일자?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 금형관리 - 금형 수선 관리
export interface MoldRepair {
  [attribute: string]: any | undefined;
  NO?: number;
  금형NO?: number;
  금형코드?: string;
  금형명?: string;
  구분?: string;
  내용?: string;
  결과?: string;
  일자?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 금형관리 - 금형 점검내역 관리
export interface MoldCheck {
  [attribute: string]: any | undefined;
  NO?: number;
  금형점검NO?: number;
  금형코드?: string;
  금형명?: string;
  점검구분?: string;
  점검내용?: string;
  검사방법?: string;
  검사기준?: string;
  검사단위?: string;
  기준최소?: string;
  기준최대?: string;
  담당자?: string;
  구분?: string;
  내용?: string;
  결과?: string;
  일자?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}
