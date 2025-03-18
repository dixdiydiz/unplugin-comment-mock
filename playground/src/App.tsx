import { useState } from "react";
import TodoList from "./components/todo-list/list.tsx";

export default function App() {
	const [fruit] = useState(() => {
		// #comment-mock resetFruit(__origin, 'orange')
		return "apple";
	});

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "12px",
				alignItems: "center",
			}}
		>
			<p>{fruit}</p>
			<TodoList />
		</div>
	);
}
