import * as io from 'socket.io-client'
import {adapt} from '@cycle/run/lib/adapt'
import { Stream } from 'xstream'

export function makeSocketDriver() {
	const storageDriver = () => {
		const incoming$: Stream<any> = Stream.create({
			start: listener => {
				const socket = io( 'http://ec2-18-130-224-107.eu-west-2.compute.amazonaws.com:8000')

				socket.on('connect', function(){
					console.log('Connected')
				})

				socket.on('pushUpdate', function(data){
					console.log(event)
					listener.next(event)
				})

				socket.emit('liveSportsConfig', {
					event: 2000,
					market: 1000,
					outcome: 10000,
				})
			},
			stop: () => {},
		})

		return adapt(incoming$)
	}

	return storageDriver
}

