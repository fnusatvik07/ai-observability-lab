.PHONY: help setup up down reset lab test demo
.DEFAULT_GOAL := help
PY := .venv/bin/python

help: ## Show available commands
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

setup: ## Create .venv, install dependencies, register the Jupyter kernel
	@test -f .env || cp .env.example .env
	@test -f langfuse/.env || cp langfuse/.env.example langfuse/.env
	uv venv --python 3.12 .venv || python3 -m venv .venv
	uv pip install -p .venv -r requirements.txt || .venv/bin/pip install -r requirements.txt
	$(PY) -m ipykernel install --user --name ai-observability --display-name "AI Observability (.venv)"

up: ## Start Langfuse and the OpenTelemetry Collector
	docker compose -f langfuse/docker-compose.yml --env-file langfuse/.env up -d
	docker compose -f collector/docker-compose.yml up -d
	@echo "Waiting for Langfuse on http://localhost:3000 ..."
	@until curl -sf http://localhost:3000/api/public/health >/dev/null; do sleep 3; done
	@echo "Ready. Login: admin@observability.lab / observability123"

down: ## Stop all containers (data is kept)
	docker compose -f collector/docker-compose.yml down
	docker compose -f langfuse/docker-compose.yml down

reset: ## Stop all containers and delete Langfuse data
	docker compose -f collector/docker-compose.yml down
	docker compose -f langfuse/docker-compose.yml down -v

lab: ## Open JupyterLab on the notebooks
	.venv/bin/jupyter lab notebooks/

test: ## Execute every notebook top to bottom against the running stack
	@for nb in notebooks/0*.ipynb; do \
		echo "running $$nb"; \
		.venv/bin/jupyter nbconvert --to notebook --execute --inplace \
			--ExecutePreprocessor.timeout=600 --ExecutePreprocessor.kernel_name=ai-observability $$nb || exit 1; \
	done
	@echo "all notebooks passed"

demo: ## Run the three standalone demo scripts
	cd demo && ../$(PY) langfuse_demo.py && ../$(PY) otel_demo.py && ../$(PY) langsmith_demo.py
