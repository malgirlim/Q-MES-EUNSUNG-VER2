// 메인 - 설비상태
export interface MainFacilityStatus {
  [attribute: string]: any | undefined;
  NO?: number;
  설비1: string;
  설비2: string;
  설비3: string;
  설비4: string;
  설비5: string;
  설비6: string;
  설비7: string;
  설비8: string;
  설비9: string;
  설비10: string;
}

// 메인 - 공지사항
export interface MainNotice {
  [attribute: string]: any | undefined;
  NO?: number;
  구분?: string;
  제목?: string;
  내용?: string;
  비고?: string;
  등록자?: string;
  등록일시?: string;
}
