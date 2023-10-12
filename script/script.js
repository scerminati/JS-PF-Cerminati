inicio();

function inicio() {
  //Levantar elementos del DOM
  usuario = document.getElementById("usuario");
  oponente = document.getElementById("oponente");
  inventarioHTML = document.getElementById("inventarioHTML");
  pergamino = document.getElementById("pergamino");
  detalles = document.getElementById("detalles");
  mostrarDetalles = document.getElementById("mostrarDetalles");
  scrollDiv = document.getElementById("scroll");
  sendEmail = document.getElementById("sendEmail");
  ordenarDiv = document.getElementById("ordenarDiv");

  pergamino.innerHTML = "";
  titulo = crearElemento("titulo", "h3", pergamino, "");
  texto = crearElemento("texto", "p", pergamino, "");
  input = crearElemento("input", "input", pergamino, "oculto");
  input.placeholder = "Introduce tu nombre";
  personajesHTML = crearElemento("personajesHTML", "div", pergamino, "oculto");
  botonera = crearElemento("botonera", "div", pergamino, "");

  //Inicialización de parámetros, en 0 o traidos de Local Storage
  usuario.classList.add("oculto");
  oponente.classList.add("oculto");
  detalles.classList.add("oculto");
  personajesHTML.classList.add("oculto");
  bandera = 0;
  nombre = "";
  terminacion = localStorage.getItem("terminacion") || "";
  arma = Number(localStorage.getItem("arma")) || 0;
  armaAEncontrar = localStorage.getItem("armaAEncontrar") || "";
  armaTexto = localStorage.getItem("armaTexto") || "";
  muestraDetalle = false;
  salir = false;
  muerte = false;
  victoria = false;
  statsOLogros = false;
  turno = "";
  turnoContador = Number(localStorage.getItem("turnoContador")) || 0;
  logBruja = JSON.parse(localStorage.getItem("logBruja")) || [];
  turnoHuida = Number(localStorage.getItem("turnoHuida")) || 0;
  logDragon = JSON.parse(localStorage.getItem("logDragon")) || [];
  logrosTotales = Number(localStorage.getItem("logrosTotales")) || 0;
  puntaje = Number(localStorage.getItem("puntaje")) || 0;
  logros = JSON.parse(localStorage.getItem("logros")) || [
    `<br>- *`,
    `<br>- *`,
    `<br>- *`,
    `<br>- *`,
    `<br>- *`,
    `<br>- *`,
  ];
  logrosID = JSON.parse(localStorage.getItem("logrosID")) || [
    false,
    false,
    false,
    false,
    false,
    false,
  ];
  index = localStorage.getItem("index") || -1;
  id = JSON.parse(localStorage.getItem("id")) || -1;
  idActual = localStorage.getItem("idActual") || -1;
  creacionPersonaje = false;

  fetch("./json/bruja.json")
    .then((respuesta) => respuesta.json())
    .then((brujaJson) => {
      bruja = JSON.parse(localStorage.getItem("bruja")) || brujaJson;
    })
    .catch(catchError);

  fetch("./json/dragon.json")
    .then((respuesta) => respuesta.json())
    .then((dragonJson) => {
      dragon = JSON.parse(localStorage.getItem("dragon")) || dragonJson;
    })
    .catch(catchError);

  fetch("./json/mensajeBruja.json")
    .then((respuesta) => respuesta.json())
    .then((mensajeB) => {
      mensajeBruja = mensajeB;
    })
    .catch(catchError);

  fetch("./json/mensajeDragon.json")
    .then((respuesta) => respuesta.json())
    .then((mensajeD) => {
      mensajeDragon = mensajeD;
    })
    .catch(catchError);

  creacionAdicionales();
  cargandoTexto(false);
  muestraDetalle = false;
  resetBotonera();

  comienzo = Date.parse(localStorage.getItem("comienzo")) || new Date();
  correoEnviado = false;

  if (idActual == -1) {
    //Inicio de selección de personaje
    cargandoTexto(true);
    fetch("./json/cordialidad.json")
      .then((respuesta) => respuesta.json())
      .then((cordialidad) => {
        muestraDetalle = false;
        resetBotonera();
        titulo.innerText = `Selección de Personaje`;
        texto.innerHTML = `¡Una cordial bienvenida!<br><br>Quisiera saber como puedo dirigirme a ti, ¿puedo llamarte Sir? ¿O debo llamarte Lady? Quizás simplemente debería pedirte el nombre, pero aquí en este reino tenemos esto tan cordial... tu dime.<br><br>Selecciona la opción que más te guste.`;

        for (let index = 0; index < cordialidad.length; index++) {
          crearBoton(cordialidad[index].titulo, () =>
            setNombre(cordialidad, index)
          );
        }
      })
      .catch(catchError);
  } else {
    //Carga de elementos guardados en Local Storage
    caminos = JSON.parse(localStorage.getItem("caminos"));
    inventario = JSON.parse(localStorage.getItem("inventario"));
    healthBase = Number(localStorage.getItem("healthBase"));
    usuario.classList.remove("oculto");
    usuario.innerHTML = localStorage.getItem("usuarioImagen");
    personajesHTML.classList.add("oculto");
    usuario.addEventListener("click", mostrarInventario);
    creacionPersonaje = true;
    console.log(JSON.stringify(caminos));
    inputChecker(caminos);
  }
}

function setNombre(cordialidad, id) {
  //Función luego de elegir cordialidad, creación de botones y cambio de texto
  nombre = cordialidad[id].titulo;
  sexo = cordialidad[id].sexo;
  terminacion = "o";
  if (id == 4) {
    nombre = "";
    texto.innerHTML = `De acuerdo, no utilizaré ningún título para dirigirme a ti.`;
  } else {
    sexo == "f" && (terminacion = "a");
    localStorage.setItem("terminacion", terminacion);
    nombre += " ";
    texto.innerHTML = `¡Este es un buen comienzo! Bienvenid${terminacion}, ${nombre}.`;
  }

  texto.innerHTML += `<br><br>Introduce tu nombre aquí debajo. ¡No te preocupes! No estarás firmando ningún contrato...<br><br>Por ahora.`;
  input.classList.remove("oculto");
  input.maxLength = 14 - nombre.length;
  resetBotonera();
  crearBoton("Borrar", () => {
    input.value = "";
  });
  crearBoton("Enviar", enviarInput);
  input.addEventListener("keyup", (e) => {
    e.key === "Enter" && enviarInput();
  });
  input.addEventListener("change", enviarInput);
}

