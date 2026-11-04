// Publishes the Playwright results of one stage in Jenkins:
//  - JUnit XML: pass/fail counts and trends in the Jenkins UI
//  - HTML report + evidence (traces, screenshots, videos): archived artifacts
// UI, API and DB stages all generate the same folder names, so each stage
// renames them with its own suffix before archiving; otherwise the archived
// files of one stage would overwrite those of another.
def publishPlaywright(String suite) {
    junit allowEmptyResults: true, testResults: 'playwright/reports/junit.xml'
    dir('playwright') {
        bat """
if exist report-${suite} rmdir /s /q report-${suite}
if exist evidence-${suite} rmdir /s /q evidence-${suite}
if exist playwright-report ren playwright-report report-${suite}
if exist test-results ren test-results evidence-${suite}
"""
    }
    archiveArtifacts artifacts: "playwright/report-${suite}/**,playwright/evidence-${suite}/**",
                     allowEmptyArchive: true
    // Clean up so the next build in this workspace never republishes stale files
    dir('playwright') {
        bat """
if exist report-${suite} rmdir /s /q report-${suite}
if exist evidence-${suite} rmdir /s /q evidence-${suite}
if exist reports rmdir /s /q reports
"""
    }
}

pipeline {
    agent none

    parameters {
        // Which framework to run. The first choice is the default, so scheduled or
        // first-time builds keep the previous behavior (Cypress only).
        // 'both' runs Cypress first and Playwright afterwards, never at the same
        // time: both frameworks share the same app and database, and the API
        // suites create and delete fixtures that the database suites count.
        choice(name: 'FRAMEWORK',
               choices: ['cypress', 'playwright', 'both'],
               description: 'Test framework to run')
    }

    stages {
        // ============================================================
        // CYPRESS
        // ============================================================
        stage('Cypress') {
            when { expression { ['cypress', 'both'].contains(params.FRAMEWORK) } }
            stages {
                // Suites 1-5 run in parallel. Suite 5 (REST API) creates and deletes
                // fixtures, so suite 6 (database) must NOT run at the same time:
                // it compares counts between queries and could fail intermittently.
                stage('Cypress Parallel Tests') {
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
                stage('Cypress Database Tests') {
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

        // ============================================================
        // PLAYWRIGHT
        // Declared after Cypress, so with FRAMEWORK=both it starts only once
        // every Cypress stage has finished.
        // ============================================================
        stage('Playwright') {
            when { expression { ['playwright', 'both'].contains(params.FRAMEWORK) } }
            environment {
                // Activates the CI behavior in playwright.config.ts:
                // 2 retries, 1 worker and forbidOnly. Jenkins does not set it by itself.
                CI = 'true'
            }
            stages {
                // UI and API run in parallel, same rule as Cypress: the database
                // suite waits until the API suite (which creates/deletes fixtures)
                // is done. The playwright/ folder has its own package.json.
                stage('Playwright Parallel Tests') {
                    parallel {
                        stage('PW UI - Chromium suites') {
                            agent { label 'Agent1' }
                            steps {
                                dir('playwright') {
                                    bat 'npm ci'
                                    // Downloads Chromium: a clean agent workspace does not have it
                                    bat 'npm run install:browsers'
                                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                                        bat 'npm run test:ui'
                                    }
                                }
                            }
                            post {
                                // always: results are published even when tests fail
                                always { script { publishPlaywright('ui') } }
                            }
                        }
                        stage('PW API - REST API Endpoints') {
                            agent { label 'Agent2' }
                            steps {
                                dir('playwright') {
                                    bat 'npm ci'
                                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                                        bat 'npm run test:api'
                                    }
                                }
                            }
                            post {
                                always { script { publishPlaywright('api') } }
                            }
                        }
                    }
                }

                stage('Playwright Database Tests') {
                    agent { label 'Agent2' }
                    environment {
                        DB_NAME = 'futbolstats'
                    }
                    steps {
                        dir('playwright') {
                            bat 'npm ci'
                            // Same credential as the Cypress database suite
                            withCredentials([usernamePassword(credentialsId: 'futbolstats-db',
                                                              usernameVariable: 'DB_USER',
                                                              passwordVariable: 'DB_PASSWORD')]) {
                                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                                    bat 'npm run test:db'
                                }
                            }
                        }
                    }
                    post {
                        always { script { publishPlaywright('db') } }
                    }
                }
            }
        }
    }
}
