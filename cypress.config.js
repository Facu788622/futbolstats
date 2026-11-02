const { defineConfig } = require("cypress");
const { consultar } = require("./cypress/tasks/db");

module.exports = defineConfig({
  projectId: "mh8zsj",
  allowCypressEnv: false,
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      // Read-only SQL queries for the database test suite
      on("task", {
        "db:query": consultar,
      });
      return config;
    },
  },
});