function enviarInput() {
  //Recibe input de nombre para realizar guardado de datos.
  bandera++;
  if (input.value != "") {
    let nombreMayus = input.value.toLowerCase();
    nombreMayus = nombreMayus.replace(
      nombreMayus[0],
      nombreMayus[0].toUpperCase()
    );
    nombre += nombreMayus;
    texto.innerHTML = `¡${nombre}! ¡Muchas gracias por confiarme tu nombre! Ya el pueblo comienza a nombrarte, parece que en tus tierras eres famos${terminacion}.`;
  } else {
    texto.innerHTML = `¡No quieras escaparte de mi! Necesito tu nombre, prometo que no es para realizar un hechizo.<br><br>Por favor, introduce tu nombre.`;
  }

  if (bandera == 3 && input.value == "") {
    nombre += `Anónim${terminacion}`;
    registroLogro("Nombre");
    texto.innerHTML = `Parece que no confias en mi, no estamos empezando bien entonces. Te llamaré de ahora en más ${nombre}. Tu nombre no es tan conocido en el reino, y a medida que se esparce la voz, generas desconfianza entre la gente.`;
  }
  if (input.value != "" || bandera == 3) {
    input.classList.add("oculto");
    resetBotonera();
    input.value = "";

    texto.innerHTML += `<br><br>Por último, deberás escoger una raza. Dime, ¿con cuál de las siguientes razas crees que te identificas más?`;
    //Búsqueda de personajes en archivo json, con el fin de crear botones para cada raza.
    cargandoTexto(true);
    fetch("./json/personajes.json")
      .then((respuesta) => respuesta.json())
      .then((personajes) => {
        muestraDetalle = false;
        resetBotonera();
        personajes.forEach((personaje) => {
          let razaP = personaje.raza;
          razaP = razaP.toLowerCase();
          let sexoP = ["m", "f"];
          personaje.imagen = [];
          for (let index = 0; index < sexoP.length; index++) {
            personaje.imagen[index] = {
              sexo: sexoP[index],
              ruta: `<img src="./images/${razaP}${sexoP[index]}.png" />`,
            };
          }
          switch (personaje.raza) {
            case "Humano":
              personaje.armaTexto = "Una Espada";
              personaje.armaAEncontrar = "Espada";
              break;
            case "Elfo":
              personaje.armaTexto = "Un arco y flechas";
              personaje.armaAEncontrar = "Arco y Flechas";
              break;
            case "Mago":
              personaje.armaTexto = "Un báculo";
              personaje.armaAEncontrar = "Báculo";
              break;
            case "Orco":
              personaje.armaTexto = "Una maza";
              personaje.armaAEncontrar = "Maza";
              break;
          }
        });

        let categoriaRazas = [];
        personajes.forEach((personaje) => {
          !categoriaRazas.includes(personaje.raza) &&
            categoriaRazas.push(personaje.raza);
        });

        for (let index = 0; index < categoriaRazas.length; index++) {
          crearBoton(categoriaRazas[index], () =>
            seleccionarRaza(categoriaRazas[index], personajes)
          );
        }
      })
      .catch(catchError);
  }
}

function seleccionarRaza(razaSeleccionada, personajes) {
  //Selección de clase del personaje dentro del array de posibilidades de la raza.
  let razaPersonaje = personajes.filter(
    (personaje) => personaje.raza == razaSeleccionada
  );
  resetBotonera();
  texto.innerHTML = `Haz escogido la raza ${razaPersonaje[0].raza}. A continuación las clases más comunes de esta raza. Debes escoger uno para continuar.`;
  let personajesAElegir = "";
  personajesHTML.classList.remove("oculto");
  idActual = 0;
  detalles.classList.remove("oculto");
  detalles.classList.remove("detalleInv");
  detalles.classList.add("detalleFirst");
  personajesHTML.innerHTML = "";
  razaPersonaje.forEach((personaje) => {
    personajesAElegir = "";
    let personajeCaja = crearElemento("", "div", personajesHTML, "");
    for (const propiedad in personaje) {
      if (propiedad == "clase") {
        personajesAElegir += `<center><b>${personaje[propiedad]}</b></center>`;
      } else if (
        propiedad != "clase" &&
        propiedad != "raza" &&
        propiedad != "imagen" &&
        propiedad != "armaAEncontrar" &&
        propiedad != "armaTexto"
      ) {
        personajesAElegir += `<b>${propiedad.replace(
          propiedad[0],
          propiedad[0].toUpperCase()
        )}:</b> ${personaje[propiedad]}<br>`;
      }
    }
    personajeCaja.innerHTML = personajesAElegir;
  });
  razaPersonaje.forEach((personaje) => {
    crearBoton(personaje.clase, () =>
      realizarInventario(razaPersonaje, personaje.clase)
    );
  });
}

function realizarInventario(razaPersonaje, personajeEscogido) {
  //Creación de inventario de usuario y fetch de archivo de caminos, con modificación del mismo acorde a lo seleccionado.
  let usuarioEscogido = razaPersonaje.find(
    (personaje) => personaje.clase === personajeEscogido
  );
  let imagenPersonaje = usuarioEscogido.imagen.find(
    (imagen) => imagen.sexo === sexo
  );
  inventario = {
    nombre,
    raza: usuarioEscogido.raza,
    clase: usuarioEscogido.clase,
    vida: usuarioEscogido.vida,
    iniciativa: usuarioEscogido.iniciativa,
    combate: usuarioEscogido.combate,
    defensa: usuarioEscogido.defensa,
    armas: "-",
    herramientas: "-",
    monedas: 0,
  };
  healthBase = inventario.vida;
  armaAEncontrar = usuarioEscogido.armaAEncontrar;
  armaTexto = usuarioEscogido.armaTexto;
  creacionPersonaje = true;

  detalles.classList.add("detalleInv");
  detalles.classList.remove("detalleFirst");
  detalles.classList.add("oculto");
  usuario.classList.remove("oculto");
  usuario.innerHTML = imagenPersonaje.ruta;
  resetBotonera();
  personajesHTML.classList.add("oculto");
  usuario.addEventListener("click", mostrarInventario);
  id = [0];
  index = 0;
  idActual = 0;
  cargandoTexto(true);
  fetch("./json/caminos.json")
    .then((respuesta) => respuesta.json())
    .then((caminos) => {
      muestraDetalle = false;
      resetBotonera();
      do {
        caminos.forEach((camino) => {
          camino.descripcion = camino.descripcion.replace(
            "*codigo.nombre",
            inventario.nombre
          );
          camino.descripcion = camino.descripcion.replace(
            "*codigo.raza",
            inventario.raza
          );
          camino.descripcion = camino.descripcion.replace(
            "*codigo.terminacion",
            terminacion
          );
          camino.descripcion = camino.descripcion.replace(
            "*codigo.arma",
            armaTexto
          );
        });
      } while (
        caminos.some((camino) => camino.descripcion.includes("*codigo."))
      );

      //Seteo de los Local Storages
      localStorage.setItem("comienzo", comienzo);
      localStorage.setItem("healthBase", healthBase);
      localStorage.setItem("armaAEncontrar", armaAEncontrar);
      localStorage.setItem("armaTexto", armaTexto);
      localStorage.setItem("usuarioImagen", imagenPersonaje.ruta);

      setStorage(caminos);
      inputChecker(caminos);
    })
    .catch(catchError);
}

function setStorage(caminos) {
  localStorage.setItem("puntaje", puntaje);
  localStorage.setItem("logrosTotales", logrosTotales);
  localStorage.setItem("logros", JSON.stringify(logros));
  localStorage.setItem("logrosID", JSON.stringify(logrosID));
  localStorage.setItem("inventario", JSON.stringify(inventario));
  localStorage.setItem("caminos", JSON.stringify(caminos));
  localStorage.setItem("id", JSON.stringify(id));
  localStorage.setItem("index", index);
  localStorage.setItem("idActual", idActual);
}

