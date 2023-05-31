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
