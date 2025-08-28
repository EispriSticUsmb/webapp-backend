#!/bin/sh

set -ex
npx prisma migrate deploy
npx nest start