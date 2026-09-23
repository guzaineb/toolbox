param($testName = "")
$cd = "D:\Downloads\toolbox-coaching-evaluation\toolbox-coaching-evaluation\backend"
Write-Host "Running tests in $cd"
Set-Location $cd
if ($testName) {
    Write-Host "Running: $testName"
    & .\node_modules\.bin\jest --no-coverage --testPathPatterns $testName 2>&1
} else {
    Write-Host "Running all tests"
    & .\node_modules\.bin\jest --no-coverage 2>&1
}