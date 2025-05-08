@echo off
set PATH=%PATH%;C:\Users\User\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\Scripts

echo Deleting existing stack...
aws cloudformation delete-stack --stack-name youtube-mp3-converter-stack

echo Waiting for stack deletion (30 seconds)...
timeout /t 30

echo Running SAM build...
sam build

echo Running SAM deploy...
set STACK_NAME=youtube-mp3-converter-stack
set AWS_REGION=us-east-1
set STAGE=dev
sam deploy --stack-name %STACK_NAME% --region %AWS_REGION% --parameter-overrides Stage=%STAGE% --capabilities CAPABILITY_IAM --no-confirm-changeset --resolve-s3

echo Deployment completed.
pause 