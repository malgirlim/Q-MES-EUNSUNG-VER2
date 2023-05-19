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
