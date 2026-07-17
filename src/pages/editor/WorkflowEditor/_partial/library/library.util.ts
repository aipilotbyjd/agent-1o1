export const tintStyle = (hex?: string) =>
	hex
		? { backgroundColor: `${hex}1a`, color: hex }
		: { backgroundColor: 'rgb(124 58 237 / 0.1)', color: 'rgb(124 58 237)' };