function crearBoton(parametro, funcionPasada) {
  //Permite crear botones, pasando parámetro (palabra del botón) y función. Adicionalmente si es solo el botón siguiente, crea el focus.
  window["boton" + parametro] = crearElemento(
    parametro.toLowerCase(),
    "button",
    botonera,
    ""
  );
  window["boton" + parametro].innerText = parametro;
  window["boton" + parametro].addEventListener("click", funcionPasada);
  parametro == "Siguiente" && window["boton" + parametro].focus();
}

function mostrarInventario() {
  //Manejo de DOM para ver el inventario del usuario.
  if (!muestraDetalle) {
    ocultarInventario();
    inventarioHTML.innerHTML = "";
    inventarioTitulo = crearElemento(
      "inventarioTitulo",
      "h3",
      inventarioHTML,
      ""
    );
    inventarioTitulo.innerText = "Inventario";
    inventarioHTML.innerHTML += `<br>`;
    inventarioDivFlex = crearElemento(
      "inventarioDivFlex",
      "div",
      inventarioHTML,
      "flexInv"
    );
    titulosAMostrar = crearElemento(
      "titulosAMostrar",
      "div",
      inventarioDivFlex,
      ""
    );

    for (const propiedad in inventario) {
      titulosAMostrar.innerHTML += `<b>${propiedad.replace(
        propiedad[0],
        propiedad[0].toUpperCase()
      )}:</b></br>`;
    }
    titulosAMostrar.innerHTML += `<br>`;

    propiedadesAMostrar = crearElemento(
      "propiedadesAMostrar",
      "div",
      inventarioDivFlex,
      "right"
    );
    for (const propiedad in inventario) {
      propiedadesAMostrar.innerHTML += `${inventario[propiedad]}</br>`;
    }
    propiedadesAMostrar.innerHTML += `<br>`;

    botonInventario = crearElemento(
      "botonInventario",
      "button",
      inventarioHTML,
      ""
    );
    botonInventario.innerText = "Volver";
    botonInventario.addEventListener("click", ocultarInventario);
  }
}

function ocultarInventario() {
  //Manejo de DOM para ocultar inventario.
  inventarioHTML.classList.toggle("oculto");
  detalles.classList.toggle("oculto");
  pergamino.classList.toggle("blurPergamino");
  var nodes = botonera.getElementsByTagName("button");
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].disabled = !nodes[i].disabled;
  }
}

function registroLogro(id) {
  //Función que cuando es llamada registra el logro en el array correspondiente para el final del juego.
  switch (id) {
    case "Nombre":
      indice = 0;
      textoLogro = `No diste tu nombre al comienzo de la aventura.`;
      puntajeLogro = -5;
      break;
    case "Voces":
      indice = 1;
      textoLogro = `Has seguido las voces del bosque.`;
      puntajeLogro = 5;
      break;
    case "Bruja":
      indice = 2;
      textoLogro = `Has derrotado a la bruja de la cabaña.`;
      puntajeLogro = 20;
      break;
    case "Arma":
      indice = 3;
      textoLogro = `Encontraste un arma secreta en el fondo del lago.`;
      puntajeLogro = 20;
      break;
    case "Puente":
      indice = 4;
      textoLogro = `Lograste cruzar el puente sin recibir daño.`;
      puntajeLogro = 10;
      break;
    case "Dragón":
      indice = 5;
      textoLogro = `Derrotaste exitósamente al dragón.`;
      puntajeLogro = 35;
      break;
  }
  if (!logrosID[indice]) {
    logros[indice] = logros[indice].replace(`*`, textoLogro);
    logrosTotales++;
    puntaje += puntajeLogro;
    logrosID[indice] = true;
  }
}

function resetBotonera() {
  botonera.innerHTML = "";
}

