$filePath = "sample_student_upload.csv"
$uri = "http://localhost:5000/api/students/upload"

# Create a multipart form
$boundary = [System.Guid]::NewGuid().ToString()
$fileContent = [System.IO.File]::ReadAllBytes($filePath)
$fileName = [System.IO.Path]::GetFileName($filePath)

# Build multipart form data
$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
    "Content-Type: text/csv",
    "",
    [System.Text.Encoding]::UTF8.GetString($fileContent),
    "--$boundary--"
)

$body = $bodyLines -join "`r`n"

# Send request
try {
    $response = Invoke-WebRequest -Uri $uri -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $body
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
}
catch {
    Write-Host "Error: $_"
    Write-Host "Response: $($_.Exception.Response)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host "Error Details: $($reader.ReadToEnd())"
        $reader.Close()
    }
}
