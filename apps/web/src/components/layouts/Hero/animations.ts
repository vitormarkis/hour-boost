export const titleAnimations = {
	initial: { y: 25, opacity: 0 },
	animate: { y: 0, opacity: 1 },
	transition: {
		delay: 0.5,
		ease: "easeInOut",
		opacity: {
			duration: 0.7,
		},
		y: {
			duration: 1,
		},
	},
}

export const subtitleAnimations = {
	initial: { y: 15, opacity: 0 },
	animate: { y: 0, opacity: 1 },
	transition: {
		ease: "easeInOut",
		delay: 1,
		opacity: {
			duration: 0.4,
		},
		y: {
			duration: 0.7,
		},
	},
}

export const solderAnimationWrapper = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	transition: { duration: 4 },
}

export const solderAnimation = {
	initial: { opacity: 0 },
	animate: { opacity: 0.6 },
	transition: { duration: 1 },
}

export const gamesListAnimation = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	transition: { duration: 1, delay: 1.5 },
}
