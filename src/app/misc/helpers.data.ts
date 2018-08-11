export function fixPageData(pageData) {
	if (!pageData || !pageData.data || !pageData.data.types) {
		return []
	}

	return pageData.data.types
}
