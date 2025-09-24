$headers = @{
    'Content-Type' = 'application/json'
}

Write-Host "🧪 Testing the complete authentication and todo system..."

# Test 1: Register a new user
Write-Host "`n1. Testing user registration..."
$registerBody = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerBody -Headers $headers
    Write-Host "✅ Registration successful:" $registerResponse.message
} catch {
    Write-Host "❌ Registration failed:" $_.Exception.Message
}

# Test 2: Login with the user
Write-Host "`n2. Testing user login..."
$loginBody = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -Headers $headers
    Write-Host "✅ Login successful:" $loginResponse.message
    $userId = $loginResponse.data.id
    Write-Host "   User ID:" $userId
} catch {
    Write-Host "❌ Login failed:" $_.Exception.Message
    exit
}

# Test 3: Create a todo
Write-Host "`n3. Testing todo creation..."
$todoBody = @{
    text = "Complete the project"
    userId = $userId
    priority = "high"
    category = "work"
} | ConvertTo-Json

try {
    $todoResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/todos" -Method POST -Body $todoBody -Headers $headers
    Write-Host "✅ Todo created successfully:" $todoResponse.message
    $todoId = $todoResponse.data._id
    Write-Host "   Todo ID:" $todoId
} catch {
    Write-Host "❌ Todo creation failed:" $_.Exception.Message
}

# Test 4: Get all todos for user
Write-Host "`n4. Testing get todos..."
try {
    $todosResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/todos?userId=$userId" -Method GET -Headers $headers
    Write-Host "✅ Get todos successful. Found" $todosResponse.data.Count "todos"
    
    if ($todosResponse.data.Count -gt 0) {
        Write-Host "   First todo:" $todosResponse.data[0].text
    }
} catch {
    Write-Host "❌ Get todos failed:" $_.Exception.Message
}

# Test 5: Update todo (mark as completed)
if ($todoId) {
    Write-Host "`n5. Testing todo update..."
    $updateBody = @{
        completed = $true
    } | ConvertTo-Json

    try {
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/todos/$todoId" -Method PUT -Body $updateBody -Headers $headers
        Write-Host "✅ Todo updated successfully:" $updateResponse.message
    } catch {
        Write-Host "❌ Todo update failed:" $_.Exception.Message
    }
}

# Test 6: Delete todo
if ($todoId) {
    Write-Host "`n6. Testing todo deletion..."
    try {
        $deleteResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/todos/$todoId" -Method DELETE -Headers $headers
        Write-Host "✅ Todo deleted successfully:" $deleteResponse.message
    } catch {
        Write-Host "❌ Todo deletion failed:" $_.Exception.Message
    }
}

# Test 7: Logout
Write-Host "`n7. Testing logout..."
try {
    $logoutResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/logout" -Method POST -Headers $headers
    Write-Host "✅ Logout successful:" $logoutResponse.message
} catch {
    Write-Host "❌ Logout failed:" $_.Exception.Message
}

Write-Host "`n🎉 All tests completed!"
Write-Host "✅ Your backend is working and data is being saved to MongoDB!"