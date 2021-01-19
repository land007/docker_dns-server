const dns = require('native-dns'),
	consts = dns.consts,
	server = dns.createServer();
const fs = require('fs');
const readline = require('readline');

const DNS_SERVER = process.env['DNS_SERVER'] || '8.8.8.8';
const DNS_PORT = process.env['DNS_PORT'] || '53';
const DNS_TYPE = process.env['DNS_TYPE'] || 'udp';

var  qtype_to_name = {};
for(var name in consts.NAME_TO_QTYPE) {
	qtype_to_name[consts.NAME_TO_QTYPE[name] ] = name;
}

var DOMAIN = {A:{},NS:{},MX:{}};
//var DOMAIN = {
//		A: {
//			'www.qhkly.com': dns.A({
//				  name: 'www.qhkly.com',
//				  address: '192.168.3.21',
//				  ttl,
//			  }),
//			  'www1.qhkly.com': dns.A({
//				  name: 'www.qhkly.com',
//				  address: '192.168.3.21',
//				  ttl,
//			  })
//		},
//		MX: {
//			'www.qhkly.com': dns.MX({
//				  name: 'www.qhkly.com',
//				  address: '192.168.3.21',
//				  priority: 10,
//				  exchange: '',
//				  ttl,
//			  }),
//			  'www2.qhkly.com': dns.MX({
//				  name: 'www.qhkly.com',
//				  address: '192.168.3.21',
//				  priority: 10,
//				  exchange: '',
//				  ttl,
//			  })
//		}
//};

const processLineByLine = async function () {
  const fileStream = fs.createReadStream('zone.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  for await (const line of rl) {
//	    console.log(`Line from file: ${line}`);
    let lines = line.split(' ');
    if(lines[2] == 'IN' && lines[3] == 'A') {
    	let name = lines[0].substring(0, lines[0].length -1);
    	DOMAIN.A[name] = dns.A({
			  name: name,
			  address: lines[4],
			  ttl: lines[1]
		  });
    } else if(lines[2] == 'IN' && lines[3] == 'MX') {
        	let name = lines[0].substring(0, lines[0].length -1);
        	DOMAIN.MX[name] = dns.MX({
    			  name: name,
				  priority: lines[4],
				  exchange: lines[5],
    			  ttl: lines[1]
    		  });
    }
  }
  console.log(DOMAIN);
}

processLineByLine();
 
server.on('request', async function (request, response) {
	try {
		  let [ question ] = request.question;
		  let type = qtype_to_name[question.type];
		  let { name } = question;
		  if(DOMAIN[type]) {
			  let address = DOMAIN[type][name];
			  if(address) {
				  console.log('type', type, 'name', name);
				  response.answer.push(address);
				  response.send();
			  } else {
				  let  answer = await find_name(name, type);
				  response.answer = answer;
				  response.send();
			  }
		  } else {
			  let  answer = await find_name(name, type);
			  response.answer = answer;
			  response.send();
		  }
	} catch (e) {
		console.log('e', e);
	}
});
 
server.on('error', function (err, buff, req, res) {
  console.log(err.stack);
});
 
server.serve(53);

var find_name = function(name, type) {
	return new Promise(function(resolve, reject) {
		var question = dns.Question({
			  name,//: 'www.google.com',
			  type//: 'A',
			});

			var start = Date.now();

			var req = dns.Request({
			  question: question,
//			  server: { address: '8.8.8.8', port: 53, type: 'udp' },
			  server: { address: DNS_SERVER, port: DNS_PORT, type: DNS_TYPE },
			  timeout: 1000,
			});

			req.on('timeout', function () {
			  console.log('Timeout in making request');
			});

			req.on('message', function (err, answer) {
//			  answer.answer.forEach(function (a) {
//			    console.log(a.address);
//			  });
			  resolve(answer.answer);
			});

			req.on('end', function () {
			  var delta = (Date.now()) - start;
			  console.log('type', type, 'name', name, 'request',  delta.toString() + 'ms');
			});

			req.send();
	});
}
