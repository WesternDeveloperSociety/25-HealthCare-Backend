export const normalizeString = (v?: string | null) =>
  v?.trim().toLowerCase() ?? '';

export const normalizePhone = (v?: string | null) =>
  v?.replace(/\D/g, '') ?? ''; // digits only

export const normalizeDate = (v?: string | null) => {
  if (!v) return '';
  return new Date(v).toISOString().slice(0, 10); // YYYY-MM-DD
};

export const normalizeGender = (v?: string | null) =>
  v?.replace(/[_\s]/g, '').toLowerCase() ?? '';
