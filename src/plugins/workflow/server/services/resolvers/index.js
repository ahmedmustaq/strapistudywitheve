const PrintResolver = require('./printresolver.js');
const RestResolver = require('./restresolver.js');
const ChatGPTResolver = require('./chatgptresolver.js');
const ChatBatchGPTResolver = require('./chatgptbatchresolver.js');
const GeminiResolver = require('./geminiresolver.js');
const AssetResolver = require('./assetresolver.js');
const SetterResolver = require('./setterresolver.js');
const WebResolver = require('./webresolver.js');
const PDFResolver = require('./pdfresolver.js');

module.exports = { ChatBatchGPTResolver,PDFResolver,WebResolver,SetterResolver,AssetResolver,GeminiResolver,PrintResolver, RestResolver, ChatGPTResolver };
