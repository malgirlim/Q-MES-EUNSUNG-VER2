// 관리자정보 - 로그 관리
export interface InfoLog {
  [attribute: string]: any | undefined;
  NO?: number;
  타입?: string;
  메뉴?: string;
  내용?: string;
  데이터사용량?: string;
  등록자?: string;
  등록일시?: string;
}

// 공유정보 - 공지사항 관리
export interface ShareNotice {
  [attribute: string]: any | undefined;
  NO?: number;
  구분?: string;
  제목?: string;
  내용?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 알림 - 알림 설정 관리
export interface AlertSetting {
  [attribute: string]: any | undefined;
  NO?: number;
  구분?: string;
  설비NO?: number;
  설비명?: string;
  기능사용?: string;
  발송시간?: string;
  발송시점?: number;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 알림 - 알림 대상 관리
export interface AlertUser {
  [attribute: string]: any | undefined;
  NO?: number;
  알림설정NO?: number;
  사용자ID?: string;
  이름?: string;
  연락처?: string;
  부서명?: string;
  직책?: string;
  직급?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}

// 알림 - 알림 로그 관리
export interface AlertLog {
  [attribute: string]: any | undefined;
  NO?: number;
  구분?: string;
  제목?: string;
  내용?: string;
  확인?: string;
  등록자?: string;
  등록일시?: string;
}

// 알림 - 예보 통보 관리
export interface ForecastNotify {
  [attribute: string]: any | undefined;
  NO?: number;
  참조NO?: number;
  구분?: string;
  내용?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}
