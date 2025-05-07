#!/bin/bash

# Script para executar testes
echo "Executando testes Jest..."
npx jest

# Para executar com cobertura, descomente:
# echo "Executando testes com cobertura..."
# npx jest --coverage

# Para executar em modo watch, descomente:
# echo "Executando testes em modo watch..."
# npx jest --watch