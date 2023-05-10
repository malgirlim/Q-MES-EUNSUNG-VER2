// 품질관리 - 수입검사
export interface QualityIncoming {
  [attribute: string]: any | undefined;
  NO?: number;
  발주NO?: number;
  발주코드?: string;
  발주품번?: string;
  발주품명?: string;
  발주수량?: string;
  품질기준이미지?: string;
  품질기준1?: string;
  품질기준2?: string;
  품질기준3?: string;
  품질기준4?: string;
  품질기준5?: string;
  품질기준6?: string;
  품질기준7?: string;
  품질기준8?: string;
  품질기준9?: string;
  품질기준10?: string;
  구분?: string;
  샘플수량?: string;
  입고수량?: string;
  결과?: string;
  내용1?: string;
  내용2?: string;
  내용3?: string;
  내용4?: string;
  내용5?: string;
  내용6?: string;
  내용7?: string;
  내용8?: string;
  내용9?: string;
  내용10?: string;
  전달사항?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 품질관리 - 공정검사
export interface QualityProcess {
  [attribute: string]: any | undefined;
  NO?: number;
  생산실적NO?: number;
  작업코드?: string;
  공정?: string;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  특이사항?: string;
  구분?: string;
  샘플수량?: string;
  입고수량?: string;
  결과?: string;
  내용1?: string;
  내용2?: string;
  내용3?: string;
  내용4?: string;
  내용5?: string;
  내용6?: string;
  내용7?: string;
  내용8?: string;
  내용9?: string;
  내용10?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}
