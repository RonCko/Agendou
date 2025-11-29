# 🚀 Script de Inicialização Rápida - Agendou

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AGENDOU - Sistema de Agendamentos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node -v 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js não encontrado! Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OPÇÕES DE INICIALIZAÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Instalar dependências do BACKEND" -ForegroundColor White
Write-Host "2. Instalar dependências do FRONTEND" -ForegroundColor White
Write-Host "3. Instalar TUDO (Backend + Frontend)" -ForegroundColor White
Write-Host "4. Iniciar BACKEND" -ForegroundColor White
Write-Host "5. Iniciar FRONTEND" -ForegroundColor White
Write-Host "6. Iniciar TUDO (Backend + Frontend em 2 terminais)" -ForegroundColor White
Write-Host "7. Verificar status dos servidores" -ForegroundColor White
Write-Host "8. Sair" -ForegroundColor White
Write-Host ""

$opcao = Read-Host "Escolha uma opção (1-8)"

switch ($opcao) {
    "1" {
        Write-Host ""
        Write-Host "📦 Instalando dependências do BACKEND..." -ForegroundColor Yellow
        Set-Location backend
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend pronto!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro ao instalar backend" -ForegroundColor Red
        }
        Set-Location ..
    }
    "2" {
        Write-Host ""
        Write-Host "📦 Instalando dependências do FRONTEND..." -ForegroundColor Yellow
        Set-Location frontend
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend pronto!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro ao instalar frontend" -ForegroundColor Red
        }
        Set-Location ..
    }
    "3" {
        Write-Host ""
        Write-Host "📦 Instalando TODAS as dependências..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "► Backend..." -ForegroundColor Cyan
        Set-Location backend
        npm install
        Set-Location ..
        Write-Host ""
        Write-Host "► Frontend..." -ForegroundColor Cyan
        Set-Location frontend
        npm install
        Set-Location ..
        Write-Host ""
        Write-Host "✅ Tudo instalado com sucesso!" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "🚀 Iniciando BACKEND..." -ForegroundColor Yellow
        Write-Host "📍 URL: http://localhost:3333" -ForegroundColor Cyan
        Write-Host ""
        Set-Location backend
        npm run dev
        Set-Location ..
    }
    "5" {
        Write-Host ""
        Write-Host "🚀 Iniciando FRONTEND..." -ForegroundColor Yellow
        Write-Host "📍 URL: http://localhost:5173" -ForegroundColor Cyan
        Write-Host ""
        Set-Location frontend
        npm run dev
        Set-Location ..
    }
    "6" {
        Write-Host ""
        Write-Host "🚀 Iniciando Backend e Frontend..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  ATENÇÃO: Serão abertos 2 novos terminais!" -ForegroundColor Yellow
        Write-Host ""
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 BACKEND - http://localhost:3333' -ForegroundColor Cyan; npm run dev"
        Start-Sleep -Seconds 2
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 FRONTEND - http://localhost:5173' -ForegroundColor Cyan; npm run dev"
        Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📍 Backend:  http://localhost:3333" -ForegroundColor Cyan
        Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
    }
    "7" {
        Write-Host ""
        Write-Host "🔍 Verificando servidores..." -ForegroundColor Yellow
        Write-Host ""
        
        # Verificar backend
        try {
            $backend = Invoke-WebRequest -Uri "http://localhost:3333/api" -UseBasicParsing -TimeoutSec 2
            Write-Host "✅ Backend ONLINE (porta 3333)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Backend OFFLINE" -ForegroundColor Red
        }
        
        # Verificar frontend
        try {
            $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2
            Write-Host "✅ Frontend ONLINE (porta 5173)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Frontend OFFLINE" -ForegroundColor Red
        }
    }
    "8" {
        Write-Host ""
        Write-Host "👋 Até logo!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "❌ Opção inválida!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
