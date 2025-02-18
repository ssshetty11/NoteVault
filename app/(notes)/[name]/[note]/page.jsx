"use client";
import Button from "../../../../components/Button";
import Textarea from "../../../../components/Textarea";
import SideMenu from "../../../../components/Sidebar";
import FooterRibbon from "../../../../components/FooterRibbon.jsx";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { notesData } from "../../../../data";
import MenuButton from "../../../../components/MenuButton";
import { useSession } from "next-auth/react";

const Notes = ({ params }) => {
	const {data: session} = useSession();
	const { note } = params;

	let username;
	try {
		username = session.user.name;
	} catch {
		username = "Guest User";
	}

	let currentNote = notesData.find((el) => el.id == note);

	if (typeof currentNote === "undefined") {
		currentNote = {
			id: 0,
			title: "It's not a bug it's a feature 🐞",
			createdDate: '27/08/2023',
			lastModifiedDate: new Date().toLocaleDateString("en-GB"),
			content: "TODO",
		};
	}
	console.log(currentNote)
	const [notes, setNotes] = useState(currentNote);

	const [recognizedText, setRecognizedText] = useState("placeholder");
	let recognition;

	const [userNotes, setUserNotes] = useState(notes.content);
	const textareaRef = useRef(null);

	const [isRecording, setIsRecording] = useState(false);
	const [status, setStatus] = useState("saved");

	const startRecognition = () => {
		recognition = new window.webkitSpeechRecognition();
		recognition.onresult = (event) => {
			const transcript = event.results[0][0].transcript;
			setRecognizedText(transcript);
		};
		recognition.start();
	};

	const stopRecognition = () => {
		if (recognition) {
			recognition.stop();
		}
	};

	const handleRecording = () => {
		setIsRecording((prev) => !prev);
	};

	const handleSave = () => {
		setNotes({
			...notes,
			content: userNotes,
			lastModifiedDate: new Date().toLocaleDateString("en-GB"),
		});
		setStatus("updating");

		setTimeout(() => {
			setStatus("saved");
		}, 1000);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			textareaRef.current.focus();
		}
	};

	const handleTextareaChange = (e) => {
		// const inputString = e.target.innerHTML;
		const inputString = e.target.value;
		const modifiedString = inputString.replace(
			/#[a-zA-Z0-9_]+/g,
			'<span class="text-primary">$&</span>'
		);

		setUserNotes(modifiedString);
		setStatus("pending");
	};

	const links = [
		{ href: "/account-settings", label: "Account settings" },
		{ href: "/support", label: "Support" },
		{ href: "/license", label: "License" },
		{ href: "/sign-out", label: "Sign out" },
	];

	// return (
	// 	<div className="text-white">
	// 	  <button onClick={startRecognition}>Start Speech Recognition</button>
	// 	  <button onClick={stopRecognition}>Stop Speech Recognition</button>
	// 	  <p>Recognized Text: {recognizedText}</p>
	// 	</div>
	//   );

	return (
		<>
			{/* <SideMenu className="hidden sm:inline-block" /> */}
			<main>
				<div className="font-handlee flex text-text-100 gap-y-10 flex-col mx-4 my-14 sm:mx-20 md:mx-28 ">
					<div className="flex gap-4 justify-between items-center">
						<Link
							className="text-xs text-center text-text-100 font-semibold hover:underline hover:bg-dark-100 rounded px-4 py-2 transition font-poppins"
							href={session ? `/${username.split(' ').join('')}`: '/'}
						>
							Back
						</Link>

						<div className="flex gap-x-2">
							<MenuButton links={links} >
								<Button size="sm">
								{/* <span className="text-center bg-white rounded-lg h-5 w-5 flex items-center justify-center">
								</span> */}

									<Image
										src="/images/edit.svg"
										width={20}
										height={20}
										alt="mic"
										className=""
									/>
								</Button>
							</MenuButton>
							<Button
								size="sm"
								type="glory"
								className={`${
									isRecording &&
									"ring-1 ring-offset-1 rounded-lg ring-white"
								}`}
								onClick={handleRecording}
							>
								<Image
									src="/images/microphone.svg"
									width={20}
									height={20}
									alt="mic"
								/>
							</Button>
							<Button onClick={handleSave}>Save</Button>
						</div>
					</div>
					<div className="flex flex-col gap-y-2 sm:gap-y-4">
						<input
							type="text"
							placeholder="Note Title"
							defaultValue={notes.title}
							onChange={(e) =>
								setNotes({ ...notes, title: e.target.value })
							}
							onKeyDown={(e) => handleKeyDown(e)}
							className="text-clamp-notes-greeting font-bold block w-full rounded py-2 placeholder:text-gray-600 text-text-100 sm:leading-6 bg-transparent focus:ring-0 border-0"
							maxLength={40}
							minLength={3}
							required
						/>

						<Textarea
							userNotes={userNotes}
							reference={textareaRef}
							onInput={handleTextareaChange}
							onChange={handleTextareaChange}
						/>

						<FooterRibbon
							{...notes}
							status={status}
							isRecording={isRecording}
							userNotes={userNotes}
						/>
					</div>
				</div>
			</main>
		</>
	);
};

export default Notes;
