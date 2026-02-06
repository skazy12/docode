# DOCODE 🧠📁

**DOCODE** es una herramienta web que permite **analizar proyectos de código (GitHub o carpetas locales)**, aplicar reglas según el framework y **generar documentación estructurada en un solo archivo `.txt`**, ideal para análisis, revisión de código o uso con modelos de lenguaje (LLMs).

🌐 **Demo online:**  
https://skazy12.github.io/docode/

---

## ✨ ¿Qué hace DOCODE?

- 🔍 Analiza **repositorios GitHub públicos**
- 📂 Lee **carpetas locales** directamente desde el navegador
- 🧩 Aplica reglas según el **framework seleccionado**
- 🌳 Muestra el **árbol de directorios**
- 📄 Permite ver el **contenido de cada archivo**
- 📥 Genera un `.txt` con toda la documentación del proyecto
- ⚡ Funciona 100% en el navegador (sin backend)

---

## 🛠️ Frameworks soportados

DOCODE filtra y prioriza archivos según reglas definidas por framework:

- React
- Flutter
- Spring Boot
- Generic (sin framework específico)

Las reglas se configuran en: `src/data/frameworks.json`.

---

## 🚀 Flujo de uso

1. El usuario ingresa una URL de GitHub o selecciona una carpeta local.
2. Elige el framework a aplicar.
3. DOCODE analiza la estructura, filtra archivos relevantes y construye el árbol de directorios.
4. Se puede navegar el árbol, previsualizar archivos y exportar la documentación en `.txt`.

---

## 🧱 Tecnologías utilizadas

- React + Vite
- CSS moderno
- GitHub Pages
- File System Access API (modo local)

---

## 💻 Desarrollo local

Clona el repositorio, instala dependencias y ejecuta:

- `npm install`
- `npm run dev`

---

## 👤 Autor

Creado por **Omar Rodríguez**  
GitHub: https://github.com/skazy12  
Repo: https://github.com/skazy12/docode
