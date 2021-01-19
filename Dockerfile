FROM land007/node:latest

MAINTAINER Yiqiu Jia <yiqiujia@hotmail.com>

RUN . $HOME/.nvm/nvm.sh && cd / && npm install native-dns readline
ADD node/server.js /node_/server.js
ADD node/zone.txt /node_/zone.txt
ADD start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 53/udp

#docker build -t land007/dns-server:latest .
#> docker buildx build --platform linux/amd64,linux/arm64/v8,linux/arm/v7 -t land007/dns-server --push .
#docker run --rm -it --name dns-server -p 53:53/udp -v ~/docker/dns-server/:/node/ land007/dns-server:latest
#docker exec -it dns-server bash
#dig www.qhkly.com @127.0.0.1
#sudo killall dnsmasq
