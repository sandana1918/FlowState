#!/usr/bin/env sh
docker run -d --name flowstate-nginx-demo nginx:alpine
docker run -d --name flowstate-redis-demo redis:7-alpine

