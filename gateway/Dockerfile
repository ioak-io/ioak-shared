FROM kong:latest

RUN luarocks install --local kong-plugin-openid-connect

COPY kong.yml /usr/local/kong/declarative/kong.yml
