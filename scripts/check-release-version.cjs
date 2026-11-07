#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const ref = process.argv[2] || '';
const semver = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
assert.match(ref, semver, 'Expected a SemVer release tag');
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
if (ref.slice(ref.startsWith('v') ? 1 : 0) !== version) {
  console.error('Release rejected: tag '+ref+' does not match package.json version '+version);
  process.exit(1);
}
console.log('Release version is consistent: '+ref+' and package.json '+version);
