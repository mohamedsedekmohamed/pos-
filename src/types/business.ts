export interface BusinessSetup {
  id?: number;
  name?: string | null;
  phone?: string | null;
  face?: string | null;
  instagram?: string | null;
  whats?: string | null;
  logo?: string | null;
  raw_logo?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BusinessSetupResponse {
  status: boolean;
  data: BusinessSetup | null;
}
