/**
 * "insert a space before each capital, uppercase the first letter" transform,
 * duplicated 3x verbatim (ConfigSelector's format_label, ConfigurationForm's
 * format_label, usePlayerFields' humanize_field_label) before this extraction.
 */
export function humanizeLabel(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase())
}
