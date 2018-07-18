import xs, { Stream } from 'xstream'
import { div, VNode } from '@cycle/dom'

import '../css/styles.css'

interface Sinks {
	DOM: Stream<VNode>
}

function mapNumberToMessage(i: number): VNode {
	return div(
		`Hello. ${i} seconds ago.`
	)
}

function add(n) {
	return function (i: number): number {
		return i + n
	}
}

function App(): Sinks {
	const vdom$ =
		xs.periodic(1000)
			.startWith(-1)
			.map(add(1))
			.map(mapNumberToMessage)

	return {
		DOM: vdom$,
	}
}

export default App
