// 관리자정보 - 로그 관리
export interface KioskWork {
  [attribute: string]: any | undefined;
  NO?: number;
  지시공정NO: number;
  작업코드: string;
  품목구분: string;
  품번: string;
  품명: string;
  규격: string;
  단위: string;
  지시수량: string;
  공정: string;
  설비NO: number;
  설비명: string;
  작업자ID: string;
  작업자: string;
  시작일시: string;
  종료일시: string;
  생산수: string;
  불량수: string;
  특이사항: string;
  비고: string;
  등록자: string;
  등록일시: string;
}
