const validator = require("validator");

const validateRegisterData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name should not be empty");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};

const validateLoginData = (req) => {
  const { email } = req.body;

  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  }
};

const validateEditProfileData = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "skills",
    "about",
    "gender",
  ];

  const isAllowed = Object.keys(req.body).every((field) =>
    allowedFields.includes(field)
  );

  return isAllowed;
};

module.exports = {
  validateRegisterData,
  validateLoginData,
  validateEditProfileData,
};
