document.addEventListener("DOMContentLoaded", () => {

  /* MENÚ HAMBURGUESA */
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    document.querySelectorAll("#nav-menu a").forEach(link => {
      link.addEventListener("click", () => navMenu.classList.remove("active"));
    });
  }

  /* ANIMACIONES AL HACER SCROLL */
  const animatedElements = document.querySelectorAll(".animate");

  function showOnScroll() {
    const triggerBottom = window.innerHeight * 0.85;
    animatedElements.forEach(el => {
      const boxTop = el.getBoundingClientRect().top;
      el.classList.toggle("visible", boxTop < triggerBottom);
    });
  }

  window.addEventListener("scroll", showOnScroll);
  showOnScroll();

  /* GRÁFICO DE BENEFICIOS (Chart.js)  */
  const chartCanvas = document.getElementById("benefitsChart");
  if (chartCanvas) {
    const ctx = chartCanvas.getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "Decisiones más firmes y meditadas",
          "Mejores análisis ad-hoc",
          "Colaboraciones con otras compañías",
          "Capacidades de autoservicio",
          "Incremento del ROI",
          "Ahorro de tiempo",
          "Reducción carga del departamento TI"
        ],
        datasets: [{
          label: "Porcentaje (%)",
          data: [77, 43, 41, 36, 34, 20, 15],
          backgroundColor: "#0057B7",
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#2E2E2E",
            titleColor: "#ffffff",
            bodyColor: "#ffffff"
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: "#2E2E2E" },
            grid: { color: "#cccccc" }
          },
          y: {
            ticks: { color: "#2E2E2E" },
            grid: { display: false }
          }
        }
      }
    });
  }

  /* MODALES (login, registro, contacto) */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "block";
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
  }

  function switchModal(fromId, toId) {
    closeModal(fromId);
    openModal(toId);
  }

  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none";
    }
  });

  // Botones de abrir modales
  document.getElementById("openLogin")?.addEventListener("click", () => openModal("loginModal"));
  document.getElementById("openRegister")?.addEventListener("click", () => openModal("registerModal"));
  document.getElementById("openContact")?.addEventListener("click", () => openModal("contactModal"));

  // Botones de cerrar modales (X)
  document.querySelectorAll(".close").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").style.display = "none";
    });
  });

  /* FUNCIÓN GENERAL PARA ENVIAR DATOS AL BACKEND */
  async function enviarDatos(url, datos) {
    try {
      const res = await fetch(`http://127.0.0.1:5000${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });
      const data = await res.json();
      alert(data.message || data.error);
    } catch {
      alert("Error al conectar con el servidor Flask.");
    }
  }

  // Formularios
  document.getElementById("formRegistro")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = {
      nombre: e.target.nombre.value,
      email: e.target.email.value,
      password: e.target.password.value
    };
    await enviarDatos("/api/registro", datos);
  });

  document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = {
      email: e.target.email.value,
      password: e.target.password.value
    };
    await enviarDatos("/api/login", datos);
  });

  document.getElementById("formContacto")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = {
      nombre: e.target.nombre.value,
      email: e.target.email.value,
      mensaje: e.target.mensaje.value
    };
    await enviarDatos("/api/contacto", datos);
  });

  /* GRAFICADOR DE FUNCIONES */
  const funcList = document.getElementById("funcList");
  const addBtn = document.getElementById("addBtn");
  const removeBtn = document.getElementById("removeBtn");
  const plotBtn = document.getElementById("plotBtn");
  const clearBtn = document.getElementById("clearBtn");
  const plotDiv = document.getElementById("plot");

  if (funcList && plotDiv) {

    function addFunctionRow(value = "") {
      const row = document.createElement("div");
      row.className = "func-row";
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "y = ... (ej.: sin(x) o x^2)";
      input.value = value;
      row.appendChild(input);
      funcList.appendChild(row);
      input.focus();
    }

    function removeFunctionRow() {
      const rows = funcList.querySelectorAll(".func-row");
      if (rows.length > 1) funcList.removeChild(rows[rows.length - 1]);
      else rows[0].querySelector("input").value = "";
    }

    function clearAll() {
      funcList.innerHTML = "";
      addFunctionRow();
      Plotly.purge(plotDiv);
    }

    function getFunctions() {
      return Array.from(funcList.querySelectorAll("input"))
        .map(i => i.value.trim())
        .filter(v => v !== "");
    }

    function cleanExpression(expr) {
      return expr
        .replace(/[^\w\d+\-*/^()., eπsincoastgqrtlnlog]/gi, "") 
        .replace(/(\d)([a-zA-Z])/g, "$1*$2") 
        .replace(/([a-zA-Z])(\d)/g, "$1*$2") 
        .replace(/\bsen\b/gi, "sin") 
        .replace(/([a-zA-Z0-9.]+)\s*\^\s*([a-zA-Z0-9.]+)/g, "pow($1,$2)"); 
    }

    function evaluateExpression(expr, xValues) {
      try {
        const exprClean = cleanExpression(expr);
        console.log("🔹 Procesando:", expr, "➡️", exprClean);

        const compiled = math.compile(exprClean);

        return xValues.map(x => {
          try {
            const val = compiled.evaluate({ x, pi: Math.PI, e: Math.E });
            return isFinite(val) ? val : null;
          } catch {
            return null;
          }
        });
      } catch (err) {
        console.error("❌ Error general al procesar la expresión:", expr, err);
        alert(`Error procesando la expresión: ${expr}\n\n${err.message}`);
        return xValues.map(() => null);
      }
    }

    function plotFunctions(funcExprs) {
      if (!funcExprs.length) {
        alert("Por favor ingresa al menos una función.");
        return;
      }

      const n = 400;
      const xmin = -10, xmax = 10;
      const x = Array.from({ length: n }, (_, i) => xmin + (xmax - xmin) * i / (n - 1));
      const colors = ["#111827", "#0ea5e9", "#ef4444", "#10b981", "#f59e0b", "#7c3aed"];
      const traces = [];

      funcExprs.forEach((expr, i) => {
        const y = evaluateExpression(expr, x);
        traces.push({
          x,
          y,
          mode: "lines",
          name: expr,
          line: { color: colors[i % colors.length], width: 2 }
        });
      });

      Plotly.newPlot(plotDiv, traces, {
        title: "Gráfica de funciones",
        xaxis: {
          title: "x",
          zeroline: true,
          showgrid: true,
          range: [-10, 10] 
        },
        yaxis: {
          title: "y",
          zeroline: true,
          showgrid: true,
          range: [-10, 10] 
        },
        legend: { orientation: "h", x: 0.02, y: -0.15 },
        margin: { t: 40, b: 60, l: 60, r: 20 }
      }, { responsive: true });
    }

    addBtn?.addEventListener("click", addFunctionRow);
    removeBtn?.addEventListener("click", removeFunctionRow);
    clearBtn?.addEventListener("click", clearAll);
    plotBtn?.addEventListener("click", () => plotFunctions(getFunctions()));

    addFunctionRow("sin(x)");
    addFunctionRow("x^2");
  }
}); 


function openModal(id) {
  document.getElementById(id).style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function switchModal(currentId, targetId) {
  closeModal(currentId);
  openModal(targetId);
}
document.getElementById("openLogin").addEventListener("click", () => {
  openModal("loginModal");
});

document.getElementById("openRegister").addEventListener("click", () => {
  openModal("registerModal");
});

document.getElementById("openContact").addEventListener("click", () => {
  openModal("contactModal");
});
