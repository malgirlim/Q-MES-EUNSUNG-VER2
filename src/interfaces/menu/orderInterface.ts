// 주문관리 - 수주 관리
export interface OrderAccept {
  [attribute: string]: any | undefined;
  NO?: number;
  수주일?: string;
  코드?: string;
  코드순번?: string;
  구분?: string;
  거래처NO?: number;
  거래처명?: string;
  연락처?: string;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  수량?: string;
  단가?: string;
  공급가액?: string;
  세액?: string;
  결제조건?: string;
  결제예정일?: string;
  납기일?: string;
  도착지주소?: string;
  기타?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 주문관리 - 발주 관리
export interface OrderOrder {
  [attribute: string]: any | undefined;
  NO?: number;
  수주NO?: number;
  수주코드?: string;
  발주코드?: string;
  발주구분?: string;
  발주일자?: string;
  거래처NO?: number;
  거래처명?: string;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  발주수량?: string;
  입고수량?: string;
  단가?: string;
  공급가액?: string;
  세액?: string;
  납기일?: string;
  도착지주소?: string;
  기타?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 주문관리 - 설비부품발주 관리
export interface OrderFacilityPart {
  [attribute: string]: any | undefined;
  NO?: number;
  발주코드?: string;
  발주구분?: string;
  발주일자?: string;
  거래처NO?: number;
  거래처명?: string;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  발주수량?: string;
  단가?: string;
  공급가액?: string;
  세액?: string;
  납기일?: string;
  도착지주소?: string;
  기타?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 주문관리 - 납품 관리
export interface OrderDelivery {
  [attribute: string]: any | undefined;
  NO?: number;
  구분?: string;
  수주NO?: number;
  품목NO?: number;
  품목구분?: string;
  품번?: string;
  품명?: string;
  규격?: string;
  단위?: string;
  LOT코드?: string;
  수량?: string;
  일시?: string;
  검사결과?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}
