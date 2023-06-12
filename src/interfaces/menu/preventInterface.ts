// 예방보전 - 예방보전 관리
export interface PreventPrevent {
  [attribute: string]: any | undefined;
  NO?: number;
  설비NO?: number;
  설비명?: string;
  구분?: string;
  내용?: string;
  검사방법?: string;
  기준?: string;
  단위?: string;
  최소?: string;
  최대?: string;
  계획일?: string;
  예보일?: string;
  담당자ID?: string;
  담당자?: string;
  결과내용?: string;
  결과?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 예방보전 - 일상점검 관리
export interface PreventDaily {
  [attribute: string]: any | undefined;
  NO?: number;
  설비NO?: number;
  설비명?: string;
  구분?: string;
  내용?: string;
  검사방법?: string;
  기준?: string;
  단위?: string;
  최소?: string;
  최대?: string;
  담당자ID?: string;
  담당자?: string;
  결과내용?: string;
  결과?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 예방보전 - 일상점검 확인리스트
export interface PreventDailyCheck {
  [attribute: string]: any | undefined;
  NO?: number;
  설비NO?: number;
  설비명?: string;
  점검수?: string;
  점검확인수?: string;
  점검현황?: string;
}

// 예방보전 - 설비수리 관리
export interface PreventRepair {
  [attribute: string]: any | undefined;
  NO?: number;
  설비NO?: number;
  설비명?: string;
  구분?: string;
  내용?: string;
  수리방법?: string;
  기준?: string;
  계획일?: string;
  예보일?: string;
  담당자ID?: string;
  담당자?: string;
  결과내용?: string;
  결과?: string;
  금액?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 예방보전 - 설비부품수명 관리
export interface PreventLife {
  [attribute: string]: any | undefined;
  NO?: number;
  설비NO?: number;
  설비명?: string;
  설비부품NO?: number;
  품번?: number;
  품목구분?: number;
  품명?: number;
  규격?: number;
  단위?: number;
  계획사용횟수?: string;
  계획교체일?: string;
  교체확인?: string;
  담당자ID?: string;
  담당자?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}
