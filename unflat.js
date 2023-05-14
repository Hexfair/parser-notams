const unflat = (src, count) => {
	const result = [];
	for (let s = 0, e = count; s < src.length; s += count, e += count)
		result.push(src.slice(s, e).join('+'));
	return result;
}

export default unflat;
