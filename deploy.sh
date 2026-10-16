#!/bin/sh
# Publica o dist na branch gh-pages (o token do gh nesta máquina não tem escopo `workflow`, então nada de Actions).
set -e
npm run build
touch dist/.nojekyll
cd dist
git init -q -b gh-pages
git add -A
git -c user.name="Lucas Cabral" -c user.email="61991370+lucasaraujocabra@users.noreply.github.com" commit -qm "deploy $(date +%Y-%m-%dT%H:%M)"
git push -qf https://github.com/lucasaraujocabra/bullscash-dashboard-v2.git gh-pages
rm -rf .git
echo "publicado: https://lucasaraujocabra.github.io/bullscash-dashboard-v2/"
