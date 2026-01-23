@echo off
echo Nettoyage du cache Vite et des node_modules...

cd frontend

echo Suppression du dossier .vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo Suppression du dossier dist...
if exist dist rmdir /s /q dist

echo Cache nettoyé !
echo.
echo Vous pouvez maintenant relancer: npm run dev
pause
