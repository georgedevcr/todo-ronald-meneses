let db = firebase.firestore();

const idTblTodo = 'tbl-todo';

const classesAlert = {
	danger: "alert-danger",
	succes: "alert-success"
}


let states = {};

const statesCollection = "states_mod";
const onGetStatesFS = (success, error) => db.collection(statesCollection).get().then(success);

const TodoTemplate = {
	collection: "todos",
	idtxtSearch: 'sch-txt-todo',
	idCbSearch: 'sch-cb-state',
	GetTemplate: function (idTodo, todo) {
		return `<tr>
					<td>${todo.description}</td>
					<td>${todo.state.description}</td>
					<td>${todo.user.username}</td>
					<td>
						<div class="icons-actions">
							<a onclick="TodoTemplate.UpdateState('${idTodo}', ${states.done.id})" href="#" class="${todo.state.id == states.done.id ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">check</i></a>
							<a onclick="TodoTemplate.UpdateState('${idTodo}', ${states.canceled.id})" href="#" class="${todo.state.id == states.canceled.id ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">clear</i></a>
							<a onclick="TodoTemplate.UpdateState('${idTodo}', ${states.suspended.id})" href="#" class="${todo.state.id == states.suspended.id ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">timer_off</i></a>
							<!-- <a onclick="FrmTodo.EditTodo('${idTodo}')" href="#" class="black-text"><i class="material-icons">edit</i></a>-->
							<!-- <a onclick="TodoTemplate.RemoveTodo('${idTodo}')" href="#" class="black-text"><i class="material-icons">remove</i></a>-->
						</div>
					</td>
					<td>${todo.idUser}</td>
				</tr>`;
	},
	GetNewTodo: function(description)
	{
		let newTodo = {
			//idTodo: this.FindMaxId(todoList), // (todoList.length + 1), // cambiar y buscar el mayor dentro del listado
			description: description,
			state: states.pending,
			user: {
				idUser: 0,
				username: "Invitado"
			}
		};
		return newTodo;
	},
	LoadTableTodo: function(){
		db.collection(this.collection).onSnapshot((query) =>{
			const tbody = document.getElementById(idTblTodo).querySelector("tbody");
			tbody.innerHTML = "";
			query.forEach(element => {
				tbody.insertAdjacentHTML('beforeend', TodoTemplate.GetTemplate(element.id, element.data()));
			});
		});
	},
	FindMaxId: function(lstTodo)
	{
		let idMax = 0;
		if(lstTodo.length > 0)
		{
			const todoMax = lstTodo.reduce(function(prev, current) {
				return (prev.idTodo > current.idTodo) ? prev : current
			});
			idMax = todoMax.idTodo;
		}	
		return idMax + 1;
	},
	FindTodo: function(idTodo){
		return todoList.find(t => t.idTodo == idTodo);
	},
	UpdateTodo: function(todo){
		let todoToUpdate = todoList.find(t => t.idTodo == todo.idTodo);
		todoToUpdate = todo;
		todoToUpdate.state = states.pending;
	},
	RemoveTodo: function(idTodo)
	{
		for (let index = 0; index < todoList.length; index++) {
			const element = todoList[index];
			if(element.idTodo == idTodo){
				todoList.splice(index, 1);
				break;
			}
		}
		//this.LoadTableTodo(todoList);
	},
	UpdateState: function(idTodo, idState)
	{
		let newState = Object.values(states).find(t => t.id == idState);
		console.log(idTodo);
		
		db.collection(this.collection).doc(idTodo).update({ "state" : newState });
		// let todoToUpdate = todoList.find(t => t.idTodo == idTodo);
		
		// todoToUpdate.state = newState;
		// //this.LoadTableTodo(todoList);
	},
	InitFilters: function()
	{
		//Filtro de estados
		var cbState = document.getElementById('sch-cb-state');
		for (let index = 0; index < Object.values(states).length; index++) {
			const element = Object.values(states)[index];
			const option = document.createElement("option");
			option.value = element.id;
			option.text = element.description;
			cbState.add(option);
		}
		var instances = M.FormSelect.init(cbState);
	},
	SearchTodo: function()
	{
		let txtTodoSearch = document.getElementById(this.idtxtSearch).value;
		let cbSearch = document.getElementById(this.idCbSearch).value;
		let todoBusqueda = todoList.filter(t => t.description.includes(txtTodoSearch));
		//this.LoadTableTodo(todoBusqueda);
	}
}


let FrmTodo = {
	idFrm: 'frm-todo',
	idTxtTodo: 'new-todo',
	idTodo: null,
	idLabel: 'label-frm',
	get txtTodo() {
		return document.getElementById(this.idTxtTodo).value;
	},
	set txtTodo(value) {
		document.getElementById(this.idTxtTodo).value = value;
		M.updateTextFields();
	},
	NewTodo: function()
	{
		//Limpiar el formulario
		document.getElementById(this.idLabel).textContent = "Nuevo ToDo";
		this.Clean();
		this.Open();
	},
	EditTodo: function(idTodo)
	{
		let todo = TodoTemplate.FindTodo(idTodo);
		this.idTodo = todo.idTodo;
		this.txtTodo = todo.description;
		document.getElementById(this.idLabel).textContent = "Editar ToDo";
		this.Open();
	},
	Open : function(){
		//Mostrar el formulario para crear el todo 
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
		this.idTodo = null;
	},
	Save: function()
	{
		let self = this;
		if(self.txtTodo != ""){
			if(self.idTodo == null)
			{
				console.log(self.txtTodo);
				let todo = TodoTemplate.GetNewTodo(self.txtTodo);
				db.collection(TodoTemplate.collection).doc().set(todo);
				ShowActionAlert("ToDo registrado correctamente.", classesAlert.succes);
			}
			else{
				let todo = TodoTemplate.FindTodo(self.idTodo);
				todo.description = self.txtTodo;
				TodoTemplate.UpdateTodo(todo);
				ShowActionAlert("ToDo actualizado correctamente.", classesAlert.succes);
			}
			//TodoTemplate.LoadTableTodo(todoList);
			self.Close();
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



/**
 * Al iniciar el documento, ejecutar
 * @author Ronald Meneses
 */
document.body.onload = async function()
{
	//Obtener los estados para validar contra la información que tiene la propiedad del todo
	await onGetStatesFS((q) =>
	{
		q.forEach((s) =>
		{
			states[s.id] = s.data();
		});
	});	
	TodoTemplate.LoadTableTodo();
	TodoTemplate.InitFilters();
};
