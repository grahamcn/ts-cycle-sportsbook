import {adapt} from '@cycle/run/lib/adapt'
import { Stream } from 'xstream'

export function makeSocketDriver(socketUrl) {
	const socketDriver = (/* no sinks */) => {
		const incoming$: Stream<any> = Stream.create({
			start: listener => {
				const interval = setInterval(function connect(index) {
					try {
						const socket = io(socketUrl)
						clearInterval(interval)
						initialiseSocket(socket, listener)
					} catch {
					}
				}, 500)
			},
			stop: () => {},
		})

		return adapt(incoming$)
	}

	return socketDriver
}

function initialiseSocket(socket, listener) {
	socket.on('connect', function() {
		console.log('Connected')
	})

	socket.on('pushUpdate', function(event) {
		listener.next(event)
	})

	socket.emit('liveSportsConfig', {
		event: 2000,
		market: 1000,
		outcome: 1000,
	})
}
