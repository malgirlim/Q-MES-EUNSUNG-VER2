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
