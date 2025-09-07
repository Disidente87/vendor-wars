import fs from 'fs';
import path from 'path';

// Leer el archivo JSON del contrato
const contractPath = path.join(process.cwd(), 'artifacts/contracts/VendorWarsExtended.sol/VendorWarsExtended.json');
const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

// Extraer solo el ABI
const abi = contractData.abi;

// Guardar el ABI en un archivo separado
const abiPath = path.join(process.cwd(), 'VendorWarsExtended.abi.json');
fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

console.log('✅ ABI extraído exitosamente!');
console.log(`📄 Archivo: ${abiPath}`);
console.log(`📊 Total de funciones: ${abi.filter(item => item.type === 'function').length}`);
console.log(`📊 Total de eventos: ${abi.filter(item => item.type === 'event').length}`);
console.log(`📊 Total de errores: ${abi.filter(item => item.type === 'error').length}`);

// Mostrar las funciones principales
console.log('\n🔧 Funciones principales:');
abi.filter(item => item.type === 'function' && item.name).forEach(func => {
  const inputs = func.inputs ? func.inputs.map(input => `${input.type} ${input.name}`).join(', ') : '';
  const outputs = func.outputs ? func.outputs.map(output => output.type).join(', ') : '';
  console.log(`   ${func.name}(${inputs}) ${func.stateMutability} ${outputs ? `returns (${outputs})` : ''}`);
});
