import { VNode, DOMSource } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { StateSource } from 'cycle-onionify'

import { Competition } from '../interfaces'
import { Selection } from '../interfaces'
import CompetitionComponent, { Sinks as CompetitionComponentSinks } from './competition'
import { renderSport } from '../../misc/helpers.dom'

export interface State extends Array<Selection> { }

export interface Sinks {
	DOM: Stream<VNode>,
}

export interface Sources {
	onion: StateSource<State>
	competitions$: Stream<Competition[]>
	LiveData: Stream<any>
	DOM: DOMSource
}

function Sport(sources: Sources): Sinks {
	const competitions$ = sources.competitions$
	const liveData$ = sources.LiveData

	// transform a stream of an array of competitions to stream of an array of components
	// simple enough
	const competitionComponentSinks$: Stream<CompetitionComponentSinks[]> =
		competitions$
			.map(competitions =>
				competitions
					.filter(competition =>
						(competition.preLiveEvents || []).concat(competition.liveEvents || []).length > 0
					)
					.map(competition =>
						CompetitionComponent({
							DOM: sources.DOM,
							onion: sources.onion,
							competition$: xs.of(competition),
							LiveData: liveData$,
						})
					)
			)

	const competitionComponentsDom$: Stream<VNode[]> =
		competitionComponentSinks$
			.map((competitionComponentsSinks: CompetitionComponentSinks[]) =>
				competitionComponentsSinks
					.map((competitionComponentSinks: CompetitionComponentSinks) =>
						competitionComponentSinks.DOM
					)
			)
			// this is the trick here.
			// transform to a stream of an array of vdoms from a an array of streams of competition component vdoms
			.map((competitionComponentDoms$: Stream<VNode>[]): Stream<VNode[]> =>
				xs.combine(...competitionComponentDoms$)
			)
			.flatten()

	/// back to what we've seen before.
	// simple enough
	const vdom$ =
		xs.combine(
			competitionComponentsDom$,
		).map(renderSport)

	return {
		DOM: vdom$,
	}
}

export default Sport
