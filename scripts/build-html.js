#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sourceFile = path.join(__dirname, '../test/spot.html');
const targetFile = path.join(__dirname, '../test/spot-dev.html');

// Read the HTML file
let htmlContent = fs.readFileSync(sourceFile, 'utf8');

// Replace the placeholder with actual client ID from .env
const clientId = process.env.SPOTIFY_CLIENT_ID || '__SPOTIFY_CLIENT_ID__';
htmlContent = htmlContent.replace('__SPOTIFY_CLIENT_ID__', clientId);

// Write to development file
fs.writeFileSync(targetFile, htmlContent);

console.log(`✅ Built ${targetFile} with SPOTIFY_CLIENT_ID from .env`);
console.log(`   Client ID: ${clientId.substring(0, 8)}...`);
