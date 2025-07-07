@echo off
echo Setting up Google MCP Server...
echo.

echo Installing dependencies...
npm install

echo.
echo Building TypeScript...
npm run build

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Set up Google Cloud credentials (see README.md)
echo 2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
echo 3. Add to Claude Desktop config
echo 4. Run with: npm start
echo.
pause