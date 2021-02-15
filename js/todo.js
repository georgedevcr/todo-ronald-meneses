

const idTblTodo = 'tbl-todo';

const classesAlert = {
	danger: "alert-danger",
	succes: "alert-success"
}

const states = {
	pending: {
		id: 1,
		description: "Pendiente"
	},
	done: {
		id: 2,
		description: "Finalizado"
	},
	canceled: {
		id: 3,
		description: "Cancelado"
	},
	suspended: {
		id: 4,
		description: "Suspendido"
	}
}

const todoTemplate = {
	GetTemplate: function (todo) {
		return `<tr>
					<td>${todo.description}</td>
					<td>${todo.state.description}</td>
					<td>${todo.user.username}</td>
					<td>
						<div class="justify-icons icons-actions">
							<a onclick="CheckToDo(${todo.idTodo})" href="#" class="${todo.state.id == states.done.id ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">check</i></a>
							<a onclick="CancelToDo(${todo.idTodo})" href="#" class="${todo.state.id == states.canceled.id ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">clear</i></a>
							<a onclick="SuspendToDo(${todo.idTodo})" href="#" class="${todo.state.id == states.suspended.id ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">timer_off</i></a>
						</div>
					</td>
					<td>${todo.idUser}</td>
				</tr>`;
	},
	GetNewTodo: function(description)
	{
		let newTodo = {
			idTodo: (todoList.length + 1), // cambiar y buscar el mayor dentro del listado
			description: description,
			state: states.pending,
			user: {
				idUser: 0,
				username: "Invitado"
			}
		};
		return newTodo;
	}
}

function LoadTableTodo(lstTodo){
	const tbody = document.getElementById(idTblTodo).querySelector("tbody");
	tbody.innerHTML = "";
	for (let i = 0; i < lstTodo.length; i++) {
		const element = lstTodo[i];
		tbody.insertAdjacentHTML('beforeend', todoTemplate.GetTemplate(element));
	}
}

let FrmTodo = {
	idFrm: 'frm-todo',
	idTxtTodo: 'new-todo',
	get txtTodo() {
		return document.getElementById(this.idTxtTodo).value;
	},
	set txtTodo(value) {
		document.getElementById(this.idTxtTodo).value = value;
	},
	Open : function(){
		//Mostrar el formulario para crear el todo y limpiar el formulario
		this.Clean();
		document.getElementById(this.idFrm).hidden = false;
	},
	Close : function(){
		this.Clean();
		document.getElementById("alert-action").hidden = true;
		document.getElementById(this.idFrm).hidden = true;
	},
	Clean: function()
	{
		this.txtTodo = '';
	},
	Save: function()
	{
		if(this.txtTodo != ""){
			todoList.push(todoTemplate.GetNewTodo(this.txtTodo));
			LoadTableTodo(todoList);
			this.Close();
			ShowActionAlert("ToDo registrado correctamente.", classesAlert.succes);
		}
		else
			ShowActionAlert("Ingrese la descripción del ToDo.", classesAlert.danger);
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

function CloseAlert(btn)
{
	let divAlert = btn.closest("div.alert");
	divAlert.hidden = true;
}

function ShowActionAlert(message, type)
{
	let alert = document.getElementById("alert-action");
	alert.removeAttribute("class");
	alert.classList.add("alert");
	alert.classList.add("alert-dismissible");
	alert.classList.add(type);

	let divMessageAlert = alert.querySelector("span");
	divMessageAlert.textContent = message;

	alert.hidden = false;
}

document.body.onload = function()
{
	LoadTableTodo(todoList);
};