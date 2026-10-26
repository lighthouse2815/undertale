#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Bản Linux tự chứa .NET; Cloudflare không cần cài SDK hay biên dịch CLI.
if [[ -z "${UNDERTALE_MOD_CLI:-}" ]]; then
  undertale_cli_dir="$PWD/.cache/umt-0.9.2.0"
  if [[ ! -x "$undertale_cli_dir/UndertaleModCli" ]]; then
    mkdir -p "$undertale_cli_dir"
    undertale_cli_zip="$undertale_cli_dir/cli.zip"
    curl --fail --location --retry 3 \
      https://github.com/UnderminersTeam/UndertaleModTool/releases/download/0.9.2.0/UTMT_CLI_v0.9.2.0-Ubuntu.zip \
      --output "$undertale_cli_zip"
    echo "d182f00c0e5ced8d9252aa1f796374cfee077a3889a658e70b68685f9cd559c7  $undertale_cli_zip" | sha256sum --check
    unzip -q -o "$undertale_cli_zip" -d "$undertale_cli_dir"
    rm "$undertale_cli_zip"
    chmod +x "$undertale_cli_dir/UndertaleModCli"
  fi
  export UNDERTALE_MOD_CLI="$undertale_cli_dir/UndertaleModCli"
fi

npm run build:pages
