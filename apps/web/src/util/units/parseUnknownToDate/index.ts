export const parseUnknownToDate = (unparsedDate: any): Date | null => {
	const date = new Date(unparsedDate)
	if (date instanceof Date && isFinite(date.getTime())) return date
	return null
}

export const parseUnknownDateToTime = (unparsedDate: unknown): number | null => {
	const date = parseUnknownToDate(unparsedDate)
	return date?.getTime() ?? null
}
