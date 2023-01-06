FROM ubuntu:latest

RUN apt update && apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

ARG NODE_VERSIONS=14,16,17,18,19

RUN echo $NODE_VERSIONS | tr "," "\n" | xargs -I_ bash -i -c "nvm install _"

COPY envuse-4.0.0.tgz /tmp/envuse-4.0.0.tgz
