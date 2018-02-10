
// inicio de la base de datos y declaracion de variables globales
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var dataBase = null;
var dato_dni, dato_name, dato_surname, dato_id =null;

function startDB() {

        dataBase = indexedDB.open("object", 1);

    dataBase.onupgradeneeded = function (e) {

        var active = dataBase.result;
        var object = active.createObjectStore("people", {keyPath: 'id', autoIncrement: true});
        object.createIndex('by_name', 'name', {unique: false});
        object.createIndex('by_dni', 'dni', {unique: true});
    
    };

    dataBase.onsuccess = function (e) {
        //    alert('Database loaded');
        loadAll();
    };

    dataBase.onerror = function (e) {
        alert('Error loading database');
    };

}

    function add() {
        var active = dataBase.result;
        var data = active.transaction(["people"], "readwrite");
        var object = data.objectStore("people");
    
        dato_dni=document.querySelector("#dni").value;
        dato_name=document.querySelector("#name").value;
        dato_surname=document.querySelector("#surname").value;
        if (dato_dni!=="" && dato_name!=="") {
            var request = object.add({
            dni: dato_dni,
            name: dato_name,
            surname: dato_surname
            });
        request.onerror = function (e) {
            alert(request.error.name + '\n\n' + request.error.message);
        };
            
        }
        else{
            if (dato_dni==="") {
                alert("debe ingresar el DNI");
                document.querySelector("#dni").focus();
                return;
            }
            else{
                alert("debe ingresar el nombre");
                document.querySelector("#name").focus();
                return;
            }
        }


        data.oncomplete = function (e) {
            document.querySelector('#dni').value = '';
            document.querySelector('#name').value = '';
            document.querySelector('#surname').value = '';
        
            alert('Object successfully added');
            loadAll();
        };

    }

    function deleteId(id) {
        if (confirm("estas seguro?")) {
        var active = dataBase.result;
        var data = active.transaction(["people"], "readwrite");
        var object = data.objectStore("people");
        
        var request = object.delete(id);

            request.onsuccess = function () {
    
                alert("Elemento borrado");
                loadAll();
            };
        }
    }
    
    function load(id) {
        var active = dataBase.result;
        var data = active.transaction(["people"], "readonly");
        var object = data.objectStore("people");

        var request = object.get(parseInt(id));

        request.onsuccess = function () {
        var result = request.result;

        if (result !== undefined) {
            alert("ID: " + result.id + "\n\
                    DNI " + result.dni + "\n\
                    Name: " + result.name + "\n\
                    Surname: " + result.surname);
            }
        };
    }

    function loadByDni(dni) {
        var active = dataBase.result;
        var data = active.transaction(["people"], "readonly");
        var object = data.objectStore("people");
        var index = object.index("by_dni");
        var request = index.get(String(dni));

        request.onsuccess = function () {
        var result = request.result;
            document.querySelector('#dni').value = result.dni;
            document.querySelector('#name').value = result.name;
            document.querySelector('#surname').value = result.surname;
        };
    }
   
    function actualizar(dato_id){
        
        var active = dataBase.result;
        var data = active.transaction(["people"], "readwrite");
        var object = data.objectStore("people");
        var request = object.get(dato_id);
        
        request.onsuccess=function(){
        var result = request.result;
        var dato_dni=document.querySelector("#dni").value;
        var dato_name=document.querySelector("#name").value;
        var dato_surname=document.querySelector("#surname").value;
        
        
        result.dni = dato_dni;
        result.name =dato_name;
        result.surname =dato_surname;
         var resultUpdate=object.put(result);
         resultUpdate.onsuccess=function(){
             alert("actualizado correctamente");
              $("#oculto").html('');
             loadAll();
             limpiar();
         };
        };
        
    }
    function mostrarId(id) {
        var active = dataBase.result;
        var data = active.transaction(["people"], "readonly");
        var object = data.objectStore("people");
        var request = object.get(id);

        request.onsuccess = function () {
            var result = request.result;
            // mostramos los datos para su edicion
            document.querySelector('#id').value = result.id;
            document.querySelector('#dni').value = result.dni;
            document.querySelector('#name').value = result.name;
            document.querySelector('#surname').value = result.surname;
            // mostramos un boton para Actualizar y desabilitamos el boton guardar
            $("#oculto").html('<input type="button" onclick="actualizar('+result.id+')" value="Actualizar">');
            $("#save").css({'display':'none'});
            loadAll();
            // $("#cajaRegistro").css("display", "block"); 
        };
    }
    
    function loadAll() {
        var active = dataBase.result;
        var data = active.transaction(["people"], "readonly");
        var object = data.objectStore("people");

        var elements = [];

        object.openCursor().onsuccess = function (e) {

        var result = e.target.result;

        if (result === null) {
            return;
        }

        elements.push(result.value);
            result.continue();

        };

        data.oncomplete = function () {

            var outerHTML = '';

            for (var key in elements) {

                outerHTML += '\n\
                    <tr>\n\
                    <td>' + elements[key].dni + '</td>\n\
                    <td>' + elements[key].name + '</td>\n\
                    <td>' + elements[key].surname + '</td>\n\
                    <td> <input type="button" onclick="load(' + elements[key].id + ')" value="Detalle"></td>\n\
                    <td> <input type="button" onclick="mostrarId('+elements[key].id+')" value="Editar"></t>\n\
                    <td> <input type="button" onclick="deleteId(' + elements[key].id + ')" value="Eliminar"></td>\n\
                    </tr>';

            }
            elements = [];
            document.querySelector("#elementsList").innerHTML = outerHTML;
        };
    }
            
    function loadAllByName() {
        var active = dataBase.result;
        var data = active.transaction(["people"], "readonly");
        var object = data.objectStore("people");
        var index = object.index("by_name");
                
        var elements = [];

        index.openCursor().onsuccess = function (e) {

            var result = e.target.result;

            if (result === null) {
                        return;
            }

            elements.push(result.value);
            result.continue();

        };

        data.oncomplete = function () {

            var outerHTML = '';

            for (var key in elements) {

                outerHTML += '\n\
                    <tr>\n\
                        <td>' + elements[key].dni + '</td>\n\
                        <td>' + elements[key].name + '</td>\n\
                        <td>' + elements[key].surname + '</td>\n\
                        <td>\n\
                            <input type="button" onclick="load(' + elements[key].id + ')" value="Details">\n\
                            <input type="button" onclick="updateId(' + elements[key].id + ')" value="Det DNI">\n\
                            <input type="button" onclick="deleteId(' + elements[key].id + ')" value="Delete">\n\
                    </td>\n\
                    </tr>';

            }

            elements = [];
            document.querySelector("#elementsList").innerHTML = outerHTML;
        };
    }
  
    function limpiar(){
        var $=document.getElementById.bind(document);
        $("id").value="";
        $("dni").value='';
        $("name").value='';
        $("surname").value='';
    }
