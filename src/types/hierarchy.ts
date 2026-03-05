export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message: string;
}

export interface Modulo {
  id: number;
  nombre: string;
  descripcion: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Lote {
  id: number;
  modulo_id: number;
  identificador: string;
  descripcion: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Surco {
  id: number;
  lote_id: number;
  numero: number;
  descripcion: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Prediccion {
  id: number;
  surco_id: number;
  usuario_id: number;
  imagen_url: string;
  fase1_resumen: {
    has_matches: boolean;
    total_detecciones: number;
    clases_detectadas: string[];
  };
  fase1_payload: Record<string, unknown>;
  fase2_resumen: {
    clase_predicha: string;
    confianza: number;
  };
  fase2_payload: Record<string, unknown>;
  fecha: string;
  created_at: string | null;
  updated_at: string | null;
}
