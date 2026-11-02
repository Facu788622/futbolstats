pipeline {
    agent none

    stages {
        stage('Parallel Tests') {
            parallel {
                stage('Suite 1 - Navigation and DOM Basics') {
                    agent { label 'Agent1' }
                    steps {
                        bat 'npm install'
                        bat 'npx cypress run --record --spec "cypress/e2e/navigation-and-dom-basics.cy.js"'
                    }
                }
                stage('Suite 2 - Forms and User Interactions') {
                    agent { label 'Agent2' }
                    steps {
                        bat 'npm install'
                        bat 'npx cypress run --record --spec "cypress/e2e/forms-and-user-interactions.cy.js"'
                    }
                }
            }
        }
    }
}
