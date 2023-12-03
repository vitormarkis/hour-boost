import { User } from "@clerk/nextjs/dist/types/server"

export interface UserSession extends User {}

export function extractUserSession({
	__clerk_ssr_state: { sessionClaims, ...authSession },
}: IBuildClerkProps) {
	return authSession
}

export type AuthSession = ReturnType<typeof extractUserSession>
export type AuthSessionParams = { authSession: AuthSession }

export interface IBuildClerkProps {
	__clerk_ssr_state: {
		sessionClaims: SessionClaims
		sessionId: string
		userId: string
		user: UserSession | null
	}
}

export interface SessionClaims {
	azp: string
	exp: number
	iat: number
	iss: string
	nbf: number
	sid: string
	sub: string
}

export interface PublicMetadata {}

export interface UnsafeMetadata {}

export interface EmailAddress {
	id: string
	emailAddress: string
	verification: Verification
	linkedTo: LinkedTo[]
}

export interface Verification {
	status: string
	strategy: string
	externalVerificationRedirectURL: any
	attempts: any
	expireAt: any
	nonce: any
}

export interface LinkedTo {
	id: string
	type: string
}

export interface ExternalAccount {
	id: string
	approvedScopes: string
	emailAddress: string
	username: any
	publicMetadata: PublicMetadata2
	label: any
	verification: Verification2
}

export interface PublicMetadata2 {}

export interface Verification2 {
	status: string
	strategy: string
	externalVerificationRedirectURL: any
	attempts: any
	expireAt: number
	nonce: any
}
