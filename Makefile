.PHONY: build-rust build-go fmt

build-rust:
	@echo "Building rust_media_compositor (requires Rust toolchain)"
	cd rust_media_compositor && cargo build --release

build-go:
	@echo "Building go_transport (requires Go toolchain)"
	cd go_transport && go build -o ../bin/go_transport ./...

fmt:
	@echo "Formatting code"
	# add format commands per-language as needed
