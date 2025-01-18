FROM mongo:6.0.20-jammy

COPY ./init-mongo.js /docker-entrypoint-initdb.d/init-mongo.js

EXPOSE 27017

CMD ["mongod"]
