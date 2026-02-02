/**
 * ERP field definitions for Comarch Optima PZ import.
 */

export type ErpField = "symbol" | "ilosc" | "cenaJedn";

export const ERP_FIELDS: { id: ErpField; label: string; required: boolean }[] = [
  { id: "symbol", label: "Symbol (SKU)", required: true },
  { id: "ilosc", label: "Ilość", required: true },
  { id: "cenaJedn", label: "Cena jedn.", required: true },
];

export const REQUIRED_FIELDS: ErpField[] = ["symbol", "ilosc", "cenaJedn"];

export function isRequiredField(field: ErpField): boolean {
  return REQUIRED_FIELDS.includes(field);
}
