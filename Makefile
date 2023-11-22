install_yarn: 
		yarn install

install_bundle:
		bundle install

install: install_yarn install_bundle

rubocop: 
		bundle exec rubocop

rubocop-fix: 
		bundle exec rubocop -A

eslint: 
		yarn run lint

eslint-fix: 
		yarn run lint:fix

ember:
		yarn run ember

prettier:
		yarn run prettier:assets
		yarn run prettier:test

prettier-fix:
		yarn run prettier:assets:fix
		yarn run prettier:test:fix

lint: eslint prettier ember rubocop 
lint-fix: eslint-fix prettier-fix ember rubocop-fix
