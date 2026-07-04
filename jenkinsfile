pipeline {
    agent none

    stages {
        stage('Tests en Paralelo') {
            parallel {
                stage('Suite 1 - Fundamentos') {
                    agent { label 'agente-1' }
                    steps {
                        bat 'npm install'
                        bat 'npx cypress run --record --spec "cypress/e2e/nivel01-fundamentos.cy.js"'
                    }
                }
                stage('Suite 2 - Interacciones') {
                    agent { label 'agente-1' }
                    steps {
                        bat 'npm install'
                        bat 'npx cypress run --record --spec "cypress/e2e/nivel02-interacciones.cy.js"'
                    }
                }
            }
        }
    }
}