install_pnpm: 
		pnpmm install

install_bundle:
		bundle install

install: install_pnpm install_bundle

rubocop: 
		bundle exec rubocop

rubocop-fix: 
		bundle exec rubocop -A

eslint: 
		pnpm run lint

eslint-fix: 
		pnpm run lint:fix

ember:
		pnpm run lint:ember

ember-fix:
		pnpm run lint:ember:fix

prettier:
		pnpm run lint:prettier

prettier-fix:
		pnpm run lint:prettier:fix

lint: eslint prettier ember rubocop 
lint-fix: eslint-fix prettier-fix ember rubocop-fix
