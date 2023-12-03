import { AuthSessionParams, IBuildClerkProps, extractUserSession } from "@/types/UserSession"
import { getAuth, clerkClient, buildClerkProps } from "@clerk/nextjs/server"
import { GetServerSidePropsContext, PreviewData } from "next"
import { ParsedUrlQuery } from "querystring"

export async function getAuthSession(
	req: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>["req"]
): Promise<AuthSessionParams> {
	const { userId } = getAuth(req)
	const user = userId ? await clerkClient.users.getUser(userId) : undefined
	const buildClerkPropsData = buildClerkProps(req, {
		user,
	}) as unknown as IBuildClerkProps
	const authSession = extractUserSession(buildClerkPropsData)
	return { authSession }
}
