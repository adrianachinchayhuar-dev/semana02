let students = [
  {
    id: 1,
    name: "Juan Pérez",
    grade: 20,
    age: 23,
    email: "juan.perez@ejemplo.com",
    phone: "+51 987654321",
    enrollmentNumber: "2025001",
    course: "Diseño y Desarrollo de Software C24",
    year: 3,
    subjects: ["Algoritmos", "Bases de Datos", "Redes"],
    gpa: 3.8,
    status: "Activo",
    admissionDate: "2022-03-01"
  }
];

// Auxiliar: Parsea a entero seguro
function parseId(id) {
  const parsed = Number(id);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error("El ID proporcionado debe ser un número entero positivo válido.");
  }
  return parsed;
}

// Auxiliar: Valida campos requeridos y tipos para matrícula
function validateStudentData(data, isUpdate = false) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!isUpdate) {
    const requiredFields = ['name', 'grade', 'age', 'email', 'enrollmentNumber', 'course', 'year', 'subjects', 'status'];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        throw new Error(`El campo obligatorio '${field}' está ausente o vacío.`);
      }
    }
  }

  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length < 3)) {
    throw new Error("El nombre debe tener al menos 3 caracteres.");
  }

  if (data.email !== undefined && !emailRegex.test(data.email)) {
    throw new Error("El correo electrónico no tiene un formato válido.");
  }

  if (data.grade !== undefined) {
    const gradeNum = Number(data.grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20) {
      throw new Error("La nota (grade) debe ser un número entre 0 y 20.");
    }
  }

  if (data.age !== undefined) {
    const ageNum = Number(data.age);
    if (isNaN(ageNum) || ageNum < 15 || ageNum > 100) {
      throw new Error("La edad debe ser un número válido entre 15 y 100 años.");
    }
  }

  if (data.subjects !== undefined && (!Array.isArray(data.subjects) || data.subjects.length === 0)) {
    throw new Error("Las asignaturas (subjects) deben ser un arreglo con al menos un elemento.");
  }
}

// 1. Inmutabilidad en getAll
function getAll() {
  return JSON.parse(JSON.stringify(students));
}

// 2. Coerción segura de ID
function getById(id) {
  const cleanId = parseId(id);
  const student = students.find(s => s.id === cleanId);
  return student ? JSON.parse(JSON.stringify(student)) : null;
}

// 3. Creación con validación completa y duplicados
function create(studentData) {
  if (!studentData || typeof studentData !== 'object') {
    throw new Error("Los datos del estudiante son obligatorios.");
  }

  validateStudentData(studentData, false);

  // Unicidad de Correo y Matrícula
  const emailExists = students.some(s => s.email.toLowerCase() === studentData.email.toLowerCase());
  if (emailExists) {
    throw new Error(`El correo '${studentData.email}' ya se encuentra registrado.`);
  }

  const enrollmentExists = students.some(s => s.enrollmentNumber === studentData.enrollmentNumber);
  if (enrollmentExists) {
    throw new Error(`El número de matrícula '${studentData.enrollmentNumber}' ya existe.`);
  }

  const maxId = students.length > 0 ? Math.max(...students.map(s => s.id)) : 0;
  
  const newStudent = {
    ...studentData,
    id: maxId + 1,
    grade: Number(studentData.grade),
    age: Number(studentData.age),
    year: Number(studentData.year),
    admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0]
  };

  students.push(newStudent);
  return JSON.parse(JSON.stringify(newStudent));
}

// 4. Actualización blindada e inmutable
function update(id, updateData) {
  const cleanId = parseId(id);
  const index = students.findIndex(s => s.id === cleanId);

  if (index === -1) return null;

  if (!updateData || typeof updateData !== 'object') {
    throw new Error("Proporcione datos válidos para actualizar.");
  }

  validateStudentData(updateData, true);

  // Proteger ID
  if (updateData.id && Number(updateData.id) !== cleanId) {
    throw new Error("No está permitido modificar el ID de un estudiante existente.");
  }

  // Validar duplicados en caso de actualizar email o matrícula
  if (updateData.email) {
    const emailExists = students.some(s => s.email.toLowerCase() === updateData.email.toLowerCase() && s.id !== cleanId);
    if (emailExists) throw new Error(`El correo '${updateData.email}' ya pertenece a otro estudiante.`);
  }

  if (updateData.enrollmentNumber) {
    const enrollmentExists = students.some(s => s.enrollmentNumber === updateData.enrollmentNumber && s.id !== cleanId);
    if (enrollmentExists) throw new Error(`El número de matrícula '${updateData.enrollmentNumber}' ya pertenece a otro estudiante.`);
  }

  const updatedStudent = {
    ...students[index],
    ...updateData,
    id: cleanId
  };

  students[index] = updatedStudent;
  return JSON.parse(JSON.stringify(updatedStudent));
}

// 5. Eliminación
function remove(id) {
  const cleanId = parseId(id);
  const index = students.findIndex(s => s.id === cleanId);
  if (index !== -1) {
    return students.splice(index, 1)[0];
  }
  return null;
}

// 6. Filtro por Estado
function getByStatus(status) {
  if (!status || typeof status !== 'string') {
    throw new Error("Debe proporcionar un estado válido para filtrar.");
  }
  const filtered = students.filter(s => s.status.toLowerCase() === status.toLowerCase());
  return JSON.parse(JSON.stringify(filtered));
}

// 7. Filtro por Nota
function getByGrade(grade) {
  const gradeNum = Number(grade);
  if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20) {
    throw new Error("La nota enviada para filtrado debe ser un número entre 0 y 20.");
  }
  const filtered = students.filter(s => s.grade >= gradeNum);
  return JSON.parse(JSON.stringify(filtered));
}

module.exports = { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  getByStatus, 
  getByGrade 
};