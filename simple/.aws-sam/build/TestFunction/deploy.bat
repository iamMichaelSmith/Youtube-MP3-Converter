@echo off
set PATH=%PATH%;C:\Users\User\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\Scripts

cd simple

echo Deleting existing stack...
aws cloudformation delete-stack --stack-name youtube-mp3-simple-stack

echo Waiting for stack deletion (15 seconds)...
timeout /t 15

echo Running SAM build...
sam build

echo Running SAM deploy...
sam deploy --stack-name youtube-mp3-simple-stack --capabilities CAPABILITY_IAM --resolve-s3 --no-confirm-changeset

echo Deployment completed.
pause 