export const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,128}$/u;

export const strongPasswordMessage =
  "password must include uppercase, lowercase, number, and special character";
