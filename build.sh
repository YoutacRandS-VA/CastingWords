#! /bin/bash
docker build -t castingwords .
docker-compose pull
docker-compose up -d