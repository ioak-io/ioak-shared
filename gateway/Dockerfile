FROM kong:latest

USER root
RUN apt-get update && apt-get install -y curl git unzip && rm -rf /var/lib/apt/lists/*
RUN luarocks refresh-cache
RUN luarocks install kong-plugin-openid-connect
USER kong

COPY kong.yml /usr/local/kong/declarative/kong.yml
