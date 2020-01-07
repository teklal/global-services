# global-services

## Updating/editing a service

TODO

## Adding a new service page

TODO

## Updating/editing a sector

### Sector page layout

Each sector has a `*.html` file in each of the language folders inside `/app/`. For example `/app/en/health.html`, `/app/es/health.html`, and `/app/en/shelter.html`.

There are templated page elements that can be included or removed by adding or deleting lines in the html files.
The available elements are in the `/app/_includes/` folder and are currently: `coming-soon.html`, `sector-about.html`, `sector-resources.html`, `sector-rpp.html`, and `sector-services.html`. An element can be included using the following syntax:
```
{% include sector-about.html %}
```

#### The `coming-soon.html` element

TODO

#### The `sector-about.html` element

TODO

#### The `sector-resources.html` element

TODO

#### The `sector-rpp.html` element

TODO

#### The `sector-services.html` element

TODO


## Adding a new sector page

- in `_config.yml` add another block to the `collections:` section, for example
```
  livelihood:
    output: true
    en: 
      url: "/livelihood/"
    es: 
      url: "/es/livelihood/"
```
- the first line is the sector identifier (`livelihood` above)
- add a new file (with the same name as the new sector identifier) to each language folder, e.g. `livelihood.html`
  - edit the `identifier`, and `lang` values in the YAML front matter for each file
  - change the sector name in the `assign sector` line to match the new sector
  - change the "include" lines as desired to adjust the layout and included page elements
- create a new folder in `./app/services/` with an underscore followed by the sector identifier, e.g. `./app/services/_livelihood`
- follow the directions for "Adding a new service page"
- need to adjust each `*.yml` language file in `./app/_data/`

## Adding or editing sector icons

- The sector icons are displayed using a webfont.
- In the `font-generator/my-icons/` folder is an Illustrator file with all icons and and `svg` of each.
- export as svg from Illustrator
- artboard names for sectors must match the collection names in `_config.yml`
- `npm install -g icon-font-generator`
- `icon-font-generator font-generator/my-icons/*.svg --name humanitarian --prefix humanitarian --html false --json false --cssfontsurl  "../fonts/" -o font-generator/icon-dist`  
- copy files to `/app/assets/fonts` and `/app/assets/styles`

## Editing the images in the gallery on a service page

It is possible to quickly resize images and create thumbnails using ImageMagick.
To install on OSX, download [HomeBrew](https://brew.sh/) and then run:
```
brew install imagemagick
```

ImageMagick depends on Ghostscript fonts. To install them, type:
```
brew install ghostscript
```

Copy the images into a temporary folder and use a batch renaming utility, I like [NameChanger](https://mrrsoftware.com/namechanger/), to change the image names to match the services filename with an underscore and 2 digit number appended to the end. For example `assessment-cell_01.jpg`. To resize and change the file format to `jpg` run the following in the temp folder:
```
mogrify -format jpg -resize 1200x1200\> *
```
Delete the old file format version of any duplicates created by saving as `jpg`.

Make a copy of all the images in the same folder and use the batch renaming utility to append an `_thumb` to the end of all the files. On OSX, the copy/paste will make duplicate files that names such as `assessment-cell_01 copy.jpg` and you can use NameChanger's "Replace First Occurrence With" to replace " copy" with "\_thumb". To resize the thumbnails run:
```
mogrify  -format jpg -auto-orient -thumbnail 300x300\> -unsharp 0x.5  '*_thumb.*'
```

Copy the set of images (large and thumbnails) into the appropriate sector folder in `app/assets/img/`, for example `app/assets/img/assessment`.

In the YAML front matter of a services file, you can add images to the gallery by following this format:

```
pictures:
- file: /cash/cash-cbi_01.jpg
  thumb: /cash/cash-cbi_01_thumb.jpg
  caption: "Lao RC"
- file: /cash/cash-cbi_02.jpg
  thumb: /cash/cash-cbi_02_thumb.jpg
  caption: "Bangladesh"
```

## Adding a language

TODO

## Development environment

- Suggested to install [Node Version Manager](https://github.com/nvm-sh/nvm). 
  - `nvm use`
- `npm install` (will automatically run `bundle install` as well)
- `npm install -g gulp`
- To run a test server: `gulp serve`

## Production

The site builds automatically using Travis-CI. When changes are pushed to the `publish` branch, the site will be built and then the contents of `_site` will be pushed to the `gh-pages` branch.

Travis-CI docs for [GitHub Pages Deployment](https://docs.travis-ci.com/user/deployment/pages/). Personal access token with 'public_repo - Access public repositories' permissions created and used it in `travis encrypt GH_TOKEN=my_github_token --add env.matrix` as described in the [Travis-CI docs](https://docs.travis-ci.com/user/environment-variables#Encrypting-environment-variables).