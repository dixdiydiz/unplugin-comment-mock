import {
	type ChangeEvent,
	type MouseEvent,
	useLayoutEffect,
	useState,
} from "react";

export default function TodoList() {
	useLayoutEffect(() => {
		// #comment-mock mockTodos
		const initTodos = ["It Won't show"];
		setTodos(initTodos);
	}, []);
	const [todos, setTodos] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		setInputValue(e.target.value);
	}

	function handleSubmit(e: MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		setTodos([...todos, inputValue]);
		setInputValue("");
	}

	function handleDelete(index: number) {
		const newTodos = [...todos];
		newTodos.splice(index, 1);
		setTodos(newTodos);
	}
	return (
		<div style={{ display: "flex", justifyContent: "center" }}>
			<section>
				<h1 style={{ textAlign: "center" }}>Todo List</h1>
				<form>
					<input type="text" value={inputValue} onChange={handleChange} />
					<button
						type="button"
						style={{ marginLeft: "8px" }}
						onClick={handleSubmit}
					>
						Add Todo
					</button>
				</form>
				<ul>
					{todos.map((todo, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<li key={index}>
							{todo}
							<button
								type="button"
								style={{ marginLeft: "8px" }}
								onClick={() => handleDelete(index)}
							>
								Delete
							</button>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
