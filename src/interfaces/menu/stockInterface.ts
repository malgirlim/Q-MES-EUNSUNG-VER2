// 재고 관리 - 품목 입고 등록
export interface StockItemReceive {
  [attribute: string]: any | undefined;
  NO?: number;
  생산실적NO?: number;
  공정검사NO?: number;
  불량재작업NO?: number;
  수입검사NO?: number;
  품목NO?: number;
  구분?: string;
  입고일시?: string;
  입고코드?: string;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  입고수?: string;
  유효일자?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 재고 관리 - 품목 재공 등록
export interface StockItemProcess {
  [attribute: string]: any | undefined;
  NO?: number;
  구분?: string;
  작업지시공정NO?: number;
  작업코드?: string;
  공정?: string;
  품목NO?: number;
  LOT코드?: string;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  수량?: string;
  불출일시?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 재고 관리 - 품목 출고 등록
export interface StockItemRelease {
  [attribute: string]: any | undefined;
  NO?: number;
  구분?: string;
  생산실적NO?: number;
  작업지시공정NO?: number;
  작업코드?: string;
  공정?: string;
  품목NO?: number;
  LOT코드?: string;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  수량?: string;
  사용일시?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 재고 관리 - 품목 재공현황
export interface StockProcess {
  [attribute: string]: any | undefined;
  NO?: number;
  작업지시공정NO?: number;
  작업코드?: string;
  공정?: string;
  LOT코드?: string;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  불출수?: string;
  사용수?: string;
  재공수?: string;
}

// 재고 관리 - 재고현황
export interface StockStock {
  [attribute: string]: any | undefined;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  기초재공재고?: string;
  기초재고?: string;
  입고?: string;
  재공?: string;
  사용?: string;
  기말재공재고?: string;
  기말재고?: string;
  안전재고?: string;
}
