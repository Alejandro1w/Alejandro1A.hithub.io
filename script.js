// ======================== VARIABLES GLOBALES ========================
let contraseñaAdmin = localStorage.getItem("adminPass") || "111";
let candidatos = JSON.parse(localStorage.getItem("candidatos")) || [
  { nombre: "VOTO EN BLANCO", votos: 0, imagen: "" }
];
let votos = JSON.parse(localStorage.getItem("votos")) || {};
let year = localStorage.getItem("year") || 2026;
let app = document.getElementById("app");

// ======================== FUNCIÓN PRINCIPAL ========================
window.onload = function () {
  crearEstructura();
  mostrarSeccion("welcomeSection");
};

// ======================== CREAR TODA LA ESTRUCTURA ========================
function crearEstructura() {
  app.innerHTML = `
    <header id="header">
      <h1>Elecciones Personero <span id="year">${year}</span></h1>
      <img src="logo.jpg" id="adminLogo" title="Administración" alt="Logo admin">
    </header>

    <section id="welcomeSection" class="fade">
      <img src="logo.jpg" class="saludo-logo" alt="Logo">
      <h2>🌿 ¡Bienvenido a las Elecciones Personero ${year}!</h2>
      <p>Tu voto es importante para construir un mejor colegio.</p>
      <input type="text" id="nombreEstudiante" placeholder="Ingresa tu nombre">
      <button id="btnContinuar">Continuar</button>
    </section>

    <section id="greetingSection" style="display:none;" class="fade">
      <img src="logo.jpg" class="saludo-logo" alt="Logo">
      <h2 id="saludoTexto"></h2>
      <button id="btnMostrarCodigo">Ingresar número de identidad</button>
    </section>

    <section id="loginSection" style="display:none;" class="fade">
      <h2>Ingresa tu número de identidad para votar</h2>
      <input type="password" id="studentCode" placeholder="Número de identidad">
      <button id="btnVerificarCodigo">Entrar</button>
      <p id="mensajeCodigo" style="color:red;"></p>
    </section>

    <section id="voteSection" style="display:none;" class="fade">
      <h2>Selecciona tu candidato</h2>
      <div id="candidatesContainer"></div>
    </section>

    <section id="thankYouSection" style="display:none;" class="fade">
      <h2 id="graciasTexto">✅ ¡Gracias por votar!</h2>
    </section>

    <section id="adminPanel" style="display:none;">
      <h2>Panel de Administración</h2>
      <label>Año:</label>
      <input type="number" id="adminYear" value="${year}"><br>
      
      <label>Nueva contraseña:</label>
      <input type="password" id="newPassword" placeholder="Contraseña nueva">
      <button id="btnCambiarPass">Guardar</button><br><br>

      <h3>Agregar candidato</h3>
      <input type="text" id="newName" placeholder="Nombre del candidato">
      <input type="file" id="newImage" accept="image/*">
      <button id="btnAgregarCandidato">Agregar</button>

      <div id="results"></div>

      <button id="btnGuardarCerrar">Guardar cambios y cerrar</button>
      <button id="btnReiniciar" style="background:red;">Reiniciar todo</button>
    </section>
  `;

  // Asignar eventos
  document.getElementById("adminLogo").onclick = abrirAdmin;
  document.getElementById("btnContinuar").onclick = continuarSaludo;
  document.getElementById("btnMostrarCodigo").onclick = mostrarCodigo;
  document.getElementById("btnVerificarCodigo").onclick = verificarCodigo;
  document.getElementById("btnCambiarPass").onclick = cambiarContraseña;
  document.getElementById("btnAgregarCandidato").onclick = agregarCandidato;
  document.getElementById("btnGuardarCerrar").onclick = guardarYCerrar;
  document.getElementById("btnReiniciar").onclick = reiniciarTodo;

  // Enter para avanzar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (document.getElementById("welcomeSection").style.display !== "none") continuarSaludo();
      else if (document.getElementById("greetingSection").style.display !== "none") mostrarCodigo();
      else if (document.getElementById("loginSection").style.display !== "none") verificarCodigo();
    }
  });
}

