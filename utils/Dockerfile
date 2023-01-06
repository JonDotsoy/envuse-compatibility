FROM ubuntu:latest

RUN apt update && apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
RUN bash -i -c "nvm install 19"
RUN bash -i -c "nvm install 18"
RUN bash -i -c "nvm install 16"
RUN bash -i -c "nvm install 14"

# Configure auto load nvm

# ADD https://gist.githubusercontent.com/JonDotsoy/0b142e9da1979470422efbee818ab79d/raw/99d49ba3c015ee159569036e4a3794ab0b37aa1c/auto-nvm.bash /tmp/auto-nvm.bash

# RUN cat /tmp/auto-nvm.bash > ~/.bashrc

