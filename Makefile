install:
		bundle install

rubocop: 
		bundle exec rubocop

eslint: 
		yarn run lint

ember:
		yarn run ember

prettier:
		yarn run prettier:assets

lint: eslint prettier ember rubocop 
