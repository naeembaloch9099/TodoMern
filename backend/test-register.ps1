$body = @{
    name = "Test User"
    email = "test@example.com" 
    password = "Test123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10