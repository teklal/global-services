# global-services

- `nvm use`
- `npm install`
- `npm install -g gulp`
- `bundle install`
- `gulp serve`


**Updating webfont**

- export as svg from Illustrator
- artboard names for sectors must match the collection names in `_config.yml`
- `npm install -g icon-font-generator`
- `icon-font-generator font-generator/my-icons/*.svg --name humanitarian --prefix humanitarian --html false --json false --cssfontsurl  "../fonts/" -o font-generator/icon-dist`  
- copy files to `/app/assets/fonts` and `/app/assets/styles`


### Travis-CI

Travis-CI docs for [GitHub Pages Deployment](https://docs.travis-ci.com/user/deployment/pages/). Personal access token with 'public_repo - Access public repositories' permissions created and used it in `travis encrypt GH_TOKEN=my_github_token --add env.matrix` as described in the [Travis-CI docs](https://docs.travis-ci.com/user/environment-variables#Encrypting-environment-variables).