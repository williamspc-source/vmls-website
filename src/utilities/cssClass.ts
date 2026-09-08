// Normalises a cssClass field value (now a string[] from the strict picker, but
// tolerant of a legacy string) into a className string or undefined.
export const toClassName = (value?: string | string[] | null): string | undefined => {
  if (Array.isArray(value)) {
    const joined = value.filter(Boolean).join(' ').trim()
    return joined || undefined
  }
  return value?.trim() || undefined
}
