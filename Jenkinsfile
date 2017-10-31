node("docker") {

    currentBuild.result = "SUCCESS"
    failure_email = "build@geographica.gs"

    try {

        stage "Building"

            checkout scm
            sh "git rev-parse --short HEAD > .git/git_commit"
            sh "git --no-pager show -s --format='%ae' HEAD > .git/git_committer_email"

            workspace = pwd()
            branch_name = "${ env.BRANCH_NAME }".replaceAll("/", "_")
            git_commit = readFile(".git/git_commit").replaceAll("\n", "").replaceAll("\r", "")
            build_name = "${git_commit}"
            job_name = "${ env.JOB_NAME }".replaceAll("%2F", "/")
            committer_email = readFile(".git/git_committer_email").replaceAll("\n", "").replaceAll("\r", "")

            sh "docker build --pull=true -t geographica/boilerplate_api ."


        if (currentBuild.result == "SUCCESS" && ["master"].contains(branch_name)) {

            stage "Deploying"

                sh "docker login registry.geographica.gs -u ${env.DOCKER_REGISTRY_USER} -p ${env.DOCKER_REGISTRY_PASSWORD}"

                if (branch_name == "master") {
                  echo "Save image to registry"
                  sh "docker tag geographica/boilerplate_api registry.geographica.gs/boilerplate_api:prod"
                  sh "docker tag geographica/boilerplate_api registry.geographica.gs/boilerplate_api:prod-${build_name}"
                  sh "docker push registry.geographica.gs/boilerplate_api:prod"
                  sh "docker push registry.geographica.gs/boilerplate_api:prod-${build_name}"
                  sh "ansible boilerplate-production -a '/data/app/boilerplate-api/deploy.sh'"
                } else {
                    currentBuild.result = "FAILURE"
                    error_message = "Jenkinsfile error, deploying neither staging nor prod"
                    error(error_message)
                }
          }
    } catch (error) {

        currentBuild.result = "FAILURE"
        if (["master"].contains(branch_name)) {
          echo "Sending failure mail :("
          emailext subject: "${ branch_name } - Failure #${ env.BUILD_NUMBER }", to: "${ committer_email }, ${ failure_email }", body: "Check console output at ${ env.BUILD_URL } to view the results."

          echo "${ build_name } failed: ${ error }"
        }
        throw error

    } finally {

        //stage "Cleaning"
        //echo "Cleaning TODO"
    }
}
