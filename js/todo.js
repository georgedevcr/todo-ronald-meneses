

const idTblTodo = 'tbl-todo';

const states = {
	done: 1,
	canceled: 2,
	suspended: 3
}

const todoTemplate = {
	geTemplate: function (todo) {
		console.log(todo);
		
		return `<tr>
					<td>${todo.description}</td>
					<td>${todo.state}</td>
					<td>${todo.username}</td>
					<td>
						<div class="justify-icons icons-actions">
							<a onclick="CheckToDo(${todo.idTodo})" href="#" class="${todo.idState == states.done ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">check</i></a>
							<a onclick="CancelToDo(${todo.idTodo})" href="#" class="${todo.idState == states.canceled ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">clear</i></a>
							<a onclick="SuspendToDo(${todo.idTodo})" href="#" class="${todo.idState == states.suspended ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">timer_off</i></a>
						</div>
					</td>
					<td>${todo.idUser}</td>
				</tr>`;
	}
}

function LoadTableTodo(lstTodo){
	const tbody = document.getElementById(idTblTodo).querySelector("tbody");
	
	for (let i = 0; i < lstTodo.length; i++) {
		const element = lstTodo[i];
		tbody.insertAdjacentHTML('beforeend', todoTemplate.geTemplate(element));
	}
}

function CheckToDo(idTodo){
	console.log(idTodo);
}

function CancelToDo(idTodo){
	console.log(idTodo);
}

function SuspendToDo(idTodo){
	console.log(idTodo);
}

document.body.onload = function()
{
	LoadTableTodo(todoList);
};