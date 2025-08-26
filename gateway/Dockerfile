FROM kong:latest

RUN mkdir -p /home/kong/.luarocks && chown -R kong:kong /home/kong/.luarocks
RUN luarocks install --local kong-plugin-openid-connect

COPY kong.yml /usr/local/kong/declarative/kong.yml
