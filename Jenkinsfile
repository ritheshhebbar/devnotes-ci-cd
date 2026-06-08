pipeline {
    agent any

    environment {
        IMAGE_NAME = "devnotes"
        DOCKERHUB = "ritheshhebbar"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                url: 'https://github.com/ritheshhebbar/devnotes-ci-cd.git'
            }
        }

        stage('SonarCloud Analysis') {
            steps {
                bat '"C:\\Users\\kssha\\Downloads\\sonar-scanner-cli-8.0.1.6346-windows-x64\\sonar-scanner-8.0.1.6346-windows-x64\\bin\\sonar-scanner.bat"'
            }
        }

        stage('OWASP Dependency Scan') {
            steps {
                bat 'C:\\Users\\kssha\\Downloads\\dependency-check-12.2.2-release\\dependency-check\\bin\\dependency-check.bat --scan . --format HTML'
            }
        }

        stage('Publish OWASP Report') {
    steps {
        publishHTML(target: [
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: '.',
            reportFiles: 'dependency-check-report.html',
            reportName: 'OWASP Report'
        ])
    }
}

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %DOCKERHUB%/%IMAGE_NAME% .'
            }
        }

        stage('Push Docker Image') {
            steps {

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                    bat 'docker push %DOCKERHUB%/%IMAGE_NAME%'
                }
            }
        }
    }}