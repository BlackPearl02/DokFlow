/**
 * ERP field definitions for Subiekt GT and Comarch Optima PZ import.
 * MVP: shared column set; output CSV headers match typical PZ import templates.
 */

export type ErpField = "symbol" | "nazwa" | "ilosc" | "cenaJedn" | "vat" | "waluta";

export const ERP_FIELDS: { id: ErpField; label: string; required: boolean }[] = [
  { id: "symbol", label: "Symbol (SKU)", required: true },
  { id: "nazwa", label: "Nazwa", required: false },
  { id: "ilosc", label: "Ilość", required: true },
  { id: "cenaJedn", label: "Cena jedn.", required: true },
  { id: "vat", label: "VAT", required: false },
  { id: "waluta", label: "Waluta", required: false },
];

/** Output CSV column headers (Polish ERP typical). */
export const CSV_HEADERS: Record<ErpField, string> = {
  symbol: "Symbol",
  nazwa: "Nazwa",
  ilosc: "Ilość",
  cenaJedn: "Cena_jedn",
  vat: "VAT",
  waluta: "Waluta",
};

export type TargetErp = "subiekt" | "optima";

export const REQUIRED_FIELDS: ErpField[] = ["symbol", "ilosc", "cenaJedn"];

export function isRequiredField(field: ErpField): boolean {
  return REQUIRED_FIELDS.includes(field);
}
