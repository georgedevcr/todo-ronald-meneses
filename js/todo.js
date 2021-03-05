let db = firebase.firestore();

const Alert = {
	el: 'alert-action',
	timeout: null,
	types: {
		danger: "alert-danger",
		success: "alert-success"
	},
	Show(config){
		let alert = document.getElementById(this.el);
		alert.removeAttribute("class");
		alert.classList.add("alert");
		alert.classList.add("alert-dismissible");
		alert.classList.add(config.type);
	
		let divMessageAlert = alert.querySelector("span");
		divMessageAlert.textContent = config.message;
		alert.hidden = false;
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			alert.hidden = true;
		}, 5000);
	},
	Close(btn)
	{
		let divAlert = btn.closest("div.alert");
		divAlert.hidden = true;
	}
}

let states = {};
const statesCollection = "states_mod";
const onGetStatesFS = (success) => db.collection(statesCollection).get().then(success);

const TodoTemplate = {
	collection: "todos",
	idtxtSearch: 'sch-txt-todo',
	idCbSearch: 'sch-cb-state',
	idTblTodo: 'tbl-todo',
	get txtSearch() {
		return document.getElementById(this.idtxtSearch).value;
	},
	GetTemplate: function (idTodo, todo) {
		return `<tr>
					<td>${todo.description}</td>
					<td>${todo.state.description}</td>
					<td>${todo.user.username}</td>
					<td>
						<div class="icons-actions">
							<a onclick="TodoTemplate.UpdateState('${idTodo}', ${states.done.id})" href="#" class="${todo.state.id == states.done.id ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">check</i></a>
							<a onclick="TodoTemplate.UpdateState('${idTodo}', ${states.canceled.id})" href="#" class="${todo.state.id == states.canceled.id ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">do_not_disturb_alt</i></a>
							<a onclick="TodoTemplate.UpdateState('${idTodo}', ${states.suspended.id})" href="#" class="${todo.state.id == states.suspended.id ? 'teal-text darken-4' : 'black-text'}"><i class="material-icons">timer_off</i></a>
							<a onclick="FrmTodo.EditTodo('${idTodo}')" href="#" class="black-text"><i class="material-icons">edit</i></a>
							<a onclick="TodoTemplate.RemoveTodo('${idTodo}')" href="#" class="black-text"><i class="material-icons">delete_forever</i></a>
						</div>
					</td>
					<td>${todo.idUser}</td>
				</tr>`;
	},
	GetNewTodo: function(description)
	{
		let newTodo = {
			description: description,
			state: states.pending,
			user: {
				idUser: 0,
				username: "Invitado"
			},
			createdAt : firebase.firestore.FieldValue.serverTimestamp(),
			updatedAt : firebase.firestore.FieldValue.serverTimestamp()
		};
		return newTodo;
	},
	LoadTableTodo: function(){
		let self = this;
		db.collection(this.collection).orderBy("updatedAt", "desc").onSnapshot((query) =>{
			const tbody = document.getElementById(self.idTblTodo).querySelector("tbody");
			tbody.innerHTML = "";
			query.forEach(element => {
				tbody.insertAdjacentHTML('beforeend', TodoTemplate.GetTemplate(element.id, element.data()));
			});
		});
	},
	UpdateTodo: function(idTodo, todo){
		todo.state = states.pending;
		todo.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
		db.collection(this.collection).doc(idTodo).update(
			todo
		).then(() => {
			Alert.Show({ 
				message: "ToDo actualizado correctamente.", 
				type: Alert.types.success
			});
		}).catch((error) => {
			Alert.Show({
				message: "No se pudo actualizar el ToDo.", 
				type: Alert.types.danger
			});
		});
	},
	RemoveTodo: function(idTodo)
	{
		db.collection(this.collection).doc(idTodo).delete().then(() => {
			Alert.Show({
				message: "ToDo eliminado correctamente.", 
				type: Alert.types.success
			});
		}).catch((error) => {
			Alert.Show({
				message: "No se pudo eliminar el ToDo.", 
				type: Alert.types.danger
			});
		});
	},
	UpdateState: function(idTodo, idState)
	{
		let newState = Object.values(states).find(t => t.id == idState);
		let todo = {};
		todo.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
		todo.state = newState;
		db.collection(this.collection).doc(idTodo).update(todo);
	},
	InitFilters: function()
	{
		//Filtro de estados
		let cbState = document.getElementById('sch-cb-state');
		for (let index = 0; index < Object.values(states).length; index++) {
			const element = Object.values(states)[index];
			const option = document.createElement("option");
			option.value = element.id;
			option.text = element.description;
			cbState.add(option);
		}
		M.FormSelect.init(cbState);
	},
	SearchTodo: function()
	{
		let self = this;
		let statesSch = M.FormSelect.getInstance(document.getElementById('sch-cb-state')).getSelectedValues();
		let statesObjSch = [];
		for (let index = 0; index < statesSch.length; index++) {
			const element = statesSch[index];
			if(element == "")
				continue;
			let state = Object.values(states).find(t => t.id == element);
			statesObjSch.push(state);
		}
		statesObjSch = statesObjSch.length > 0 ? statesObjSch : Object.values(states);
		//let txtTodoSearch = document.getElementById(this.idtxtSearch).value;
		let todosRef = db.collection(this.collection).orderBy("updatedAt", "desc").where("state", "in", statesObjSch);
		todosRef.onSnapshot((query) =>{
			const tbody = document.getElementById(self.idTblTodo).querySelector("tbody");
			tbody.innerHTML = "";
			query.forEach(element => {
				//Aplicar filtro de description
				if(self.txtSearch == "" || element.data().description.includes(self.txtSearch))
					tbody.insertAdjacentHTML('beforeend', self.GetTemplate(element.id, element.data()));
			});
		});
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
		document.getElementById(this.idLabel).textContent = "Nuevo ToDo";
		this.Clean();
		this.Open();
	},
	EditTodo: function(idTodo)
	{
		let self = this;
		db.collection(TodoTemplate.collection)
		.doc(idTodo)
		.get()
		.then((docRef) => { 
			let data = docRef.data();
			self.idTodo = idTodo;
			self.txtTodo = data.description;
			document.getElementById(this.idLabel).textContent = "Editar ToDo";
			self.Open();
		});
	},
	Open : function(){
		//Mostrar el formulario para crear el todo 
		document.getElementById(this.idFrm).hidden = false;
	},
	Close : function(){
		this.Clean();
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
				let todo = TodoTemplate.GetNewTodo(self.txtTodo);
				db.collection(TodoTemplate.collection).doc().set(todo);
				Alert.Show({
					message: "ToDo registrado correctamente.", 
					type: Alert.types.success
				});
			}
			else{
				let todo = {};
				todo.description = self.txtTodo;
				TodoTemplate.UpdateTodo(self.idTodo, todo);
			}
			self.Close();
		}
		else
			Alert.Show({ 
				message: "Ingrese la descripción del ToDo.", 
				type: Alert.types.danger
			});
	}
}

/**
 * Al iniciar el documento, ejecutar
 * @author Ronald Meneses
 */
document.body.onload = async function()
{
	//Obtener los estados de la base para validar contra la información que tiene la propiedad del todo
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