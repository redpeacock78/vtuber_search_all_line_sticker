#!/usr/bin/env bash

function url_encode() {
    od -An -vtx1 <<<"${@}" |
        awk 'BEGIN{ORS=""}{gsub(" ", "%", $0);print toupper($0)}'
}

function get_stickers_url() {
    touch .github/list.txt &&
        for n in {1..500}; do
            declare WORD="${*}"
            SERCH_URL="$(printf "%q" "https://store.line.me/search/sticker/ja?q=${WORD}&page=${n}")"
            STICKERS_URLS="$(node .github/get.js "${SERCH_URL//\\/}")"
            if [[ "${STICKERS_URLS}" != "" ]]; then
                echo "${STICKERS_URLS}" >>.github/list.txt &&
                    echo "Get:${n} ${SERCH_URL//\\/}"
            else
                break
            fi
        done
}

function get_stickers_url_author() {
    touch .github/list.txt &&
        for n in {1..500}; do
            declare ID="${*}"
            SERCH_URL="$(printf "%q" "https://store.line.me/stickershop/author/${ID}/ja?page=${n}")"
            STICKERS_URLS="$(node .github/get.js "${SERCH_URL//\\/}")"
            if [[ "${STICKERS_URLS}" != "" ]]; then
                echo "${STICKERS_URLS}" >>.github/list.txt &&
                    echo "Get:${n} ${SERCH_URL//\\/}"
            else
                break
            fi
        done
}

function download_stickers_data() {
    mkdir stickers &&
        sort <.github/list.txt |
        uniq |
            xargs -P4 -I@ bash -c 'node .github/dl.js stickers "@" 2>/dev/null && echo "🙌  Success: @" || echo "❌  False: @"'
}

{
    echo "⭐  Start getting URLs for all stickers in search results" &&
        if [[ "${*:1:1}" != "--author" ]]; then
            for x in "${@}"; do
                echo "🔎  Start searching for ${x} ..." &&
                    get_stickers_url "$(url_encode "${x}")"
            done
        else
            shift &&
                for x in "${@}"; do
                    echo "💫  Get Stickers ID by ${x} ..." &&
                        get_stickers_url_author "${x}"
                done
        fi &&
        echo "✅  Success - Start getting URLs for all stickers in search results" &&
        echo "⭐  Start LINE Stickers Download" &&
        echo "📦  $(sort <.github/list.txt | uniq | wc -l) Downloads started" &&
        download_stickers_data &&
        echo "✅  Success - Start LINE Stickers Download"
}
