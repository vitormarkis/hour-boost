export interface UseCase<P extends Record<string, any> = Record<string, any>, R = any> {
  execute(payload: P): Promise<R>
}
