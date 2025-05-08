@echo off
set PATH=%PATH%;C:\Users\User\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\Scripts

echo Deleting existing stack...
aws cloudformation delete-stack --stack-name youtube-mp3-simple-stack

echo Waiting for stack deletion (30 seconds)...
timeout /t 30

echo Running SAM build with simplified template...
sam build -t simple-template.yaml

echo Running SAM deploy with simplified template...
sam deploy --template-file .aws-sam\build\template.yaml --stack-name youtube-mp3-simple-stack --capabilities CAPABILITY_IAM --resolve-s3 --no-confirm-changeset

echo Deployment completed.
pause 