import { div, VNode, ul, p } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource, makeCollection, Reducer } from 'cycle-onionify'
import isolate from '@cycle/isolate'

import { Competition } from './interfaces'
import CompetitionComponent from './competition'

interface State extends Map<string, Competition> {}

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	onion: StateSource<State>
}

function Competitions(sources: Sources): Sinks {

	const CompetitionList = makeCollection({
		item: CompetitionComponent,
		collectSinks: instances => ({
			DOM: instances.pickCombine('DOM') // combine all the dom streams
		})
	})

	// convert the map of competitions to an array of competitions, which is required for makeCollection
	// check the weight of this conversion, or look at other options.
	const competitionListLens = {
		get: (state: State) => Array.from(state).map(([key, data]) => data)
	}

	const competitionListSinks = isolate(CompetitionList, {onion: competitionListLens})(sources)
	const competitionListDom$: Stream<VNode[]> = competitionListSinks.DOM

	const vdom$: Stream<VNode> =
		competitionListDom$
			.map((competitionListDom: VNode[]) =>
				competitionListDom.length ?
					ul(competitionListDom) : p('no competitions found')
			)

	return {
		DOM: vdom$,
	}
}

export default Competitions
