@echo off
set PATH=%PATH%;C:\Users\User\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\Scripts
echo Running SAM build...
sam build
if %ERRORLEVEL% NEQ 0 goto :error

echo Running SAM deploy --guided...
sam deploy --guided
if %ERRORLEVEL% NEQ 0 goto :error

goto :end

:error
echo An error occurred during the SAM deployment process.
pause
exit /b %ERRORLEVEL%

:end
echo Deployment completed successfully!
pause 