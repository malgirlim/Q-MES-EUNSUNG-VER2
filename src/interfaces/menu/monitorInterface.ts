// 모니터링 - 예방보전 현황
export interface MonitorPrevent {
  [attribute: string]: any | undefined;
  NO?: number;
  예방보전계획NO?: number;
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

// 모니터링 - 일상점검 현황
export interface MonitorDaily {
  [attribute: string]: any | undefined;
  NO?: number;
  일상점검계획NO?: number;
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

// 모니터링 - 설비수리 현황
export interface MonitorRepair {
  [attribute: string]: any | undefined;
  NO?: number;
  설비수리계획NO?: number;
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
  수리시간?: string;
  금액?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}
