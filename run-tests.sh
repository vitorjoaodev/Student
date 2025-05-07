#!/bin/bash

# Script para executar testes
echo "Executando testes Jest..."
npx jest --config=jest.config.cjs

# Para executar com cobertura, descomente:
# echo "Executando testes com cobertura..."
# npx jest --config=jest.config.cjs --coverage

# Para executar em modo watch, descomente:
# echo "Executando testes em modo watch..."
# npx jest --config=jest.config.cjs --watch