PYTHON ?= python3
VENV := .venv
VENV_PYTHON := $(VENV)/bin/python
VENV_PIP := $(VENV)/bin/pip
VENV_STAMP := $(VENV)/.requirements-installed
NPM_STAMP := node_modules/.package-lock.json

.PHONY: all setup tikz graphviz generate render web web-dev clean

all: generate render web

setup: $(VENV_STAMP)

$(VENV_STAMP): requirements.txt
	$(PYTHON) -m venv $(VENV)
	$(VENV_PIP) install -r requirements.txt
	touch $(VENV_STAMP)

generate: $(VENV_STAMP)
	$(VENV_PYTHON) scripts/generate_schema.py --schema P8 --format all
	$(VENV_PYTHON) scripts/generate_schema.py --schema P6 --format all
	$(VENV_PYTHON) scripts/generate_schema.py --schema R1 --format all

render:
	./scripts/render_available.sh

tikz:
	./scripts/render_tikz.sh

graphviz:
	dot -Tsvg graphviz/p8.dot -o previews/p8_graphviz.svg
	dot -Tpng graphviz/p8.dot -o previews/p8_graphviz.png
	dot -Tsvg graphviz/scenario_trace.dot -o previews/scenario_trace_graphviz.svg
	dot -Tpng graphviz/scenario_trace.dot -o previews/scenario_trace_graphviz.png
	dot -Tsvg graphviz/problem_bank.dot -o previews/problem_bank_graphviz.svg
	dot -Tpng graphviz/problem_bank.dot -o previews/problem_bank_graphviz.png

$(NPM_STAMP): package.json package-lock.json
	npm ci

web: $(NPM_STAMP)
	npm run build

web-dev: $(NPM_STAMP)
	npm run dev

clean:
	rm -f tikz/*.aux tikz/*.log tikz/*_build.log
