const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "mh8zsj",
  allowCypressEnv: false,
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {},
  },
});
