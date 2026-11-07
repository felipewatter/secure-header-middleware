'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {default:secureHeaders}=require('../dist/index.js');

function run(options, request={secure:true}){
  const headers=new Map();let nextCalls=0;
  secureHeaders(options)(request,{setHeader:(name,value)=>headers.set(name.toLowerCase(),value)},()=>nextCalls++);
  assert.equal(nextCalls,1);
  return headers;
}

test('untrusted forwarded TLS header never enables HSTS',()=>{
  const headers=run(undefined,{secure:false,headers:{'x-forwarded-proto':'https'},socket:{encrypted:false}});
  assert.equal(headers.has('strict-transport-security'),false);
});

test('genuine TLS socket enables HSTS without Express secure flag',()=>{
  assert.equal(run(undefined,{secure:false,socket:{encrypted:true}}).get('strict-transport-security'),'max-age=31536000');
});

test('HSTS preload is explicit and requires a one-year floor',()=>{
  assert.throws(()=>secureHeaders({strictTransportSecurity:{preload:true,maxAgeSeconds:31536000}}),TypeError);
  assert.throws(()=>secureHeaders({strictTransportSecurity:{preload:true,includeSubDomains:true,maxAgeSeconds:31535999}}),TypeError);
  assert.equal(run({strictTransportSecurity:{preload:true,includeSubDomains:true,maxAgeSeconds:31536000}})
    .get('strict-transport-security'),'max-age=31536000; includeSubDomains; preload');
});

test('CSP and permissions header length and control character bounds are strict',()=>{
  assert.throws(()=>secureHeaders({contentSecurityPolicy:'x'.repeat(8193)}),TypeError);
  assert.throws(()=>secureHeaders({permissionsPolicy:'camera=()\u0000Injected: yes'}),TypeError);
  assert.equal(run({contentSecurityPolicy:'x'.repeat(8192)}).get('content-security-policy').length,8192);
});

test('explicitly opted-out defenses are absent rather than empty values',()=>{
  const headers=run({xFrameOptions:false,referrerPolicy:false,strictTransportSecurity:false});
  assert.equal(headers.has('x-frame-options'),false);
  assert.equal(headers.has('referrer-policy'),false);
  assert.equal(headers.has('strict-transport-security'),false);
  assert.equal(headers.get('x-content-type-options'),'nosniff');
});
