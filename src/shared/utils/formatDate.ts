const LANGUAGE_LOCALES: Record<string, string> = {
  en: "en-GH",
  fr: "fr-FR",
  es: "es-ES",
  pt: "pt-PT",
};

export function formatDate(
  date: string | Date,
  language: string = "en",
): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const locale = LANGUAGE_LOCALES[language] ?? "en-GH";

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}
