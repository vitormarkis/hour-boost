import { GetServerSidePropsContext, PreviewData } from "next"
import { ParsedUrlQuery } from "querystring"

export class ServerHeaders {
  constructor(
    private readonly ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
    private serverHeaders = {}
  ) {}

  toJSON() {
    return this.serverHeaders
  }

  appendAuthorization() {
    const authToken = this.ctx.req.cookies["__session"]
    if (authToken) this.serverHeaders["Authorization"] = `Bearer ${authToken}`
  }
}
