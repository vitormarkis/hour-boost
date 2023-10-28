export function setPrefixDoubleDashes(cssVariable: string) {
  const stringArray = cssVariable.replace(/^-*/, "")
  return `--${stringArray}`
}
