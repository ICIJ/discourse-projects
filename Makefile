install_yarn: 
		yarn install

install_bundle:
		bundle install

install: install_yarn install_bundle

rubocop: 
		bundle exec rubocop

eslint: 
		yarn run lint

ember:
		yarn run ember

prettier:
		yarn run prettier:assets

lint: eslint prettier ember rubocop 
