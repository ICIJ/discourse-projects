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
		pnpm run ember

prettier:
		pnpm run prettier:assets
		pnpm run prettier:test

prettier-fix:
		pnpm run prettier:assets:fix
		pnpm run prettier:test:fix

lint: eslint prettier ember rubocop 
lint-fix: eslint-fix prettier-fix ember rubocop-fix
