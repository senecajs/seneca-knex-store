FROM alpine

# Install SQLite
RUN apk add --no-cache sqlite

ADD dbschema.sql /docker-entrypoint-initdb.d

COPY mydb.sqlite ../../../data

# Set the default port for the SQLite service
EXPOSE 5434