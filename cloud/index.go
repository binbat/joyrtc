//go:build !release

package main

import "embed"

//go:embed index.html
var dist embed.FS
