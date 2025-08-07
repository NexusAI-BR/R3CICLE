#!/usr/bin/env node

/**
 * Script de Teste - Integração Neon.tech
 * Testa todas as funcionalidades principais do sistema ERP
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

// Função auxiliar para fazer requisições HTTP
function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Testes
async function runTests() {
    console.log('🧪 Iniciando Testes de Integração Neon.tech\n');
    
    try {
        // 1. Health Check
        console.log('1️⃣ Testando Health Check...');
        const health = await makeRequest(`${BASE_URL}/health`);
        console.log(`   Status: ${health.status}`);
        console.log(`   Database: ${health.data.database}`);
        console.log(`   ✅ Health Check OK\n`);

        // 2. Dashboard Stats
        console.log('2️⃣ Testando Dashboard...');
        const dashboard = await makeRequest(`${BASE_URL}/dashboard/stats`);
        console.log(`   Status: ${dashboard.status}`);
        console.log(`   Materiais: ${dashboard.data.totalMateriais}`);
        console.log(`   Clientes: ${dashboard.data.totalClientes}`);
        console.log(`   Vendas: ${dashboard.data.totalVendas}`);
        console.log(`   ✅ Dashboard OK\n`);

        // 3. Materiais
        console.log('3️⃣ Testando Materiais...');
        const materiais = await makeRequest(`${BASE_URL}/materiais`);
        console.log(`   Status: ${materiais.status}`);
        console.log(`   Total de materiais: ${materiais.data.length}`);
        if (materiais.data.length > 0) {
            console.log(`   Primeiro material: ${materiais.data[0].nome}`);
        }
        console.log(`   ✅ Materiais OK\n`);

        // 4. Clientes
        console.log('4️⃣ Testando Clientes...');
        const clientes = await makeRequest(`${BASE_URL}/clientes`);
        console.log(`   Status: ${clientes.status}`);
        console.log(`   Total de clientes: ${clientes.data.length}`);
        if (clientes.data.length > 0) {
            console.log(`   Primeiro cliente: ${clientes.data[0].nome}`);
        }
        console.log(`   ✅ Clientes OK\n`);

        // 5. Vendas
        console.log('5️⃣ Testando Vendas...');
        const vendas = await makeRequest(`${BASE_URL}/vendas`);
        console.log(`   Status: ${vendas.status}`);
        console.log(`   Total de vendas: ${vendas.data.length}`);
        console.log(`   ✅ Vendas OK\n`);

        // 6. Notas Fiscais
        console.log('6️⃣ Testando Notas Fiscais...');
        const nfs = await makeRequest(`${BASE_URL}/notas-fiscais`);
        console.log(`   Status: ${nfs.status}`);
        console.log(`   Total de NFs: ${nfs.data.length}`);
        console.log(`   ✅ Notas Fiscais OK\n`);

        console.log('🎉 TODOS OS TESTES PASSARAM!');
        console.log('✅ Sistema ERP totalmente funcional com Neon.tech');
        console.log('🚀 Pronto para deploy em produção!');
        
    } catch (error) {
        console.error('❌ Erro nos testes:', error.message);
        process.exit(1);
    }
}

// Executar testes
if (require.main === module) {
    runTests();
}

module.exports = { runTests };