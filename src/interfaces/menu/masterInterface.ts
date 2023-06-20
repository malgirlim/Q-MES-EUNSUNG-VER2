// 기준정보 - 사용자 관리
export interface MasterUser {
  [attribute: string]: any | undefined;
  아이디?: string;
  비밀번호?: string;
  이름?: string;
  연락처?: string;
  이메일?: string;
  부서명?: string;
  직책?: string;
  직급?: string;
  권한?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 거래처 관리
export interface MasterClient {
  [attribute: string]: any | undefined;
  NO?: number;
  코드?: string;
  구분?: string;
  거래처명?: string;
  사업자번호?: string;
  주소?: string;
  전화번호?: string;
  휴대폰번호?: string;
  팩스?: string;
  이메일?: string;
  담당자?: string;
  사업자등록증?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 품목 관리
export interface MasterProduct {
  [attribute: string]: any | undefined;
  NO?: number;
  거래처NO?: number;
  거래처명?: string;
  구분?: string;
  품번?: string;
  품명?: string;
  차종?: string;
  규격?: string;
  단위?: string;
  안전재고?: string;
  단가?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - BOM 관리 (우측화면)
export interface MasterBom {
  [attribute: string]: any | undefined;
  NO?: number;
  품목NO?: number; // MasterProduct 기본키
  투입자재NO?: number;
  투입자재구분?: string;
  투입자재품번?: string;
  투입자재품명?: string;
  투입자재규격?: string;
  투입자재단위?: string;
  투입량?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 설비 관리
export interface MasterFacility {
  [attribute: string]: any | undefined;
  NO?: number;
  설비명?: string;
  라인?: string;
  규격?: string;
  거래처NO?: number;
  거래처명?: string;
  구입일?: string;
  금액?: string;
  장소?: string;
  사진?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 공정 관리
export interface MasterProcess {
  [attribute: string]: any | undefined;
  NO?: number;
  코드?: string;
  구분?: string;
  공정명?: string;
  내용?: string;
  설비?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 불량내용코드 관리
export interface MasterDefect {
  [attribute: string]: any | undefined;
  NO?: number;
  코드?: string;
  구분?: string;
  불량명?: string;
  내용?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 비가동내용코드 관리
export interface MasterNonWork {
  [attribute: string]: any | undefined;
  NO?: number;
  코드?: string;
  구분?: string;
  비가동명?: string;
  내용?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 설비부품 관리
export interface MasterFacilityPart {
  [attribute: string]: any | undefined;
  NO?: number;
  거래처NO?: number;
  거래처명?: string;
  설비NO?: number;
  설비명?: string;
  구분?: string;
  품번?: string;
  품명?: string;
  차종?: string;
  규격?: string;
  단위?: string;
  안전재고?: string;
  단가?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 품질기준정보 관리
export interface MasterQualityStand {
  [attribute: string]: any | undefined;
  NO?: number;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  이미지?: string;
  구분?: string;
  기준1?: string;
  기준2?: string;
  기준3?: string;
  기준4?: string;
  기준5?: string;
  기준6?: string;
  기준7?: string;
  기준8?: string;
  기준9?: string;
  기준10?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 설비기준정보 관리
export interface MasterFacilityStand {
  [attribute: string]: any | undefined;
  NO?: number;
  설비NO?: number;
  설비명?: string;
  구분?: string;
  내용?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 재고기준정보 관리
export interface MasterStockStand {
  [attribute: string]: any | undefined;
  NO?: number;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  구분?: string;
  내용?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 기준정보 - 레시피 관리
export interface MasterRecipe {
  [attribute: string]: any | undefined;
  NO?: number;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  사진?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

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