function inputChecker(arrayInput) {
  //Manejo de caminos, seteo de storage y variables a manejar dentro de la función.
  resetBotonera();
  setStorage(arrayInput);
  titulo.innerText = arrayInput[index].categoria;
  idACambiar = -1;
  chequeoInput = false;
  eliminar = false;
  antesDeLogica = false;
  divToAppend = false;
  arma = false;
  textoAdicional = "";
  descripcionEspecial = "";
  oponente.classList.add("oculto");
  cargandoTexto(true);
  /*
  Este archivo busca los IDs que corresponden a mostrar imágenes del oponente, así mismo permite correr el resto del código de manera asincrónica.
  */
  fetch("./json/oponenteIds.json")
    .then((respuesta) => respuesta.json())
    .then((oponenteIds) => {
      muestraDetalle = false;
      resetBotonera();
      oponenteIds.forEach((idConOponente) => {
        idConOponente.oponente = idConOponente.oponente.replace(
          "*codigo.bruja",
          JSON.stringify(bruja)
        );
        idConOponente.oponente = idConOponente.oponente.replace(
          "*codigo.dragon",
          JSON.stringify(dragon)
        );
        idConOponente.oponente = JSON.parse(idConOponente.oponente);
      });
      for (const propiedad in oponenteIds) {
        if (
          oponenteIds[propiedad].id == idActual &&
          oponenteIds[propiedad].oponente.vida > 0
        ) {
          oponente.classList.remove("oculto");
          imagenOpo = oponenteIds[propiedad].oponente.ruta;
          oponente.innerHTML = imagenOpo;
        }
      }

      //Chequea si el objeto correspondiente a camino tiene "especial", los distintos eventos del juego.
      if (arrayInput[index].especial != undefined) {
        /*
        El switch permite realizar los distintos eventos especiales, corrigiendo "caminos" si es necesario, con la lógica integrada posteriormente.
        */
        switch (arrayInput[index].especial) {
          case "Voces":
            inventario.vida -= 1;
            tostada(1);
            registroLogro("Voces");
            inventario.vida <= 0 &&
              (arrayInput[index].nextid[0] = arrayInput[index].nextid[1]);

            break;
          case "Monedas":
            inventario.monedas += 10;
            descripcionEspecial = `Ya exploraste este lugar, te recomiendo que busques en otro lado.`;
            idACambiar = arrayInput[index].id;
            eliminar = true;

            break;
          case "Combate Bruja":
            textoAdicional = "";
            textoAdicional =
              mensajeBruja[Math.floor(Math.random() * mensajeBruja.length)];
            adicional = combate(bruja);
            logBruja.push(turno);
            textoAdicional += `<br><br>La bruja tiene ${bruja.vida} puntos de vida. ${adicional}`;
            localStorage.setItem("logBruja", JSON.stringify(logBruja));
            localStorage.setItem("bruja", JSON.stringify(bruja));
            localStorage.setItem("turnoContador", turnoContador);
            if (muerte) {
              arrayInput[index].nextid[0] = arrayInput[index].nextid[1];
            } else if (victoria) {
              arrayInput[index].nextid[0] = arrayInput[index].nextid[2];
              victoria = false;
              registroLogro("Bruja");
              eliminar = true;
              idACambiar = 1.3;
              descripcionEspecial = `Ya has derrotado a la bruja, no hay nada más que ver aquí`;
              modificarNextId(arrayInput, idACambiar, [1.21]);
              turno = "";
              turnoContador = 0;
              inventario.combate += 2;
              inventario.vida = healthBase + 5;
              healthBase = inventario.vida;
              localStorage.removeItem("logBruja");
              localStorage.removeItem("turno");
              localStorage.removeItem("bruja");
              localStorage.removeItem("turnoContador");
            }
            break;
          case "Log Bruja":
            if (turno != "") {
              antesDeLogica = true;
              descripcionEspecial =
                arrayInput[index].descripcion + `<br>` + turno;
              idACambiar = arrayInput[index].id;
              turno = "";
            }
            break;
          case "Vendedor":
            if (inventario.monedas == 10) {
              arrayInput[index].nextid[0] = arrayInput[index].nextid[1];
              puntaje += 10;
              inventario.monedas -= 10;
            }
            break;
          case "Soga":
            idACambiar = 3.2;
            descripcionEspecial = `"Buenos días, ${inventario.nombre}, recuerde que ya no tengo nada para ofrecerle. Solo quería entablar una conversación con usted. ¿Qué va a hacer usted hoy en este maravilloso día?"`;
            eliminar = true;
            modificarNextId(arrayInput, idACambiar, [3.1]);
            inventario.herramientas = "Soga";
            break;
          case "Arma":
            arma = true;
            divToAppend = document.createElement("div");
            divToAppend.id = "aguaID";
            divToAppend.classList.add("agua");
            let armaEscondida = crearElemento(
              "armaEscondida",
              "div",
              divToAppend,
              ""
            );
            armaEscondida.addEventListener("click", () => {
              idACambiar = 3.6;
              respirar = 0;
              localStorage.setItem("respirar", respirar);
              modificarNextId(arrayInput, idACambiar, [3.7]);
              nextIndex(arrayInput, 0);
              inputChecker(arrayInput);
            });

            break;
          case "Respiración":
            respirar = localStorage.getItem("respirar");
            texto.classList.add("center");
            for (let i = 0; i < respirar; i++) {
              textoAdicional += `<br><br>...`;
            }
            respirar++;
            localStorage.setItem("respirar", respirar);
            if (respirar == 3) {
              arrayInput[index].nextid[0] = arrayInput[index].nextid[1];
              localStorage.removeItem("respirar");
            }
            break;
          case "Log Arma":
            texto.classList.remove("center");
            registroLogro("Arma");
            inventario.armas = armaAEncontrar;
            idACambiar = 3.6;
            descripcionEspecial = `El agua ya no esconde ningún secreto, aunque se encuentra extremadamente plácida. Te quedas observándola unos minutos, pero sabes que debes regresar.`;
            eliminar = true;
            modificarNextId(arrayInput, idACambiar, [3.1]);
            modificarNextId(arrayInput, 3.5, [3.1, 3.6]);
            inventario.combate += 5;
            break;
          case "Puente":
            if (inventario.herramientas == "Soga") {
              arrayInput[index].nextid[0] = arrayInput[index].nextid[1];
              registroLogro("Puente");
            } else {
              inventario.vida -= 3;
              tostada(3);
              inventario.vida <= 0 &&
                (arrayInput[index].nextid[0] = arrayInput[index].nextid[2]);
            }
            break;
          case "Combate Dragón":
            textoAdicional = "";
            textoAdicional =
              mensajeDragon[Math.floor(Math.random() * mensajeDragon.length)];
            adicional = combate(dragon);
            logDragon.push(turno);
            textoAdicional += `<br><br>El dragón tiene ${dragon.vida} puntos de vida. ${adicional}`;
            localStorage.setItem("logDragon", JSON.stringify(logDragon));
            localStorage.setItem("dragon", JSON.stringify(dragon));
            localStorage.setItem("turnoContador", turnoContador);
            if (muerte) {
              arrayInput[index].nextid[0] = arrayInput[index].nextid[1];
            } else if (victoria) {
              arrayInput[index].nextid[0] = arrayInput[index].nextid[2];
              registroLogro("Dragón");
              localStorage.removeItem("logDragon");
              localStorage.removeItem("dragon");
              localStorage.removeItem("turnoContador");
            }
            break;
          case "Log Dragón":
            if (turno != "") {
              antesDeLogica = true;
              descripcionEspecial =
                arrayInput[index].descripcion + `<br>` + turno;
              idACambiar = arrayInput[index].id;
            }
            break;
          case "Huida":
            if (turnoHuida < 5 && inventario.vida > 0) {
              turnoHuida++;
              localStorage.setItem("turnoHuida", turnoHuida);
              let danoEscape = Math.floor(
                (Math.random() * 20 + dragon.combate) / 5
              );
              inventario.vida -= danoEscape;
              danoEscape > 0 && tostada(danoEscape);
            }

            if (inventario.vida <= 0 && turnoHuida <= 5) {
              arrayInput[index].nextid[0] = arrayInput[index].nextid[1];
              inventario.vida = 0;
              descripcionEspecial = `¡El dragón te ha derrotado! Te has quedado sin vida.<br><br><center>FIN DEL JUEGO.</center>`;
              antesDeLogica = true;
              idACambiar = 2.8;
            } else if (inventario.vida > 0 && turnoHuida <= 5) {
              descripcionEspecial =
                arrayInput[index].descripcion +
                `<br> Turno ${turnoHuida}: Tienes ${inventario.vida} puntos de vida.`;
              antesDeLogica = true;
              idACambiar = 2.8;
              if (turnoHuida == 5) {
                arrayInput[index].nextid[0] = arrayInput[index].nextid[2];
                puntaje += 10;
              }
            }
            break;
          case "Fin":
            salir = true;
            chequeoInput = true;
            final = new Date();
            break;
        }
        setStorage(arrayInput);
      }

      if (antesDeLogica) {
        //Permite modificar el array "caminos" antes de ser mostrado en pantalla.
        descripcionChecker(arrayInput, eliminar, idACambiar);
        localStorage.setItem("caminos", JSON.stringify(arrayInput));
      }

      if (arrayInput[index].input) {
        //Si input (más de una opción, como un prompt) es true, realizará los botones correspondientes
        texto.innerHTML = arrayInput[index].descripcion;
        for (let i = 0; i < arrayInput[index].cantidadOpciones; i++) {
          crearBoton(arrayInput[index].opciones[i], () => {
            if (!antesDeLogica) {
              //Permite modificar el array "caminos" luego de ser mostrados en pantalla, al presionar los botones.
              descripcionChecker(arrayInput, eliminar, idACambiar);
              localStorage.setItem("caminos", JSON.stringify(arrayInput));
            }
            //Presionar los botones (cualquiera de ellos), lleva a correr nuevamente la función con un nuevo id.
            nextIndex(arrayInput, i);
            inputChecker(arrayInput);
          });
        }
      } else {
        //Si input es falso (como si fuese un alert), lee descripción y crea un solo botón.
        texto.innerHTML = arrayInput[index].descripcion + textoAdicional;
        if (divToAppend != false) {
          //Creación del agua para encontrar el arma.
          texto.appendChild(divToAppend);
          if (arma) {
            let x =
              Math.round(Math.random() * (divToAppend.offsetWidth - 20)) + 5;
            let y =
              Math.round(Math.random() * (divToAppend.offsetHeight - 20)) + 5;
            armaEscondida.style.top = `${y}px`;
            armaEscondida.style.left = `${x}px`;
          }
        }
        crearBoton("Siguiente", () => {
          if (!salir) {
            if (!antesDeLogica) {
              //Permite modificar el array "caminos" luego de ser mostrados en pantalla, al presionar los botones.
              descripcionChecker(arrayInput, eliminar, idACambiar);
              localStorage.setItem("caminos", JSON.stringify(arrayInput));
            }
            //Presionar el botón, lleva a correr nuevamente la función con un nuevo id.
            nextIndex(arrayInput, 0);
            inputChecker(arrayInput);
          } else {
            //Lógica de finalización del juego.
            resetBotonera();
            for (let index = 0; index < logros.length; index++) {
              logros[index] = logros[index].replace(`*`, `LOGRO BLOQUEADO.`);
            }

            let tiempoTotal = final - comienzo;
            tiempoTotal = Math.round(tiempoTotal / 1000);
            let unidad = `segundos`;
            if (tiempoTotal > 120) {
              tiempoTotal = Math.round(tiempoTotal / 60);
              unidad = `minutos`;
            }
            texto.innerHTML = `${inventario.nombre} del reino ${
              inventario.raza
            }, aquí tus estadísticas de juego.<br><br>Has conseguido un puntaje total de ${puntaje}/100.<br><br>Logros obtenidos durante la aventura:<br>${logros.join(
              " "
            )}<br><br>Obtuviste un total de ${logrosTotales} de ${
              logros.length
            } logros.<br><br>El tiempo total de aventura fue de ${tiempoTotal} ${unidad}.`;

            localStorage.clear();
            if (puntaje == 100) {
              crearBoton("Siguiente", () => {
                texto.innerHTML = `¡JUEGO PERFECTO EN PUNTAJE! Felicidades, ${inventario.nombre} del reino ${inventario.raza}, tu nombre será recordado, y has sido nombrad${terminacion} el ${inventario.raza} más valiente de estos tiempos.`;
                resetBotonera();
                crearBoton("Siguiente", finDelJuego);
              });
            } else {
              crearBoton("Siguiente", finDelJuego);
            }
          }
        });
      }
    })
    .catch(catchError);
}

