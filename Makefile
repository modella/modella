
test:
	@./node_modules/.bin/mocha \
		--reporter spec

components: component.json
		@component install --dev

dist: components dist-build dist-minify

dist-build:
	@component build -s modella -o dist -n modella

dist-minify: dist/modella.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://closure-compiler.appspot.com/compile \
		> $<.tmp
	@mv $<.tmp dist/modella.min.js

.PHONY: test
