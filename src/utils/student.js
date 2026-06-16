export function validateStudentId(studentId) {
  const regex = /^3[1-3](0[1-9]|1[0-9]|20)$/;
  return regex.test(studentId);
}

export function parseStudentId(studentId) {
  return {
    grade: Number(studentId[0]),
    classNo: Number(studentId[1]),
    studentNo: Number(studentId.slice(2)),
  };
}