function nextIndex(arrayInput, numeroID) {
  //Retorna el próximo id a manejar en caminos.
  id = arrayInput[index].nextid;
  index = arrayInput.findIndex((camino) => {
    idActual = camino.id;
    return camino.id === id[numeroID];
  });
}

function descripcionChecker(arrayInput, eliminarEspecial, idACambiar) {
  //Borra el especial del id pasado.
  i = arrayInput.findIndex((camino) => {
    return camino.id == idACambiar;
  });

  if (descripcionEspecial != "") {
    arrayInput[i].descripcion = descripcionEspecial;
    eliminarEspecial && delete arrayInput[i].especial;
  }
}

function modificarNextId(arrayInput, nextIDacambiar, nextID) {
  //Modifica el próximo id de caminos
  i = arrayInput.findIndex((camino) => {
    return camino.id == nextIDacambiar;
  });
  arrayInput[i].nextid = nextID;
}

function catchError() {
  //Permite, en caso de que falle la traida de archivos json, resetear el juego a 0.
  resetBotonera();
  titulo.innerText = "Error";
  texto.innerText =
    "Error, puedes refrescar la página o reiniciar todo el juego.";
  crearBoton("Refrescar", () => {
    location.reload();
  });
  crearBoton("Reiniciar", () => {
    localStorage.clear();
    inicio();
  });
}

function cargandoTexto(fetch) {
  //Crea, en el div botonera o titulo, un cartel de cargando dinámico.
  let textoCargando = "Cargando...";
  muestraDetalle = true;
  if (fetch) {
    resetBotonera();
    cargando = crearElemento("", "div", botonera, "waviy");
    cargando.classList.add("waviyBut");
  } else {
    titulo.innerHTML = "";
    textoCargando = textoCargando.toUpperCase();
    cargando = crearElemento("", "div", titulo, "waviy");
  }
  for (let i = 0; i < textoCargando.length; i++) {
    let spanNuevo = crearElemento("", "span", cargando, "");
    let caracter = textoCargando.charAt(i);
    spanNuevo.innerHTML = caracter;
    spanNuevo.style = `--i:${i + 1}`;
  }
}

function finDelJuego() {
  //Envía correo con datos del jugador a casilla propia, y permite reiniciar el juego o ver estadísticas de usuarios anteriores.
  usuario.classList.remove("oculto");
  titulo.innerText = `Fin`;
  texto.innerHTML = `¡Muchas gracias por jugar! Tus datos se enviaron por correo a mi casilla. Puede que no aparezcan enseguida, pero no te preocupes, ¡en la próxima actualización podrás buscarte y compararte con el resto de los jugadores!<br><br>Puedes reiniciar el juego o ver las distintas estadísticas de previos jugadores.`;
  if (!correoEnviado) {
    cargandoTexto(true);
    correoEnviado = true;
    let templateParams = {
      nombre: inventario.nombre,
      raza: inventario.raza,
      clase: inventario.clase,
      healthBase,
      iniciativa: inventario.iniciativa,
      combate: inventario.combate,
      defensa: inventario.defensa,
      puntaje,
      logrosTotales,
      tiempo: Math.round((final - comienzo) / 1000),
    };

    emailjs
      .send(
        "service_wayf2g6",
        "template_46ks43j",
        templateParams,
        "OhrLN8D4Q7Jyx8Vle"
      )
      .then(
        function () {
          tostadaEmail(true);
        },
        function () {
          tostadaEmail(false);
        }
      )

      .finally(() => {
        muestraDetalle = false;
        resetBotonera();
        crearBoton("Reiniciar", inicio);
        crearBoton("Estadísticas", estadistica);
      });
  } else {
    resetBotonera();
    crearBoton("Reiniciar", inicio);
    crearBoton("Estadísticas", estadistica);
  }
}

