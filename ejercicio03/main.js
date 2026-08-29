const http = require("http");
const repo = require("./repository/studentsRepository");

const PORT = 4000;

// Función auxiliar para estructurar las respuestas HTTP
const sendResponse = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    const { method, url } = req;

    try {
        // RUTA: GET /students (Listar todos)
        if (url === "/students" && method === "GET") {
            sendResponse(res, 200, repo.getAll());
        } 

        // RUTA: GET /students/:id (Obtener por ID)
        else if (url.startsWith("/students/") && method === "GET") {
            const id = url.split("/")[2];
            const student = repo.getById(id);

            if (student) {
                sendResponse(res, 200, student);
            } else {
                sendResponse(res, 404, { error: "Estudiante no encontrado" });
            }
        } 

        // RUTA: POST /students (Crear estudiante)
        else if (url === "/students" && method === "POST") {
            let body = "";
            req.on("data", chunk => (body += chunk));
            req.on("end", () => {
                try {
                    const data = JSON.parse(body || "{}");
                    const newStudent = repo.create(data);
                    sendResponse(res, 201, newStudent);
                } catch (error) {
                    let errorDetails;
                    try {
                        errorDetails = JSON.parse(error.message);
                    } catch {
                        errorDetails = error.message;
                    }
                    const status = error.message.includes("ya existe") || error.message.includes("registrado") ? 409 : 400;
                    sendResponse(res, status, typeof errorDetails === "object" ? { errors: errorDetails } : { error: errorDetails });
                }
            });
        }

        // RUTA: POST /ListByStatus (Listar estudiantes por estado)
        else if (url === "/ListByStatus" && method === "POST") {
            let body = "";
            req.on("data", chunk => (body += chunk));
            req.on("end", () => {
                try {
                    const data = JSON.parse(body || "{}");
                    if (!data.status) {
                        return sendResponse(res, 400, { error: "El campo 'status' es obligatorio." });
                    }
                    const result = repo.getByStatus(data.status);
                    sendResponse(res, 200, result);
                } catch (error) {
                    sendResponse(res, 400, { error: error.message });
                }
            });
        }

        // RUTA: POST /ListByGrade (Listar estudiantes por nota/promedio)
        else if (url === "/ListByGrade" && method === "POST") {
            let body = "";
            req.on("data", chunk => (body += chunk));
            req.on("end", () => {
                try {
                    const data = JSON.parse(body || "{}");
                    if (data.grade === undefined) {
                        return sendResponse(res, 400, { error: "El campo 'grade' es obligatorio." });
                    }
                    const result = repo.getByGrade(data.grade);
                    sendResponse(res, 200, result);
                } catch (error) {
                    sendResponse(res, 400, { error: error.message });
                }
            });
        }

        // RUTA: PUT /students/:id (Actualizar estudiante)
        else if (url.startsWith("/students/") && method === "PUT") {
            const id = url.split("/")[2];
            let body = "";
            req.on("data", chunk => (body += chunk));
            req.on("end", () => {
                try {
                    const data = JSON.parse(body || "{}");
                    const updated = repo.update(id, data);
                    
                    if (updated) {
                        sendResponse(res, 200, updated);
                    } else {
                        sendResponse(res, 404, { error: "Estudiante no encontrado" });
                    }
                } catch (error) {
                    let errorDetails;
                    try {
                        errorDetails = JSON.parse(error.message);
                    } catch {
                        errorDetails = error.message;
                    }
                    const status = error.message.includes("pertenece") ? 409 : 400;
                    sendResponse(res, status, typeof errorDetails === "object" ? { errors: errorDetails } : { error: errorDetails });
                }
            });
        }

        // RUTA: DELETE /students/:id (Eliminar estudiante)
        else if (url.startsWith("/students/") && method === "DELETE") {
            const id = url.split("/")[2];
            const deleted = repo.remove(id);

            if (deleted) {
                sendResponse(res, 200, deleted);
            } else {
                sendResponse(res, 404, { error: "Estudiante no encontrado" });
            }
        }

        // Ruta no encontrada
        else {
            sendResponse(res, 404, { error: "Ruta no encontrada" });
        }

    } catch (error) {
        sendResponse(res, 400, { error: error.message });
    }
});

server.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});