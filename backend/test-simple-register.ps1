$body = @{
    name = "Test User"
    email = "test@example.com" 
    password = "password123"
} | ConvertTo-Json

Write-Host "Testing user registration..."
Write-Host "Request body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/test/register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "SUCCESS: User registration completed"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERROR: Registration failed"
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}