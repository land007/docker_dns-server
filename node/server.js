const dns = require('native-dns'),
	consts = dns.consts,
	server = dns.createServer();
const fs = require('fs');
const readline = require('readline');

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

async function processLineByLine() {
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
 
server.on('request', function (request, response) {
	try {
		  let [ question ] = request.question;
		  let type = qtype_to_name[question.type];
		  let { name } = question;
		  let address = DOMAIN[type][name];
		  if(address) {
			  console.log('type', type, 'name', name);
			  response.answer.push(address);
			  response.send();
		  } else {
			  response.send();
//			  console.log('type', type, 'name', name);
		  }
	} catch (e) {
		console.log('e', e);
	}
});
 
server.on('error', function (err, buff, req, res) {
  console.log(err.stack);
});
 
server.serve(53);
