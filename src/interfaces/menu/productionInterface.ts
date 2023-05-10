// 생산관리 - 생산계획
export interface ProductionPlan {
  [attribute: string]: any | undefined;
  NO?: number;
  수주NO?: number;
  수주코드?: string;
  수주코드순번?: string;
  품목구분?: string;
  품번?: string;
  품명?: string;
  수주수량?: string;
  계획수량?: string;
  계획시작일?: string;
  계획종료일?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 생산관리 - 작업지시
export interface ProductionTask {
  [attribute: string]: any | undefined;
  NO?: number;
  코드?: string;
  생산계획NO?: number;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  수량?: string;
  시작일?: string;
  진행률?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 생산관리 - 작업지시공정
export interface ProductionTaskProcess {
  [attribute: string]: any | undefined;
  NO?: number;
  작업지시NO?: number;
  공정NO?: number;
  공정명?: string;
  설비NO?: number;
  설비명?: string;
  작업자ID?: string;
  작업자?: string;
  품목NO?: number;
  품번?: string;
  구분?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  수량?: string;
  진행상황?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 생산관리 - 작업지시공정자재
export interface ProductionTaskProcessItem {
  [attribute: string]: any | undefined;
  NO?: number;
  작업지시공정NO?: number;
  품목입고NO?: number;
  입고코드?: string;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  수량?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 생산관리 - 작업현황
export interface ProductionTaskCurrent {
  [attribute: string]: any | undefined;
  NO?: number;
  작업지시NO?: number;
  작업코드?: string;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  지시수량?: string;
  생산양품수량?: string;
  시작일?: string;
  공정NO?: number;
  공정명?: string;
  설비NO?: number;
  설비명?: string;
  작업자ID?: string;
  작업자?: string;
  진행상황?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 생산관리 - 생산실적집계
export interface ProductionResult {
  [attribute: string]: any | undefined;
  NO?: number;
  지시공정NO?: number;
  작업코드?: string;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  지시수량?: string;
  공정?: string;
  시작일?: string;
  설비NO?: number;
  설비명?: string;
  작업자ID?: string;
  작업자?: string;
  시작일시?: string;
  종료일시?: string;
  생산수?: string;
  불량수?: string;
  특이사항?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 생산관리 - 생산실적사용품목
export interface ProductionResultUseItem {
  [attribute: string]: any | undefined;
  NO?: number;
  생산실적NO?: number;
  품목재공NO?: number;
  코드?: string;
  구분?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  수량?: string;
  사용일시?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 생산관리 - 생산실적불량
export interface ProductionResultDefect {
  [attribute: string]: any | undefined;
  NO?: number;
  생산실적NO?: number;
  불량NO?: number;
  불량코드?: string;
  구분?: string;
  불량명?: string;
  수량?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 생산관리 - 생산실적비가동
export interface ProductionResultNonWork {
  [attribute: string]: any | undefined;
  NO?: number;
  생산실적NO?: number;
  비가동NO?: number;
  비가동코드?: string;
  구분?: string;
  비가동명?: string;
  내용?: string;
  시작일시?: string;
  종료일시?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}