// ======================== FUNCIONES DE NAVEGACIÓN ========================
function mostrarSeccion(id) {
  // No ocultamos el header (así siempre se ve el logo admin y el título)
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// ======================== FLUJO DE VOTACIÓN ========================
function continuarSaludo() {
  let nombre = document.getElementById("nombreEstudiante").value.trim();
  if (!nombre) return alert("Por favor, ingresa tu nombre.");
  localStorage.setItem("nombreTemp", nombre);
  mostrarSeccion("greetingSection");
  document.getElementById("saludoTexto").textContent = `Hola ${nombre}, continúa para emitir tu voto.`;
}

function mostrarCodigo() {
  mostrarSeccion("loginSection");
}

function verificarCodigo() {
  let codigo = document.getElementById("studentCode").value.trim();
  if (!codigo) return alert("Ingresa tu número de identidad.");
  if (votos[codigo]) {
    document.getElementById("mensajeCodigo").textContent = "⚠️ ¡Ups! Este código ya fue utilizado.";
    return;
  }
  mostrarSeccion("voteSection");
  mostrarCandidatos(codigo);
}

function mostrarCandidatos(codigo) {
  let contenedor = document.getElementById("candidatesContainer");
  contenedor.innerHTML = "";
  candidatos.forEach((cand, index) => {
    let div = document.createElement("div");
    div.className = "candidate";
    div.innerHTML = `${cand.imagen ? `<img src="${cand.imagen}" alt="">` : ""}<h3>${cand.nombre}</h3>`;
    div.onclick = () => votar(codigo, index);
    contenedor.appendChild(div);
  });
}

function votar(codigo, index) {
  votos[codigo] = true;
  candidatos[index].votos++;
  guardarDatos();
  let nombre = localStorage.getItem("nombreTemp");
  document.getElementById("graciasTexto").innerHTML = `✅ ¡Gracias por votar, ${nombre}!`;
  mostrarSeccion("thankYouSection");
  localStorage.removeItem("nombreTemp");
  setTimeout(() => location.reload(), 4000);
}

// ======================== FUNCIONES DE ADMINISTRADOR ========================
function abrirAdmin() {
  let pass = prompt("Ingrese la contraseña de administrador:");
  if (pass === contraseñaAdmin) {
    mostrarSeccion("adminPanel");
    mostrarResultados();
  } else alert("Contraseña incorrecta");
}

function mostrarResultados() {
  let res = document.getElementById("results");
  res.innerHTML = "<h3>Resultados en tiempo real:</h3>";
  candidatos.forEach(c => {
    res.innerHTML += `<p>${c.nombre}: ${c.votos} votos</p>`;
  });
}

function agregarCandidato() {
  let nombre = document.getElementById("newName").value.trim();
  let imagenInput = document.getElementById("newImage");
  if (!nombre) return alert("Ingresa un nombre.");
  if (candidatos.find(c => c.nombre === nombre)) return alert("Ese nombre ya existe.");

  let reader = new FileReader();
  reader.onload = function (e) {
    candidatos.push({ nombre, votos: 0, imagen: e.target.result });
    guardarDatos();
    mostrarResultados();
    alert("Candidato agregado con éxito.");
  };
  if (imagenInput.files[0]) reader.readAsDataURL(imagenInput.files[0]);
  else {
    candidatos.push({ nombre, votos: 0, imagen: "" });
    guardarDatos();
    mostrarResultados();
  }
}

function cambiarContraseña() {
  let nueva = document.getElementById("newPassword").value;
  if (!nueva) return alert("Ingresa una nueva contraseña");
  contraseñaAdmin = nueva;
  localStorage.setItem("adminPass", nueva);
  alert("Contraseña actualizada.");
}

function guardarYCerrar() {
  guardarDatos();
  location.reload();
}

function reiniciarTodo() {
  if (confirm("¿Seguro que deseas reiniciar todo? Esto borrará candidatos, votos y configuraciones.")) {
    localStorage.clear();
    location.reload();
  }
}

// ======================== UTILIDADES ========================
function guardarDatos() {
  localStorage.setItem("candidatos", JSON.stringify(candidatos));
  localStorage.setItem("votos", JSON.stringify(votos));
  localStorage.setItem("year", year);
}