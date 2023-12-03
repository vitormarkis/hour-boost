export const dateValidator = (value: any) => {
	if (value === null) return true
	const date = new Date(value)
	return date instanceof Date && isFinite(date.getTime())
}
