pipeline {
    agent none

    stages {
        // Suites 1-5 run in parallel. Suite 5 (REST API) creates and deletes
        // fixtures, so suite 6 (database) must NOT run at the same time:
        // it compares counts between queries and could fail intermittently.
        stage('Parallel Tests') {
            parallel {
                stage('Suite 1 - Navigation and DOM Basics') {
                    agent { label 'Agent1' }
                    steps {
                        bat 'npm install'
                        // catchError marks the build as FAILED but lets the pipeline
                        // continue, so the database stage always runs
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            bat 'npx cypress run --record --spec "cypress/e2e/navigation-and-dom-basics.cy.js"'
                        }
                    }
                }
                stage('Suite 2 - Forms and User Interactions') {
                    agent { label 'Agent2' }
                    steps {
                        bat 'npm install'
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            bat 'npx cypress run --record --spec "cypress/e2e/forms-and-user-interactions.cy.js"'
                        }
                    }
                }
                stage('Suite 3 - DOM Traversal and Tables') {
                    agent { label 'Agent1' }
                    steps {
                        bat 'npm install'
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            bat 'npx cypress run --record --spec "cypress/e2e/dom-traversal-and-tables.cy.js"'
                        }
                    }
                }
                stage('Suite 4 - Session, Network and Test Data') {
                    agent { label 'Agent2' }
                    steps {
                        bat 'npm install'
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            bat 'npx cypress run --record --spec "cypress/e2e/session-network-and-test-data.cy.js"'
                        }
                    }
                }
                stage('Suite 5 - REST API Endpoints') {
                    agent { label 'Agent1' }
                    steps {
                        bat 'npm install'
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            bat 'npx cypress run --record --spec "cypress/e2e/rest-api-endpoints.cy.js"'
                        }
                    }
                }
            }
        }

        // Runs only after the parallel stage has finished
        stage('Database Tests') {
            stages {
                stage('Suite 6 - Database Queries and Integrity') {
                    agent { label 'Agent2' }
                    environment {
                        // Same variables the backend uses (see backend/config/database.js)
                        DB_NAME = 'futbolstats'
                    }
                    steps {
                        bat 'npm install'
                        // DB_USER and DB_PASSWORD come from a Jenkins credential
                        // (Username with password), never hardcoded in this file
                        withCredentials([usernamePassword(credentialsId: 'futbolstats-db',
                                                          usernameVariable: 'DB_USER',
                                                          passwordVariable: 'DB_PASSWORD')]) {
                            bat 'npx cypress run --record --spec "cypress/e2e/database-queries-and-integrity.cy.js"'
                        }
                    }
                }
            }
        }
    }
}
