import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
	faCirclePause,
	faCirclePlay,
	faMicrophone,
	faMicrophoneSlash,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';

export default function WebSocket({ socket }) {
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	let audio;

	const { transcript, listening } = useSpeechRecognition();

	const [play, setPlay] = useState(false);
	const [clicked, setClicked] = useState();

	const handleKeyPress = (event) => {
		if (event.charCode === 13) {
			handleSubmit();
		}
	};

	useEffect(() => {
		setMessage(transcript);
	}, [transcript]);

	const handleText = (e) => {
		const inputMessage = e.target.value;
		setMessage(inputMessage);
	};

	const handleSubmit = () => {
		if (!message) {
			return;
		}
		socket.emit('data', message);
		setMessage('');
	};
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		socket.on('data', (data) => {
			let message = { ...data, time: new Date() };
			setMessages([...messages, message]);
		});
		return () => {
			socket.off('data', () => {
				console.log('data event was removed');
			});
		};
	}, [socket, messages]);

	return (
		<div>
			<section className="msger">
				<header className="msger-header">
					<div className="msger-header-title">
						<i className="fas fa-comment-alt"></i> Multimedijalni sistemi i aplikacije
					</div>
					<div className="msger-header-options">
						<span>
							<i className="fas fa-cog"></i>
						</span>
					</div>
				</header>

				<main className="msger-chat">
					{messages.length > 0 ? (
						messages.map((message, ind) => {
							return (
								<div
									className={socket.id === message.id ? 'msg right-msg' : 'msg left-msg'}
									key={ind}
									ref={messagesEndRef}
								>
									<div className="msg-img">
										<FontAwesomeIcon icon={faUser} className="user-icon" />
									</div>
									<div className="msg-bubble">
										<div className="msg-info">
											<div className="msg-info-name">{message.id}</div>
											<div className="msg-info-time">
												{message.time.getHours() + ':' + message.time.getMinutes()}
											</div>
										</div>
										<div className="msg-text">{message.data}</div>
									</div>
									<FontAwesomeIcon
										className="play-tts"
										style={{ cursor: 'pointer' }}
										icon={play && clicked === ind ? faCirclePause : faCirclePlay}
										onClick={() => {
											if (!play) {
												const requestOptions = {
													method: 'POST',
													headers: { 'Content-Type': 'application/json' },
													body: JSON.stringify(message.data),
												};
												fetch('http://localhost:5000/tts', requestOptions)
													.then((response) => response.blob())
													.then((data) => {
														const objectURL = URL.createObjectURL(data);
														audio = new Audio(objectURL);
														audio.play();
													});
											} else {
												if (audio) {
													audio.pause();
												}
											}
											setPlay(!play);
											setClicked(ind);
										}}
									/>
								</div>
							);
						})
					) : (
						<></>
					)}
				</main>
				<div className="msger-inputarea">
					<input
						type="text"
						className="msger-input"
						placeholder="Enter your message..."
						value={message}
						onChange={handleText}
						onKeyPress={handleKeyPress}
					/>
					<button className="msger-send-btn" onClick={handleSubmit}>
						Send
					</button>
					<FontAwesomeIcon
          style={{cursor: 'pointer' }}
						icon={listening ? faMicrophone : faMicrophoneSlash}
						onClick={() => {
							listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening();
						}}
					/>
				</div>
			</section>
		</div>
	);
}
