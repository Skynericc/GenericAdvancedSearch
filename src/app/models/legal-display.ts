const ARABIC_OPTION_LABELS: Record<string, Record<string, string>> = {
  document_type: {
    arrete: 'قرار',
    bulletin_officiel: 'الجريدة الرسمية',
    decret: 'مرسوم',
    dahir: 'ظهير',
    loi: 'قانون',
    marsoum: 'مرسوم',
    '9anoun': 'قانون',
  },
  subjects: {
    agriculture: 'الفلاحة',
    education: 'التعليم',
    elections: 'الانتخابات',
    energy_water: 'الطاقة والماء',
    finance: 'المالية',
    labor: 'الشغل',
    public_health: 'الصحة العامة',
    transport: 'النقل',
  },
};

const ARABIC_FIELD_LABELS: Record<string, string> = {
  document_type: 'نوع الوثيقة',
  file_name: 'اسم الملف',
  law_number: 'رقم القانون',
  promulgation_date: 'تاريخ الإصدار',
  publication_date: 'تاريخ النشر',
  signatures: 'التوقيعات',
  subjects: 'الموضوعات',
  source_file: 'الملف المصدر',
  source_page: 'الصفحة المصدر',
  title: 'المسمى الوظيفي',
  organization: 'المؤسسة',
  ministry: 'الوزارة',
  region: 'الجهة',
  city: 'المدينة',
  contract_type: 'نوع العقد',
  employment_type: 'نوع التوظيف',
  education_level: 'المستوى الدراسي',
  grade: 'الدرجة',
  skills: 'المهارات',
  deadline: 'آخر أجل للترشيح',
  salary_min: 'الحد الأدنى للأجر',
  salary_max: 'الحد الأقصى للأجر',
  remote: 'العمل عن بعد',
  status: 'الحالة',
};

export function legalFieldLabel(field: string): string {
  return ARABIC_FIELD_LABELS[field] || field;
}

/** Keep API/filter values stable while presenting legal vocabulary in Arabic. */
export function legalDisplayValue(field: string | undefined, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch { return String(value); }
  }

  const key = String(value);
  return ARABIC_OPTION_LABELS[field || '']?.[key] || key;
}
