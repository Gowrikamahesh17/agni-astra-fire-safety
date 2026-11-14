PYTHON ?= python

.PHONY: data model examples test lint all

data:
	$(PYTHON) -m ffd_data.export

model:
	$(PYTHON) -m ml.export_model

examples:
	$(PYTHON) -m ffd_data.examples

test:
	$(PYTHON) -m pytest

lint:
	$(PYTHON) -m ruff check src ml tests

all: data model examples test
