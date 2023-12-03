export class SteamAccountCredentials {
	readonly accountName: string
	readonly password: string

	private constructor(props: SteamAccountCredentialsProps) {
		this.accountName = props.accountName
		this.password = props.password
	}

	static create(props: SteamAccountCredentialsCreateProps) {
		return new SteamAccountCredentials({
			...props,
		})
	}

	static restore(props: SteamAccountCredentialsProps) {
		return new SteamAccountCredentials(props)
	}
}

type SteamAccountCredentialsProps = {
	accountName: string
	password: string
}

export type SteamAccountCredentialsCreateProps = {
	accountName: string
	password: string
}
