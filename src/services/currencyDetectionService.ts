export interface CurrencyDetectionResult {
  success: boolean;
  nominal: string | null;
  nominal_detected: boolean;
  confidence: number;
  authenticity: string;
  is_authentic: boolean;
  blob_count: number;
}

export async function detectCurrency(
  file: File
): Promise<CurrencyDetectionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/detect-currency", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Gagal mendeteksi uang");
  }

  return response.json();
}