function estadistica() {
  resetBotonera();
  usuario.classList.add("oculto");
  titulo.innerText = `Estadísticas`;
  texto.innerHTML = `Aquí encontrarás las estadísticas de otros jugadores. Puedes buscar por nombres, filtrar por razas, ¡y hasta ver los stats de otros jugadores! Abajo encontrarás tu posición resaltada de acuerdo a cómo quieres ordenar los datos.<br><br>`;

  ordenarDiv.innerHTML = "";
  ordenarTitulo = crearElemento("ordenarTitulo", "h3", ordenarDiv, "");
  ordenarTexto = crearElemento("ordenarTexto", "p", ordenarDiv, "");
  contenedor = crearElemento("contenedor", "div", ordenarDiv, "contenedor");
  columna1 = crearElemento("columna1", "div", contenedor, "columnaBotones");
  columna2 = crearElemento("columna2", "div", contenedor, "columnaBotones");
  botonesBuscador = crearElemento("botonesBuscador", "div", ordenarDiv, "");

  jugadorFinal = {
    nombre: inventario.nombre,
    raza: inventario.raza,
    clase: inventario.clase,
    vida: healthBase,
    iniciativa: inventario.iniciativa,
    combate: inventario.combate,
    defensa: inventario.defensa,
    puntaje: puntaje,
    logros: logrosTotales,
    tiempo: Math.round((final - comienzo) / 1000),
  };

  //Búsqueda de jugadores en archivo .json
  cargandoTexto(true);
  fetch("./json/jugadores.json")
    .then((respuesta) => respuesta.json())
    .then((jugadores) => {
      muestraDetalle = false;
      resetBotonera();
      jugadores.push(jugadorFinal);
      let tabla = crearElemento("", "div", texto, "tablaEstilo");

      //Sort jugadores por puntaje para poner en primera tabla.
      jugadores.sort(function (a, b) {
        return b.puntaje - a.puntaje;
      });

      for (let i = 0; i < jugadores.length; i++) {
        jugadores[i].num = i + 1;
      }

      jugadoresFiltrados = jugadores;
      coincide = true;

      crearTabla(tabla, jugadoresFiltrados, coincide);
      crearBoton("Volver", finDelJuego);

      //Ordenar modificará el orden de los jugadores según lo seleccionado.
      crearBoton("Ordenar", () => {
        ordenarDiv.classList.remove("oculto");
        pergamino.classList.toggle("blurPergamino");
        let nodes = botonera.getElementsByTagName("button");
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].disabled = !nodes[i].disabled;
        }
        ordenarTitulo.innerText = `Ordenar estadísticas`;
        ordenarTexto.innerText = `Selecciona como quieres ver las estadísticas de los jugadores.`;

        columna1.innerHTML = `De menor a mayor`;
        columna2.innerHTML = `De mayor a menor`;

        crearBotonOrdenar("Puntaje", false, tabla);
        crearBotonOrdenar("Logros", false, tabla);
        crearBotonOrdenar("Tiempo", false, tabla);
        crearBotonOrdenar("Vida", true, tabla);
        crearBotonOrdenar("Iniciativa", true, tabla);
        crearBotonOrdenar("Combate", true, tabla);
        crearBotonOrdenar("Defensa", true, tabla);
      });

      //Filtrar permitirá filtrar por razas.
      crearBoton("Filtrar", () => {
        jugadoresFiltrados = jugadores;
        ordenarDiv.classList.remove("oculto");
        pergamino.classList.add("blurPergamino");
        let nodes = botonera.getElementsByTagName("button");
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].disabled = !nodes[i].disabled;
        }
        ordenarTitulo.innerText = "Filtrar Estadísticas";
        ordenarTexto.innerText = `Selecciona la raza por la que quieres filtrar.`;
        columna1.innerHTML = `Raza a filtrar`;
        columna2.innerHTML = ``;
        let razaFiltro = [];
        jugadores.forEach((jugador) => {
          !razaFiltro.includes(jugador.raza) && razaFiltro.push(jugador.raza);
        });
        razaFiltro.push("Todos");
        for (let i = 0; i < razaFiltro.length; i++) {
          crearBotonFiltrar(jugadores, razaFiltro[i], tabla);
        }
      });

      //Buscar permite buscar nombres de jugadores.
      crearBoton("Buscar", () => {
        botonesBuscador.classList.remove("oculto");
        botonesBuscador.innerHTML = "";
        let anterior = jugadoresFiltrados;
        let anteriorCoincide = coincide;
        botonBuscar = crearElemento("", "button", botonesBuscador, "oculto");
        botonBuscar.innerText = "Buscar";

        ordenarDiv.classList.remove("oculto");
        pergamino.classList.add("blurPergamino");
        let nodes = botonera.getElementsByTagName("button");
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].disabled = !nodes[i].disabled;
        }
        ordenarTitulo.innerText = "Buscar por Nombre";
        ordenarTexto.innerText = `Encuentra el nombre que deseas buscar entre la base de datos de los jugadores.`;
        columna1.innerHTML = ``;
        columna2.classList.add("oculto");
        let jugadorBuscado = crearElemento(
          "",
          "input",
          columna1,
          "jugadorBuscado"
        );
        jugadorBuscado.placeholder = `Introduce aquí un nombre.`;

        let mostrarResultados = crearElemento(
          "",
          "div",
          columna1,
          "mostrarResultados"
        );

        jugadorBuscado.value = "";
        let jugadoresEncontrados = [];
        jugadorBuscado.addEventListener("input", () => {
          if (jugadorBuscado.value != "") {
            jugadoresEncontrados = jugadores.filter((jugador) =>
              jugador.nombre
                .toLowerCase()
                .includes(jugadorBuscado.value.toLowerCase())
            );

            limite = jugadoresEncontrados.length;
            limite > 5 && (limite = 5);
            mostrarResultados.innerHTML = ``;
            if (limite == 0) {
              mostrarResultados.innerText = `No se encontró ningún nombre que coincida`;
            } else {
              mostrarResultados.innerHTML = `Los nombres encontrados son:<br><br>`;
              for (let i = 0; i < limite; i++) {
                mostrarResultados.innerHTML += `${jugadoresEncontrados[i].nombre}<br>`;
              }
            }

            limite > 0
              ? botonBuscar.classList.remove("oculto")
              : botonBuscar.classList.add("oculto");
          } else {
            mostrarResultados.innerHTML = ``;
            botonBuscar.classList.add("oculto");
          }
        });

        botonBuscar.addEventListener("click", () => {
          botonesBuscador.classList.add("oculto");
          coincide = false;
          ordenarDiv.classList.add("oculto");
          columna2.classList.remove("oculto");
          pergamino.classList.remove("blurPergamino");
          let nodes = botonera.getElementsByTagName("button");
          for (let i = 0; i < nodes.length; i++) {
            nodes[i].disabled = !nodes[i].disabled;
          }
          jugadoresFiltrados = jugadoresEncontrados;
          for (let i = 0; i < jugadoresFiltrados.length; i++) {
            jugadoresFiltrados[i].num = i + 1;
            if (
              jugadoresFiltrados[i].nombre == jugadorFinal.nombre &&
              jugadoresFiltrados[i].tiempo == jugadorFinal.tiempo
            ) {
              coincide = true;
            }
          }

          tabla.innerHTML = "";
          crearTabla(tabla, jugadoresFiltrados, coincide);
        });

        botonVolver = crearElemento("", "button", botonesBuscador, "");
        botonVolver.innerText = "Volver";

        botonVolver.addEventListener("click", () => {
          botonesBuscador.classList.add("oculto");
          columna2.classList.remove("oculto");
          jugadoresFiltrados = anterior;
          coincide = anteriorCoincide;
          ordenarDiv.classList.add("oculto");
          pergamino.classList.remove("blurPergamino");
          let nodes = botonera.getElementsByTagName("button");
          for (let i = 0; i < nodes.length; i++) {
            nodes[i].disabled = !nodes[i].disabled;
          }
          tabla.innerHTML = "";
          crearTabla(tabla, jugadoresFiltrados, coincide);
        });
      });

      //Permite mostrar otros valores en la tabla.
      crearBoton("Stats", () => {
        statsOLogros = !statsOLogros;
        statsOLogros
          ? (window["botonStats"].innerText = "Puntaje")
          : (window["botonStats"].innerText = "Stats");

        tabla.innerHTML = "";
        crearTabla(tabla, jugadoresFiltrados, coincide);
      });
    })
    .catch(catchError);
}

