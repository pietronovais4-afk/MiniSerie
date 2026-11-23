<#
.SYNOPSIS
    DRAMIX — Servidor Backend HTTP & Servidor de Arquivos Estáticos
.DESCRIPTION
    Servidor local em PowerShell utilizando System.Net.HttpListener para hospedar a aplicação DRAMIX
    e fornecer suporte a APIs REST na porta 8080.
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File server.ps1
#>

param(
    [int]$Port = 8080
)

$Host.UI.RawUI.WindowTitle = "DRAMIX Backend Server — Porta $Port"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DRAMIX — STREAMING DE MINISSÉRIES VERTICAIS            " -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Inicializando servidor HTTP em http://127.0.0.1:$Port/ ..." -ForegroundColor Yellow

$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }

$listener = New-Object System.Net.HttpListener
$prefix = "http://127.0.0.1:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "Erro ao iniciar na porta $Port. Tentando porta 8081..." -ForegroundColor Red
    $Port = 8081
    $listener = New-Object System.Net.HttpListener
    $prefix = "http://127.0.0.1:$Port/"
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "Servidor ativo com sucesso!" -ForegroundColor Green
Write-Host "Acesse no navegador: $prefix" -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para encerrar o servidor.`n" -ForegroundColor Gray

# Mapeamento MIME
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".mp4"  = "video/mp4"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $rawUrl = $request.Url.LocalPath
        if ($rawUrl -eq "/" -or [string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = "/index.html"
        }

        # Trata requisição de API Mock / Healthcheck
        if ($rawUrl -eq "/api/health") {
            $json = '{"status":"online","service":"DRAMIX Streaming API","timestamp":"' + (Get-Date -Format o) + '"}'
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentType = "application/json; charset=utf-8"
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        $filePath = Join-Path $baseDir ($rawUrl.TrimStart('/'))

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $mime = $mimeTypes[$ext]
            }

            try {
                $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $mime
                $response.StatusCode = 200
                $response.ContentLength64 = $fileBytes.Length
                $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
                Write-Host "[$($request.HttpMethod)] 200 OK: $rawUrl" -ForegroundColor DarkGray
            } catch {
                $response.StatusCode = 500
                Write-Host "[$($request.HttpMethod)] 500 Error: $rawUrl" -ForegroundColor Red
            }
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Arquivo não encontrado no DRAMIX")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            Write-Host "[$($request.HttpMethod)] 404 Not Found: $rawUrl" -ForegroundColor Yellow
        }

        $response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
    Write-Host "Servidor encerrado." -ForegroundColor Yellow
}
