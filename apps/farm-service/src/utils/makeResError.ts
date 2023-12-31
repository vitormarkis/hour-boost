export function makeResError(error: unknown, status = 500) {
  return {
    json: {
      message: error instanceof Error ? error.message : "Erro interno no servidor.",
    },
    status,
  }
}

export function makeRes(status: number, message: string, rest?: Record<string, any>) {
  return {
    json: {
      message,
      ...rest,
    },
    status,
  }
}
