FROM node:22-alpine
WORKDIR /app
COPY servidor.mjs .
VOLUME /dados
ENV RELOGIO_ARQUIVO=/dados/agenda.json RELOGIO_PORTA=8787
EXPOSE 8787
CMD ["node", "servidor.mjs"]
