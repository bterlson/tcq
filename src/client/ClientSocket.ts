import * as socketio from 'socket.io-client';
import * as Message from '../shared/Messages';


const match = document.location.href.match(/meeting\/(.*)$/);

if (!match) throw new Error('Failed to find meeting id');
const id = match[1];
export let socket: Message.ClientSocket = socketio.connect({
  transports: ['websocket'],
  upgrade: false,
  query: `id=${id}`
});

socket.on('response', response => {
  if (response.status === 200) {
    notifyRequestSuccess(response);
  } else {
    notifyRequestFailure(response);
  }
});

let notifyRequestSuccess = (result: any) => { };
let notifyRequestFailure = (result: any) => { };

export function request(type: string, message: any) {
  let p = new Promise((resolve, reject) => {
    notifyRequestSuccess = resolve;
    notifyRequestFailure = reject;
  });

  if (socket) {
    socket.emit(type as any, message);
  } else {
    // probably wait on socket.
    return Promise.reject('No connection to server.');
  }

  return p;
}

export default socket;
