declare global {
	namespace Express {
		interface Request extends LooseAuthProp {}
	}
}
