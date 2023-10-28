const getDateTime = (value: Date | null) => (value === null ? value : new Date(value).getTime())
