import xs, { Stream } from 'xstream'
import { DOMSource, VNode, div, h4, li, span } from '@cycle/dom'
import { StateSource, Reducer } from 'cycle-onionify'
import { Selection } from '../interfaces'

export interface State extends Selection {}

export interface Sources {
	DOM: DOMSource
	onion: StateSource<State>
	socket: Stream<any>
}

export interface Sinks {
	DOM: Stream<VNode>
	onion: Stream<Reducer<State>>
}

function SelectionCompenent(sources: Sources): Sinks {
	const state$ = sources.onion.state$

	const deleteReducer$: Stream<Reducer<State>> =
		sources.DOM.select('.selection__remove').events('click')
			.mapTo(function deleteReducer() {
				return undefined
			})

	const reducer$: Stream<Reducer<State>> =
		xs.merge(deleteReducer$)

	const vdom$: Stream<VNode> =
		xs.combine(
			state$,
		)
		.map(([selection]) =>
			li(`.listItem .selection ${selection.priceChangeUp || selection.priceChangeDown ? `priceTo-${selection.price * 100}` : ''}`, {
        class: {
          priceChange: selection.priceChangeUp || selection.priceChangeDown,
        },
      }, [
        div('.selection__price', [
          div('.price', {
            },
            selection.price,
          ),
        ]),
				div('.selection__details', [
					div('.selection__outcome', selection.name),
					div('.selection__market', selection.marketName),
					div('.selection__startTime', 'time'),
				]),
				div('.selection__remove', 'x')
			]),
		)

	return {
		DOM: vdom$,
		onion: reducer$,
	}
}

export default SelectionCompenent
