export function makeResError(error: unknown) {
  return {
    json: {
      message: error instanceof Error ? error.message : "Erro interno no servidor.",
    },
    status: 500,
  }
}

export function makeRes(status: number, message: string) {
  return {
    json: {
      message,
    },
    status,
  }
}
