export function fixPageData(pageData) {
	if (!pageData || !pageData.data || !pageData.data.types) {
		return []
	}

	return pageData.data.types
}

export function competitionEvents(competition) {
	return (competition.preLiveEvents || []).concat(competition.liveEvents || [])
}
