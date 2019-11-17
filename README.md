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