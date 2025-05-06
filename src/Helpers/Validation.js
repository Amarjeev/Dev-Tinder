const validateSignupData = (req) => {
  const { name, email, age, gender, password } = req.body;
    if (!name) {
        throw new Error("Please enter your name");
  }
  if (!/^[A-Za-z\s]+$/.test(name)) {
    throw new Error("Name must contain only letters and spaces.");
  }
  if (name.length < 4 || name.length > 15) {
    throw new Error("Name must be between 4 and 15 characters long.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }
  if (age < 0 || age > 120) {
    throw new Error("Age must be between 0 and 120.");
  }
  if (!["male", "female", "other"].includes(gender.toLowerCase())) {
    throw new Error("Gender must be 'male', 'female', or 'other'.");
  }
  if (!/[a-z]/.test(password)) {
    throw new Error("Password must include at least one lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    throw new Error("Password must include at least one number.");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new Error("Password must include at least one special character.");
  }
  if (password.length !== 8) {
    throw new Error("Password must be exactly 8 characters long.");
  }
};

module.exports = { validateSignupData };