function crearBotonFiltrar(jugadores, parametro, tabla) {
  window["boton" + parametro] = crearElemento(
    parametro.toLowerCase(),
    "button",
    columna1,
    ""
  );
  window["boton" + parametro].innerText = parametro;
  window["boton" + parametro].addEventListener("click", () => {
    coincide = false;
    if (parametro == "Todos") {
      coincide = true;
      for (let i = 0; i < jugadores.length; i++) {
        jugadores[i].num = i + 1;
      }
      ordenarDiv.classList.add("oculto");
      pergamino.classList.remove("blurPergamino");
      let nodes = botonera.getElementsByTagName("button");
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].disabled = !nodes[i].disabled;
      }
      tabla.innerHTML = "";
      crearTabla(tabla, jugadores, coincide);
    } else {
      columna2.HTML = ``;
      columna2.innerHTML = `Clase a filtrar`;
      let claseFiltro = ["Todos"];
      jugadores.forEach((jugador) => {
        if (!claseFiltro.includes(jugador.clase) && jugador.raza == parametro) {
          claseFiltro.push(jugador.clase);
        }
      });

      for (let i = 0; i < claseFiltro.length; i++) {
        window["boton" + claseFiltro[i]] = crearElemento(
          claseFiltro[i].toLowerCase(),
          "button",
          columna2,
          ""
        );
        window["boton" + claseFiltro[i]].innerText = claseFiltro[i];
        window["boton" + claseFiltro[i]].addEventListener("click", () => {
          if (claseFiltro[i] == "Todos") {
            jugadoresFiltrados = jugadores.filter(
              (jugador) => jugador.raza == parametro
            );
            jugadorFinal.raza == parametro && (coincide = true);
          } else {
            jugadoresFiltrados = jugadores.filter(
              (jugador) => jugador.clase == claseFiltro[i]
            );
            if (
              jugadorFinal.clase == claseFiltro[i] &&
              jugadorFinal.raza == parametro
            ) {
              coincide = true;
            }
          }

          for (let i = 0; i < jugadoresFiltrados.length; i++) {
            jugadoresFiltrados[i].num = i + 1;
          }
          ordenarDiv.classList.add("oculto");
          pergamino.classList.remove("blurPergamino");
          let nodes = botonera.getElementsByTagName("button");
          for (let i = 0; i < nodes.length; i++) {
            nodes[i].disabled = !nodes[i].disabled;
          }
          tabla.innerHTML = "";
          crearTabla(tabla, jugadoresFiltrados, coincide);
        });
      }
    }
  });
}

function crearBotonOrdenar(parametro, prueba, tabla) {
  window["boton" + parametro + 1] = crearElemento(
    parametro.toLowerCase(),
    "button",
    columna1,
    ""
  );
  window["boton" + parametro + 2] = crearElemento(
    parametro.toLowerCase(),
    "button",
    columna2,
    ""
  );

  window["boton" + parametro + 1].innerText = parametro;
  window["boton" + parametro + 2].innerText = parametro;
  window["boton" + parametro + 1].addEventListener("click", () => {
    propiedad = parametro.toLowerCase();
    jugadoresFiltrados.sort(function (a, b) {
      return a[propiedad] - b[propiedad];
    });
    ordenarFunciones(prueba, tabla);
  });
  window["boton" + parametro + 2].addEventListener("click", () => {
    propiedad = parametro.toLowerCase();
    jugadoresFiltrados.sort(function (a, b) {
      return b[propiedad] - a[propiedad];
    });
    ordenarFunciones(prueba, tabla);
  });
}

function ordenarFunciones(prueba, tabla) {
  statsOLogros = prueba;
  statsOLogros
    ? (window["botonStats"].innerText = "Puntaje")
    : (window["botonStats"].innerText = "Stats");

  for (let i = 0; i < jugadoresFiltrados.length; i++) {
    jugadoresFiltrados[i].num = i + 1;
  }
  ordenarDiv.classList.add("oculto");
  pergamino.classList.toggle("blurPergamino");
  let nodes = botonera.getElementsByTagName("button");
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].disabled = !nodes[i].disabled;
  }
  tabla.innerHTML = "";
  crearTabla(tabla, jugadoresFiltrados, coincide);
}

function crearTabla(tabla, jugadores, jugadorBoo) {
  //Crea tabla con los datos de los jugadores, adicionalmente matcheando con el usuario actual.
  let tablaG = document.createElement("table");
  let tablaBody = document.createElement("tbody");
  let tablaJug;
  let tablaBJug;
  if (jugadorBoo) {
    tablaJug = document.createElement("table");
    tablaBJug = document.createElement("tbody");
  }

  let titulos = [];
  let titulosReal = [];
  for (const propiedad in jugadores[0]) {
    let propiedades = propiedad.replace(
      propiedad[0],
      propiedad[0].toUpperCase()
    );
    titulosReal.push(propiedad);
    titulos.push(propiedades);
  }
  let filaJugador;
  jugadorBoo && (filaJugador = document.createElement("tr"));

  let maxRows = jugadores.length;
  maxRows >= 10 ? (maxRows = 11) : maxRows++;

  let tiempomod;
  for (let j = 0; j < maxRows; j++) {
    let fila = document.createElement("tr");
    for (let i = 0; i < 1; i++) {
      let celda = document.createElement("td");
      let celdaJugador;
      jugadorBoo && (celdaJugador = document.createElement("td"));

      if (j == 0) {
        celda.innerHTML = `<b>#</b>`;
        if (jugadorBoo) {
          celdaJugador.innerText = jugadores.find(function (jugador) {
            return (
              jugador.nombre == jugadorFinal.nombre &&
              jugador.tiempo == jugadorFinal.tiempo
            );
          }).num;
          celdaJugador.style.width = `5%`;
          filaJugador.appendChild(celdaJugador);
        }
      } else {
        celda.innerText = jugadores[j - 1].num;
      }
      celda.style.width = `5%`;
      fila.appendChild(celda);
    }
    for (let i = 0; i < 3; i++) {
      let celda = document.createElement("td");
      let celdaJugador;
      jugadorBoo && (celdaJugador = document.createElement("td"));

      if (j == 0) {
        celda.innerHTML = `<b>${titulos[i]}</b>`;
        if (jugadorBoo) {
          celdaJugador.innerText = jugadorFinal[titulosReal[i]];
          celdaJugador.style.width = `16%`;
          filaJugador.appendChild(celdaJugador);
        }
      } else {
        celda.innerText = jugadores[j - 1][titulosReal[i]];
      }
      celda.style.width = `16%`;
      fila.appendChild(celda);
    }

    if (!statsOLogros) {
      for (let i = 7; i < 10; i++) {
        let celda = document.createElement("td");
        let celdaJugador;
        jugadorBoo && (celdaJugador = document.createElement("td"));

        if (j == 0) {
          celda.innerHTML = `<b>${titulos[i]}</b>`;
          titulos[i] == "Tiempo" && (tiempomod = i);

          if (jugadorBoo) {
            i == tiempomod
              ? (celdaJugador.innerText = modificarTiempo(
                  jugadorFinal[titulosReal[i]]
                ))
              : (celdaJugador.innerText = jugadorFinal[titulosReal[i]]);

            filaJugador.appendChild(celdaJugador);
          }
        } else {
          i == tiempomod
            ? (celda.innerText = modificarTiempo(
                jugadores[j - 1][titulosReal[i]]
              ))
            : (celda.innerText = jugadores[j - 1][titulosReal[i]]);
        }

        fila.appendChild(celda);
      }
    } else {
      for (let i = 3; i < 7; i++) {
        let celda = document.createElement("td");
        let celdaJugador;
        jugadorBoo && (celdaJugador = document.createElement("td"));

        if (j == 0) {
          celda.innerHTML = `<b>${titulos[i]}</b>`;
          if (jugadorBoo) {
            celdaJugador.innerText = jugadorFinal[titulosReal[i]];
            filaJugador.appendChild(celdaJugador);
          }
        } else {
          celda.innerText = jugadores[j - 1][titulosReal[i]];
        }

        fila.appendChild(celda);
      }
    }

    tablaBody.appendChild(fila);
  }
  tablaG.appendChild(tablaBody);
  tabla.appendChild(tablaG);
  if (jugadorBoo) {
    tablaBJug.appendChild(filaJugador);
    tablaJug.appendChild(tablaBJug);
    tabla.appendChild(tablaJug);
    tablaJug.id = "lineaUsuario";
  }
}

