FROM kong:latest

USER root
RUN apk add --no-cache curl
RUN luarocks install kong-plugin-openid-connect
USER kong

COPY kong.yml /usr/local/kong/declarative/kong.yml
