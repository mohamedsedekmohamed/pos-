// ── Pagination ──
export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

// ── Localization ──
export interface LocalizedString {
  ar: string;
  en: string;
}