function modificarTiempo(celda) {
  //Celda me deja el tiempo en segundos
  let horas = Math.floor(celda) / (60 * 60);
  let horasAmostrar = Math.floor(horas);
  let minutos = (horas - horasAmostrar) * 60;
  let minutosAmostrar = Math.floor(minutos);
  let segundos = Math.floor((minutos - minutosAmostrar) * 60);
  return `${horasAmostrar.toString().padStart(2, "0")}:${minutosAmostrar
    .toString()
    .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
}

function combate(oponente) {
  //Función de cálculo de puntos y daño realizado en los combates.
  textoExtra = "";
  iniciativaPropia = Math.ceil(Math.random() * 10) + inventario.iniciativa;
  iniciativaOponente = Math.ceil(Math.random() * 10) + oponente.iniciativa;
  if (iniciativaPropia > iniciativaOponente) {
    primero = inventario;
    ini = true;
    segundo = oponente;
  } else {
    primero = oponente;
    ini = false;
    segundo = inventario;
  }
  ataque1 = Math.ceil(Math.random() * 20) + primero.combate;
  defensa1 = Math.ceil(Math.random() * 20) + segundo.defensa;

  if (defensa1 == 20 + segundo.defensa) {
    danoASegundo = 0;
    textoExtra += `<br><br>¡Defensa perfecta de ${segundo.nombre}!`;
  } else if (ataque1 == 20 + primero.combate) {
    danoASegundo = Math.floor(ataque1 / 4);
    textoExtra += `<br><br>¡Golpe crítico de ${primero.nombre}!`;
  } else {
    danoASegundo = Math.floor((ataque1 - defensa1) / 4);
    danoASegundo < 1 ? (danoASegundo = 1) : danoASegundo;
  }

  segundo.vida -= danoASegundo;
  if (!ini && danoASegundo > 0) {
    tostada(danoASegundo);
  }

  if (segundo.vida <= 0) {
    segundo.vida = 0;
    ini ? (victoria = true) : (muerte = true);
  } else {
    ataque2 = Math.ceil(Math.random() * 20) + segundo.combate;
    defensa2 = Math.ceil(Math.random() * 20) + primero.defensa;

    if (defensa2 == 20 + primero.defensa) {
      danoAPrimero = 0;
      textoExtra += `<br><br>¡Defensa perfecta de ${primero.nombre}!`;
    } else if (ataque2 == 20 + segundo.combate) {
      danoAPrimero = Math.floor(ataque2 / 4);
      textoExtra += `<br><br>¡Golpe crítico de ${segundo.nombre}!`;
    } else {
      danoAPrimero = Math.floor((ataque2 - defensa2) / 4);
      danoAPrimero < 1 ? (danoAPrimero = 1) : danoAPrimero;
    }

    primero.vida -= danoAPrimero;
    if (ini && danoAPrimero > 0) {
      tostada(danoAPrimero);
    }
  }

  if (primero.vida <= 0) {
    primero.vida = 0;
    ini ? (muerte = true) : (victoria = true);
  }

  turnoContador++;
  ini
    ? (turno = `Turno ${turnoContador} - Iniciativa: ${primero.nombre}. Daño Hecho: ${danoASegundo}. Daño Recibido: ${danoAPrimero}. Vida de ${oponente.nombre}: ${oponente.vida}.`)
    : (turno = `Turno ${turnoContador} - Iniciativa: ${primero.nombre}. Daño Hecho: ${danoAPrimero}. Daño Recibido: ${danoASegundo}. Vida de ${oponente.nombre}: ${oponente.vida}.`);

  return textoExtra;
}

function crearElemento(nombre, tipoDeElemento, padre, clase) {
  elementoDom = document.createElement(tipoDeElemento);
  elementoDom.id = nombre;
  if (clase != "") {
    elementoDom.classList.add(clase);
  }
  padre.appendChild(elementoDom);
  return elementoDom;
}

function creacionAdicionales() {
  //Detalles adicionales del DOM de vista de explicaciones y envío de correo.
  detalles.addEventListener("click", () => {
    mostrarDetalles.classList.toggle("oculto");
    usuario.classList.toggle("blurPergamino");
    oponente.classList.toggle("blurPergamino");
    scrollDiv.scrollTo(0, 0);
    if (!creacionPersonaje) {
      pergamino.classList.toggle("blurPergamino");
      let nodes = botonera.getElementsByTagName("button");
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].disabled = !nodes[i].disabled;
      }
    } else {
      muestraDetalle = true;
    }
  });

  botonVolver = crearElemento("botonVolver", "button", mostrarDetalles, "");
  botonVolver.innerText = "Volver";
  botonVolver.addEventListener("click", () => {
    mostrarDetalles.classList.add("oculto");
    usuario.classList.remove("blurPergamino");
    oponente.classList.remove("blurPergamino");
    scrollDiv.scrollTo(0, 0);

    if (!creacionPersonaje) {
      pergamino.classList.remove("blurPergamino");
      var nodes = botonera.getElementsByTagName("button");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].disabled = !nodes[i].disabled;
      }
    } else {
      muestraDetalle = false;
    }
  });

  sendEmail.addEventListener("click", () => {
    let mail = "sofiacermi@hotmail.com";
    let asunto = `Javascra - Comentarios`;
    let cuerpo = `¡Hola! Aquí mis comentarios del juego.
  
  `;

    let mailtoLink = `mailto:${mail}?subject=${encodeURIComponent(
      asunto
    )}&body=${encodeURIComponent(cuerpo)}`;
    window.location.href = mailtoLink;
  });
}

function tostada(dano) {
  //Tostada con daño recibido en combate.
  Toastify({
    text: `Perdiste ${dano} de vida`,
    duration: 3000,
    gravity: "bottom",
    position: "left",
    stopOnFocus: true,
    className: "tostada",
    style: {
      background: "#936b47",
    },
    offset: { y: 30 },
  }).showToast();
}

function tostadaEmail(ok) {
  //Tostada para verificar enviar correo.
  if (ok) {
    Toastify({
      text: `Tus datos se enviaron con éxito.
      ¡Gracias por jugar!`,
      duration: 3000,
      gravity: "bottom",
      position: "left",
      stopOnFocus: true,
      className: "tostada",
      style: {
        background: "#936b47",
      },
      offset: { y: 30 },
    }).showToast();
  } else {
    Toastify({
      text: `Hubo un error al enviar tus datos.`,
      duration: 3000,
      gravity: "bottom",
      position: "left",
      stopOnFocus: true,
      className: "tostada",
      style: {
        background: "#936b47",
      },
      offset: { y: 30 },
    }).showToast();
  }
}
