FROM land007/node:latest

MAINTAINER Yiqiu Jia <yiqiujia@hotmail.com>

RUN . $HOME/.nvm/nvm.sh && cd / && npm install native-dns readline
ADD node/server.js /node_/server.js
ADD node/zone.txt /node_/zone.txt
ADD start.sh /start.sh
RUN chmod +x /start.sh

ENV DNS_SERVER=8.8.8.8\
	DNS_PORT=53\
	DNS_TYPE=udp

EXPOSE 53/udp

#docker build -t land007/dns-server:latest .
#> docker buildx build --platform linux/amd64,linux/arm64/v8,linux/arm/v7 -t land007/dns-server --push .
#docker run --rm -it --name dns-server -p 30053:53/udp -v ~/docker/dns-server/:/node/ land007/dns-server:latest
#docker rm -f dns-server; docker run --restart always -it --name dns-server -p 53:53/udp -v ~/docker/dns-server/:/node/ land007/dns-server:latest
#docker exec -it dns-server bash
#dig www.qhkly.com @127.0.0.1
#dig www.qhkly.com @192.168.1.124 -p 30053
##dig www.qhkly.com @192.168.1.124 -p 30053 +tcp
#systemctl stop firewalld

#yum remove dnsmasq
#sudo killall dnsmasq
