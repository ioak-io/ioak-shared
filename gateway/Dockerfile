FROM kong:latest

USER root
RUN apt-get update && apt-get install -y curl
RUN luarocks install kong-plugin-openid-connect
USER kong

COPY kong.yml /usr/local/kong/declarative/kong.yml
