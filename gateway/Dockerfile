FROM kong:latest

USER root
RUN mkdir -p /home/kong/.luarocks && chown -R kong:kong /home/kong/.luarocks
USER kong

RUN luarocks install --local kong-plugin-openid-connect

COPY kong.yml /usr/local/kong/declarative/kong.yml
