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

// 모니터링 - KPI - 시간당생산량
export interface MonitorKPIProductHour {
  [attribute: string]: any | undefined;
  NO?: number;
  설비NO?: number;
  설비명?: string;
  총생산시간?: string;
  총생산수?: string;
  시간당생산수?: string;
  목표?: string;
}

// 모니터링 - KPI - 공정불량률
export interface MonitorKPIBadRate {
  [attribute: string]: any | undefined;
  NO?: number;
  공정NO?: number;
  공정명?: string;
  총생산수?: string;
  총불량수?: string;
  불량률?: string;
  목표?: string;
}

// 모니터링 - KPI - 설비가동률
export interface MonitorKPIFacilityRate {
  [attribute: string]: any | undefined;
  NO?: number;
  설비NO?: number;
  설비명?: string;
  총가동시간?: string;
  총비가동시간?: string;
  가동률?: string;
  목표?: string;
}

// 모니터링 - KPI - 설비종합효율(OEE)
export interface MonitorKPIOEE {
  [attribute: string]: any | undefined;
  NO?: number;
  설비NO?: number;
  설비명?: string;
  가동효율?: string;
  품질효율?: string;
  성능효율?: string;
  OEE?: string;
  목표?: string;
}
