const http = require("http");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const PORT = 3000;

const renderView = (res, viewName, data) => {
  const filePath = path.join(__dirname, "views", `${viewName}.hbs`);
  fs.readFile(filePath, "utf8", (err, templateData) => {
    if (err) {
      res.statusCode = 500;
      return res.end("Error al cargar la plantilla");
    }
    const template = handlebars.compile(templateData);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(template(data));
  });
};

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    renderView(res, "home", {
      title: "Servidor Handlebars",
      welcomeMessage: "Bienvenido al laboratorio de Node.js",
      day: new Date().toLocaleDateString("es-PE"),
      students: ["Ana", "Luis", "Pedro", "María"]
    });
  } else if (req.url === "/about") {
    renderView(res, "about", {
      title: "Acerca de la Clase",
      course: "Desarrollo de Aplicaciones Web Avanzado",
      instructor: "Edwin William Arévalo Sermeño",
      date: new Date().toLocaleDateString("es-PE")
    });
  } else if (req.url === "/students") {
    const rawStudents = [
      { name: "Ana", grade: 18 },
      { name: "Luis", grade: 14 },
      { name: "Pedro", grade: 16 },
      { name: "María", grade: 11 }
    ];
    const students = rawStudents.map(s => ({ ...s, isTop: s.grade > 15 }));
    renderView(res, "students", { students });
  } else {
    res.statusCode = 404;
    res.end("<h1>404 - Página no encontrada</h1>");
  }
});

server.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));