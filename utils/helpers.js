// utils/helpers.js
function generateRandomUser() {
  const timestamp = Date.now();
  return {
    username: `testuser_${timestamp}`,
    password: `password_${timestamp}`
  };
}

module.exports = { generateRandomUser };
