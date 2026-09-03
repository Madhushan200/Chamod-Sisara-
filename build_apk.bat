@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=C:\Program Files\Android\Android Studio\jbr\bin;%PATH%"
echo Using JAVA_HOME=%JAVA_HOME%
cd /d "%~dp0android"
call gradlew.bat assembleDebug --init-script init.gradle --stacktrace
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo SUCCESS! APK GENERATED AT:
    echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================================
) else (
    echo BUILD FAILED with error code %ERRORLEVEL%
)
